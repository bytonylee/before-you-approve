import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export const DECISIONS = Object.freeze(["allow", "review", "block"]);
export const TRUST_LEVELS = Object.freeze(["trusted", "untrusted", "restricted"]);

const trustSourceSchema = {
  type: "object",
  additionalProperties: false,
  required: ["source", "trust", "role", "canAuthorize", "note"],
  properties: {
    source: { type: "string", minLength: 2, pattern: "^[a-z0-9][a-z0-9_]*$" },
    trust: { type: "string", enum: TRUST_LEVELS },
    role: {
      type: "string",
      enum: ["user_authority", "policy_boundary", "retrieved_content", "agent_inference", "external_claim"],
    },
    canAuthorize: { type: "boolean" },
    note: { type: "string", minLength: 12 },
  },
};

const actionSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "at",
    "tool",
    "operation",
    "arguments",
    "target",
    "provenance",
    "effect",
    "reversible",
    "harmful",
    "correctDecision",
    "explanation",
    "safeCounterfactual",
  ],
  properties: {
    id: { type: "string", minLength: 2, pattern: "^[a-z0-9][a-z0-9_]*$" },
    at: { type: "string", pattern: "^[0-9]{2}:[0-9]{2}:[0-9]{2}$" },
    tool: { type: "string", minLength: 3, pattern: "^[a-z][a-z0-9_]*(\\.[a-z][a-z0-9_]*)+$" },
    operation: { type: "string", minLength: 2, pattern: "^[a-z][a-z0-9_]*$" },
    arguments: { type: "object" },
    target: { type: "string", minLength: 2 },
    provenance: {
      type: "object",
      additionalProperties: false,
      required: ["source", "trust", "evidence"],
      properties: {
        source: { type: "string", minLength: 2, pattern: "^[a-z0-9][a-z0-9_]*$" },
        trust: { type: "string", enum: TRUST_LEVELS },
        evidence: { type: "string", minLength: 12 },
      },
    },
    effect: { type: "string", minLength: 12 },
    reversible: { type: "boolean" },
    harmful: { type: "boolean" },
    correctDecision: { type: "string", enum: DECISIONS },
    explanation: { type: "string", minLength: 40 },
    safeCounterfactual: { type: "string", minLength: 40 },
  },
};

export const DRILL_JSON_SCHEMA = deepFreeze({
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://before-you-approve.example/schemas/drill-v1.json",
  title: "Before You Approve drill",
  type: "object",
  additionalProperties: false,
  required: ["schemaVersion", "metadata", "id", "title", "learnerTask", "difficulty", "skill", "trustContext", "actions"],
  properties: {
    schemaVersion: { const: "1.0" },
    metadata: {
      type: "object",
      additionalProperties: false,
      required: ["authoredWith", "teacherReviewRequired"],
      properties: {
        authoredWith: { const: "GPT-5.6 via Codex" },
        teacherReviewRequired: { const: true },
      },
    },
    id: { type: "string", minLength: 3, pattern: "^[a-z0-9][a-z0-9_]*$" },
    title: { type: "string", minLength: 4 },
    learnerTask: { type: "string", minLength: 30 },
    difficulty: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
    skill: { type: "string", minLength: 4, pattern: "^[a-z][a-z0-9_]*$" },
    trustContext: { type: "array", minItems: 2, items: trustSourceSchema },
    actions: { type: "array", minItems: 3, items: actionSchema },
  },
});

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function joinPath(path, key) {
  return path === "$" ? `$.${key}` : `${path}.${key}`;
}

function schemaErrors(value, schema, path, errors) {
  if (Object.hasOwn(schema, "const") && value !== schema.const) {
    errors.push({ path, message: `must equal ${JSON.stringify(schema.const)}` });
    return;
  }

  if (schema.enum && !schema.enum.includes(value)) {
    errors.push({ path, message: `must be one of: ${schema.enum.join(", ")}` });
    return;
  }

  if (schema.type === "object") {
    if (!isRecord(value)) {
      errors.push({ path, message: "must be an object" });
      return;
    }

    const properties = schema.properties ?? {};
    for (const required of [...(schema.required ?? [])].sort()) {
      if (!Object.hasOwn(value, required)) {
        errors.push({ path: joinPath(path, required), message: "is required" });
      }
    }

    for (const key of Object.keys(value).sort()) {
      if (Object.hasOwn(properties, key)) {
        schemaErrors(value[key], properties[key], joinPath(path, key), errors);
      } else if (schema.additionalProperties === false) {
        errors.push({ path: joinPath(path, key), message: "is not allowed" });
      }
    }
    return;
  }

  if (schema.type === "array") {
    if (!Array.isArray(value)) {
      errors.push({ path, message: "must be an array" });
      return;
    }
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push({ path, message: `must contain at least ${schema.minItems} items` });
    }
    value.forEach((item, index) => schemaErrors(item, schema.items, `${path}[${index}]`, errors));
    return;
  }

  if (schema.type === "string") {
    if (typeof value !== "string") {
      errors.push({ path, message: "must be a string" });
      return;
    }
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push({ path, message: `must contain at least ${schema.minLength} characters` });
    }
    if (schema.pattern && !new RegExp(schema.pattern, "u").test(value)) {
      errors.push({ path, message: `must match ${schema.pattern}` });
    }
    return;
  }

  if (schema.type === "boolean" && typeof value !== "boolean") {
    errors.push({ path, message: "must be a boolean" });
  }
}

function findNonJsonValue(value, path = "$") {
  if (value === null || typeof value === "string" || typeof value === "boolean") return null;
  if (typeof value === "number") return Number.isFinite(value) ? null : path;
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const invalid = findNonJsonValue(value[index], `${path}[${index}]`);
      if (invalid) return invalid;
    }
    return null;
  }
  if (isRecord(value)) {
    for (const key of Object.keys(value).sort()) {
      const invalid = findNonJsonValue(value[key], joinPath(path, key));
      if (invalid) return invalid;
    }
    return null;
  }
  return path;
}

function secondsFromTimestamp(timestamp) {
  const [hours, minutes, seconds] = timestamp.split(":").map(Number);
  if (minutes > 59 || seconds > 59) return Number.NaN;
  return hours * 3600 + minutes * 60 + seconds;
}

function semanticErrors(drill, errors) {
  if (!isRecord(drill) || !Array.isArray(drill.trustContext) || !Array.isArray(drill.actions)) return;

  const sources = new Map();
  for (let index = 0; index < drill.trustContext.length; index += 1) {
    const context = drill.trustContext[index];
    if (!isRecord(context) || typeof context.source !== "string") continue;
    if (sources.has(context.source)) {
      errors.push({ path: `$.trustContext[${index}].source`, message: `duplicates source ${context.source}` });
    } else {
      sources.set(context.source, context);
    }
  }

  const hasDirectAuthority = [...sources.values()].some(
    (context) => context.role === "user_authority" && context.trust === "trusted" && context.canAuthorize === true,
  );
  if (!hasDirectAuthority) {
    errors.push({
      path: "$.trustContext",
      message: "must include a trusted user_authority source that can authorize actions",
    });
  }

  const actionIds = new Set();
  let priorTimestamp = -1;
  for (let index = 0; index < drill.actions.length; index += 1) {
    const action = drill.actions[index];
    if (!isRecord(action)) continue;
    const actionPath = `$.actions[${index}]`;

    if (typeof action.id === "string") {
      if (actionIds.has(action.id)) {
        errors.push({ path: `${actionPath}.id`, message: `duplicates action id ${action.id}` });
      }
      actionIds.add(action.id);
    }

    if (typeof action.at === "string" && /^[0-9]{2}:[0-9]{2}:[0-9]{2}$/.test(action.at)) {
      const timestamp = secondsFromTimestamp(action.at);
      if (!Number.isFinite(timestamp)) {
        errors.push({ path: `${actionPath}.at`, message: "must be a valid HH:MM:SS timestamp" });
      } else if (timestamp < priorTimestamp) {
        errors.push({ path: `${actionPath}.at`, message: "must not precede the prior action" });
      }
      priorTimestamp = timestamp;
    }

    if (isRecord(action.provenance) && typeof action.provenance.source === "string") {
      const source = sources.get(action.provenance.source);
      if (!source) {
        errors.push({ path: `${actionPath}.provenance.source`, message: "must reference trustContext.source" });
      } else if (source.trust !== action.provenance.trust) {
        errors.push({ path: `${actionPath}.provenance.trust`, message: `must match trustContext trust ${source.trust}` });
      }
    }

    const invalidJsonPath = findNonJsonValue(action.arguments, `${actionPath}.arguments`);
    if (invalidJsonPath) {
      errors.push({ path: invalidJsonPath, message: "must be JSON-serializable" });
    }

    if (action.harmful === true && action.correctDecision !== "block") {
      errors.push({ path: `${actionPath}.correctDecision`, message: "must be block when harmful is true" });
    }
    if (action.correctDecision === "allow" && action.harmful !== false) {
      errors.push({ path: `${actionPath}.harmful`, message: "must be false when the correct decision is allow" });
    }
  }

  const coveredDecisions = new Set(drill.actions.map((action) => action?.correctDecision));
  for (const decision of DECISIONS) {
    if (!coveredDecisions.has(decision)) {
      errors.push({ path: "$.actions", message: `must teach at least one ${decision} decision` });
    }
  }
}

export function validateDrill(value) {
  const errors = [];
  schemaErrors(value, DRILL_JSON_SCHEMA, "$", errors);
  semanticErrors(value, errors);
  errors.sort((left, right) => {
    if (left.path !== right.path) return left.path < right.path ? -1 : 1;
    if (left.message === right.message) return 0;
    return left.message < right.message ? -1 : 1;
  });
  return { valid: errors.length === 0, errors };
}

export function assertValidDrill(value, label = "drill") {
  const result = validateDrill(value);
  if (!result.valid) {
    const detail = result.errors.map((error) => `${error.path}: ${error.message}`).join("\n");
    throw new TypeError(`${label} is invalid:\n${detail}`);
  }
  return value;
}

export async function readAndValidateDrill(path) {
  let value;
  try {
    value = JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    throw new TypeError(`${path} is not valid JSON: ${error.message}`, { cause: error });
  }
  return assertValidDrill(value, path);
}

async function runCli(paths) {
  if (paths.length === 0) {
    process.stderr.write("Usage: node scripts/drill-schema.mjs <drill.json> [...]\n");
    return 2;
  }

  let invalidCount = 0;
  for (const path of paths) {
    try {
      await readAndValidateDrill(path);
      process.stdout.write(`valid ${path}\n`);
    } catch (error) {
      invalidCount += 1;
      process.stderr.write(`${error.message}\n`);
    }
  }
  return invalidCount === 0 ? 0 : 1;
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : null;
if (invokedPath === import.meta.url) {
  process.exitCode = await runCli(process.argv.slice(2));
}
