import { execFileSync, spawn, spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("..", import.meta.url));
const cli = path.join(root, "proxy", "bya-trace.mjs");
const mockServer = path.join(root, "tests", "fixtures", "mock-mcp-server.mjs");

type JsonRpcMessage = Record<string, any>;

interface RecorderResult {
  status: number | null;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
}

async function runRecorder(
  configFile: string,
  messages: JsonRpcMessage[],
  logFile: string,
  extraEnvironment: NodeJS.ProcessEnv = {},
): Promise<RecorderResult> {
  const child = spawn(
    process.execPath,
    [cli, "record", "--config", configFile, "--", process.execPath, mockServer],
    {
      cwd: root,
      env: { ...process.env, BYA_MOCK_LOG: logFile, ...extraEnvironment },
      stdio: ["pipe", "pipe", "pipe"],
    },
  );
  let stdout = "";
  let stderr = "";
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stdout.on("data", (chunk: string) => {
    stdout += chunk;
  });
  child.stderr.on("data", (chunk: string) => {
    stderr += chunk;
  });

  for (const message of messages) child.stdin.write(`${JSON.stringify(message)}\n`);
  child.stdin.end();

  return await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("bya-trace test process did not exit"));
    }, 5_000);
    child.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.once("close", (status, signal) => {
      clearTimeout(timeout);
      resolve({ status, signal, stdout, stderr });
    });
  });
}

function jsonLines(contents: string): JsonRpcMessage[] {
  return contents
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));
}

function responseWithId(messages: JsonRpcMessage[], id: number): JsonRpcMessage {
  const response = messages.find((message) => message.id === id);
  expect(response, `missing JSON-RPC response ${id}`).toBeDefined();
  return response!;
}

describe("bya-trace MCP recorder", () => {
  it("passes MCP traffic bidirectionally, withholds drill failures, and persists a verifiable chain", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "bya-trace-"));
    const receiptFile = path.join(directory, "receipts.jsonl");
    const logFile = path.join(directory, "forwarded.jsonl");
    const configFile = path.join(directory, "bya.config.json");
    await writeFile(
      configFile,
      JSON.stringify({
        lessonObjective: "Practice supervising read-only support data access.",
        allow: ["read", "search"],
        deny: ["send", "delete", "publish"],
        restrictedDomains: ["blocked.example"],
        maxExternalRecipients: 0,
        receiptFile,
      }),
    );

    try {
      const firstRun = await runRecorder(
        configFile,
        [
          {
            jsonrpc: "2.0",
            id: 1,
            method: "initialize",
            params: {
              protocolVersion: "2025-06-18",
              clientInfo: { name: "test-client", version: "1.0.0" },
              _bya: { drill: "metadata must stay local" },
            },
          },
          {
            jsonrpc: "2.0",
            id: 2,
            method: "tools/call",
            params: {
              name: "support.read",
              arguments: {
                operation: "read",
                target: "ticket-42",
                nested: { keep: true, _bya: { private: true } },
                _bya: {
                  effect: "Read ticket 42",
                  provenance: { source: "learner plan", trust: "trusted" },
                },
              },
            },
          },
          {
            jsonrpc: "2.0",
            id: 3,
            method: "tools/call",
            params: {
              name: "mail.send",
              arguments: {
                operation: "send",
                recipient: "collector@blocked.example",
                recipientCount: 1,
                external: true,
                _bya: {
                  effect: "Send ticket 42 outside the drill workspace",
                  provenance: { source: "injected message", trust: "untrusted" },
                },
              },
            },
          },
          {
            jsonrpc: "2.0",
            id: 4,
            method: "tools/call",
            params: {
              name: "workspace.archive",
              arguments: {
                operation: "read",
                target: "ticket-42",
                _bya: { effect: "Archive ticket 42 despite its misleading read label" },
              },
            },
          },
        ],
        logFile,
        { BYA_RECEIPT_FILE: receiptFile, BYA_MOCK_SPLIT_OUTPUT: "1" },
      );

      expect(firstRun.status).toBe(0);
      expect(firstRun.stderr).toBe("");
      const responses = jsonLines(firstRun.stdout);
      expect(responseWithId(responses, 1).result.serverInfo.name).toBe("bya-trace-mock");

      const allowed = responseWithId(responses, 2);
      expect(allowed.result.structuredContent.receivedArguments).toEqual({
        operation: "read",
        target: "ticket-42",
        nested: { keep: true },
      });
      expect(allowed.result.structuredContent.receiptsAtReceive).toBeGreaterThanOrEqual(1);

      const blocked = responseWithId(responses, 3);
      expect(blocked.result.structuredContent).toMatchObject({
        decision: "blocked",
        forwardedToServer: false,
        sideEffectsOccurred: false,
      });
      expect(blocked.result.isError).toBe(true);

      const review = responseWithId(responses, 4);
      expect(review.result.structuredContent).toMatchObject({
        decision: "review",
        forwardedToServer: false,
        sideEffectsOccurred: false,
      });
      expect(review.result.content[0].text).toContain("withheld for review");

      const forwarded = jsonLines(await readFile(logFile, "utf8"));
      expect(forwarded.map((message) => message.id)).toEqual([1, 2]);
      expect(JSON.stringify(forwarded)).not.toContain("_bya");

      const firstReceipts = jsonLines(await readFile(receiptFile, "utf8"));
      expect(firstReceipts.map((receipt) => receipt.evaluation.decision)).toEqual([
        "allowed",
        "blocked",
        "review",
      ]);
      expect(firstReceipts[0].previousHash).toBe("GENESIS");
      expect(firstReceipts[1].previousHash).toBe(firstReceipts[0].receiptHash);
      expect(firstReceipts[2].previousHash).toBe(firstReceipts[1].receiptHash);
      expect(firstReceipts[0].enforcement).toEqual({
        requestForwarding: "authorized",
        downstreamOutcome: "not_observed",
      });

      const secondRun = await runRecorder(
        configFile,
        [
          {
            jsonrpc: "2.0",
            id: 5,
            method: "tools/call",
            params: { name: "support.read", arguments: { operation: "read", target: "ticket-43" } },
          },
        ],
        logFile,
        { BYA_RECEIPT_FILE: receiptFile },
      );
      expect(secondRun.status).toBe(0);
      expect(responseWithId(jsonLines(secondRun.stdout), 5).result.isError).toBe(false);

      const allReceipts = jsonLines(await readFile(receiptFile, "utf8"));
      expect(allReceipts).toHaveLength(4);
      expect(allReceipts[3].sequence).toBe(4);
      expect(allReceipts[3].previousHash).toBe(allReceipts[2].receiptHash);
      for (const receipt of allReceipts) expect(receipt.receiptHash).toMatch(/^[a-f0-9]{64}$/);

      const verification = spawnSync(process.execPath, [cli, "verify", "--receipts", receiptFile], {
        cwd: root,
        encoding: "utf8",
      });
      expect(verification.status).toBe(0);
      expect(JSON.parse(verification.stdout)).toMatchObject({
        valid: true,
        count: 4,
        headHash: allReceipts[3].receiptHash,
      });

      const replay = spawnSync(process.execPath, [cli, "replay", "--receipts", receiptFile], {
        cwd: root,
        encoding: "utf8",
      });
      expect(replay.status).toBe(0);
      const replayReport = JSON.parse(replay.stdout);
      expect(replayReport.events.map((event: JsonRpcMessage) => event.decision)).toEqual([
        "allowed",
        "blocked",
        "review",
        "allowed",
      ]);
      expect(replayReport.events[0].downstreamOutcome).toBe("not_observed");

      const tamperedFile = path.join(directory, "tampered.jsonl");
      allReceipts[1].evaluation.reason = "tampered after the drill";
      await writeFile(tamperedFile, `${allReceipts.map((receipt) => JSON.stringify(receipt)).join("\n")}\n`);
      const tampered = spawnSync(process.execPath, [cli, "verify", "--receipts", tamperedFile], {
        cwd: root,
        encoding: "utf8",
      });
      expect(tampered.status).toBe(1);
      expect(JSON.parse(tampered.stdout)).toMatchObject({ valid: false });
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it("propagates the drill server exit status", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "bya-trace-exit-"));
    const configFile = path.join(directory, "bya.config.json");
    await writeFile(configFile, JSON.stringify({ receiptFile: path.join(directory, "receipts.jsonl") }));
    try {
      const result = await runRecorder(configFile, [], path.join(directory, "forwarded.jsonl"), {
        BYA_MOCK_EXIT_CODE: "17",
      });
      expect(result.status).toBe(17);
      expect(result.stderr).toContain("MCP drill server exited with code 17");
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it("classifies nested destinations and enforces restricted hostnames without substring matches", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "bya-trace-destinations-"));
    const receiptFile = path.join(directory, "receipts.jsonl");
    const logFile = path.join(directory, "forwarded.jsonl");
    const configFile = path.join(directory, "bya.config.json");
    await writeFile(
      configFile,
      JSON.stringify({
        lessonObjective: "Practice checking destinations inside nested tool arguments.",
        allow: ["read"],
        deny: [],
        restrictedDomains: ["blocked.example"],
        maxExternalRecipients: 0,
        receiptFile,
      }),
    );

    try {
      const result = await runRecorder(
        configFile,
        [
          {
            jsonrpc: "2.0",
            id: 21,
            method: "tools/call",
            params: {
              name: "support.read",
              arguments: {
                operation: "read",
                options: { export: { url: "https://blocked.example/synthetic-ticket-21" } },
              },
            },
          },
          {
            jsonrpc: "2.0",
            id: 22,
            method: "tools/call",
            params: {
              name: "support.read",
              arguments: {
                operation: "read",
                options: { routing: { domain: "subdomain.blocked.example" } },
              },
            },
          },
          {
            jsonrpc: "2.0",
            id: 23,
            method: "tools/call",
            params: {
              name: "support.read",
              arguments: {
                operation: "read",
                options: { source: { url: "https://reference.safe.example/synthetic-ticket-23" } },
              },
            },
          },
          {
            jsonrpc: "2.0",
            id: 24,
            method: "tools/call",
            params: {
              name: "support.read",
              arguments: {
                operation: "read",
                options: { source: { url: "https://blocked.example.safe.example/synthetic-ticket-24" } },
              },
            },
          },
          {
            jsonrpc: "2.0",
            id: 25,
            method: "tools/call",
            params: {
              name: "support.read",
              arguments: {
                operation: "read",
                target: "collector@blocked.example",
              },
            },
          },
        ],
        logFile,
      );

      expect(result.status).toBe(0);
      const responses = jsonLines(result.stdout);
      for (const id of [21, 22, 25]) {
        expect(responseWithId(responses, id).result.structuredContent).toMatchObject({
          decision: "blocked",
          forwardedToServer: false,
        });
      }
      for (const id of [23, 24]) {
        expect(responseWithId(responses, id).result.isError).toBe(false);
      }

      const receipts = jsonLines(await readFile(receiptFile, "utf8"));
      expect(receipts.map((receipt) => receipt.action.external)).toEqual([true, true, true, true, true]);
      expect(receipts.map((receipt) => receipt.action.externalHosts)).toEqual([
        ["blocked.example"],
        ["subdomain.blocked.example"],
        ["reference.safe.example"],
        ["blocked.example.safe.example"],
        ["blocked.example"],
      ]);
      expect(receipts.map((receipt) => receipt.evaluation.decision)).toEqual([
        "blocked",
        "blocked",
        "allowed",
        "allowed",
        "blocked",
      ]);

      const forwarded = jsonLines(await readFile(logFile, "utf8"));
      expect(forwarded.map((message) => message.id)).toEqual([23, 24]);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it("reclaims a receipt lock whose owning process no longer exists", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "bya-trace-stale-lock-"));
    const receiptFile = path.join(directory, "receipts.jsonl");
    const lockFile = `${receiptFile}.lock`;
    const logFile = path.join(directory, "forwarded.jsonl");
    const configFile = path.join(directory, "bya.config.json");
    await writeFile(configFile, JSON.stringify({ receiptFile }));
    await writeFile(lockFile, JSON.stringify({ pid: 2_147_483_647, startedAt: "2000-01-01T00:00:00.000Z" }));

    try {
      const result = await runRecorder(configFile, [], logFile);
      expect(result.status).toBe(0);
      await expect(stat(lockFile)).rejects.toMatchObject({ code: "ENOENT" });
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it("recognizes explicit compare and preview capabilities without trusting a misleading operation label", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "bya-trace-read-only-"));
    const receiptFile = path.join(directory, "receipts.jsonl");
    const logFile = path.join(directory, "forwarded.jsonl");
    const configFile = path.join(directory, "bya.config.json");
    await writeFile(
      configFile,
      JSON.stringify({
        lessonObjective: "Practice distinguishing previews from destructive actions.",
        allow: ["compare", "preview"],
        deny: ["delete"],
        restrictedDomains: [],
        maxExternalRecipients: 0,
        receiptFile,
      }),
    );

    try {
      const result = await runRecorder(
        configFile,
        [
          {
            jsonrpc: "2.0",
            id: 31,
            method: "tools/call",
            params: {
              name: "catalog.compare",
              arguments: { operation: "compare", target: "synthetic-shortlist" },
            },
          },
          {
            jsonrpc: "2.0",
            id: 32,
            method: "tools/call",
            params: {
              name: "workspace.preview",
              arguments: { operation: "preview", target: "synthetic-cleanup-plan" },
            },
          },
          {
            jsonrpc: "2.0",
            id: 33,
            method: "tools/call",
            params: {
              name: "workspace.delete",
              arguments: { operation: "preview", target: "synthetic-worktree" },
            },
          },
        ],
        logFile,
      );

      expect(result.status).toBe(0);
      const responses = jsonLines(result.stdout);
      expect(responseWithId(responses, 31).result.isError).toBe(false);
      expect(responseWithId(responses, 32).result.isError).toBe(false);
      expect(responseWithId(responses, 33).result.structuredContent).toMatchObject({
        decision: "blocked",
        forwardedToServer: false,
      });

      const receipts = jsonLines(await readFile(receiptFile, "utf8"));
      expect(receipts.map((receipt) => receipt.action.mutation)).toEqual([false, false, true]);
      expect(receipts.map((receipt) => receipt.evaluation.decision)).toEqual(["allowed", "allowed", "blocked"]);
      expect(jsonLines(await readFile(logFile, "utf8")).map((message) => message.id)).toEqual([31, 32]);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it("keeps the deterministic injected-message drill available", () => {
    const output = execFileSync(process.execPath, [cli, "check", "--scenario", "injected-message"], {
      cwd: root,
      encoding: "utf8",
    });
    const result = JSON.parse(output);
    expect(result.evaluation.decision).toBe("blocked");
    expect(result.evaluation.risk).toBe("data_egress");
    expect(result.receipt.enforcement.requestForwarding).toBe("withheld");
    expect(result.receipt.receiptHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("is exposed as the executable bya-trace package bin", async () => {
    const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
    expect(packageJson.name).toBe("before-you-approve");
    expect(packageJson.bin).toEqual({ "bya-trace": "proxy/bya-trace.mjs" });
    expect((await stat(cli)).mode & 0o111).not.toBe(0);
  });
});
