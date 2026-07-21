#!/usr/bin/env node
import { appendFile, readFile } from "node:fs/promises";
import { createInterface } from "node:readline";
import process from "node:process";

const logFile = process.env.BYA_MOCK_LOG;
const input = createInterface({ input: process.stdin, crlfDelay: Infinity });

async function writeResponse(response) {
  const line = JSON.stringify(response);
  if (process.env.BYA_MOCK_SPLIT_OUTPUT === "1") {
    const midpoint = Math.floor(line.length / 2);
    process.stdout.write(line.slice(0, midpoint));
    await new Promise((resolve) => setTimeout(resolve, 5));
    process.stdout.write(`${line.slice(midpoint)}\n`);
    return;
  }
  process.stdout.write(`${line}\n`);
}

async function responseFor(message) {
  if (message.method === "initialize") {
    return {
      jsonrpc: "2.0",
      id: message.id,
      result: {
        protocolVersion: message.params?.protocolVersion ?? "2025-06-18",
        capabilities: { tools: {} },
        serverInfo: { name: "bya-trace-mock", version: "1.0.0" },
      },
    };
  }

  if (message.method === "tools/call") {
    let receiptsAtReceive = null;
    if (process.env.BYA_RECEIPT_FILE) {
      try {
        receiptsAtReceive = (await readFile(process.env.BYA_RECEIPT_FILE, "utf8"))
          .split(/\r?\n/)
          .filter((line) => line.trim()).length;
      } catch (error) {
        if (error?.code !== "ENOENT") throw error;
        receiptsAtReceive = 0;
      }
    }
    return {
      jsonrpc: "2.0",
      id: message.id,
      result: {
        content: [{ type: "text", text: `mock executed ${String(message.params?.name)}` }],
        structuredContent: {
          tool: message.params?.name,
          receivedArguments: message.params?.arguments ?? {},
          receiptsAtReceive,
        },
        isError: false,
      },
    };
  }

  if (message.id === undefined) return null;
  return {
    jsonrpc: "2.0",
    id: message.id,
    error: { code: -32601, message: `Method not found: ${String(message.method)}` },
  };
}

for await (const line of input) {
  if (!line.trim()) continue;
  const message = JSON.parse(line);
  if (logFile) await appendFile(logFile, `${JSON.stringify(message)}\n`);
  const response = await responseFor(message);
  if (response) await writeResponse(response);
}

const requestedExitCode = Number(process.env.BYA_MOCK_EXIT_CODE ?? 0);
process.exitCode = Number.isSafeInteger(requestedExitCode) ? requestedExitCode : 1;
