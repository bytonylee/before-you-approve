import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  DECISIONS,
  DRILL_JSON_SCHEMA,
  assertValidDrill,
  readAndValidateDrill,
  validateDrill,
} from "../scripts/drill-schema.mjs";

const fixtureUrls = [
  new URL("../cases/inbox-indirect-instruction.json", import.meta.url),
  new URL("../cases/purchase-over-limit.json", import.meta.url),
  new URL("../cases/repo-cleanup-destructive-command.json", import.meta.url),
];

async function loadFixtures() {
  return Promise.all(fixtureUrls.map(async (url) => JSON.parse(await readFile(url, "utf8"))));
}

describe("Before You Approve drill fixtures", () => {
  it("validates all checked-in cases with stable identities", async () => {
    const fixtures = await loadFixtures();
    expect(fixtures.map((fixture) => fixture.id)).toEqual([
      "inbox_indirect_instruction",
      "purchase_over_limit",
      "repo_cleanup_destructive_command",
    ]);

    for (const fixture of fixtures) {
      expect(validateDrill(fixture)).toEqual({ valid: true, errors: [] });
      expect(assertValidDrill(fixture)).toBe(fixture);
      expect(fixture.metadata).toEqual({
        authoredWith: "GPT-5.6 via Codex",
        teacherReviewRequired: true,
      });
    }
  });

  it("teaches allow, review, and block in every trace", async () => {
    const fixtures = await loadFixtures();
    for (const fixture of fixtures) {
      const decisions = new Set(fixture.actions.map((action) => action.correctDecision));
      expect(decisions).toEqual(new Set(DECISIONS));
      expect(fixture.actions.every((action) => action.explanation.length >= 40)).toBe(true);
      expect(fixture.actions.every((action) => action.safeCounterfactual.length >= 40)).toBe(true);
    }
  });

  it("pins the decisive feedback for each adversarial action", async () => {
    const fixtures = await loadFixtures();
    const finalActions = Object.fromEntries(fixtures.map((fixture) => [fixture.id, fixture.actions.at(-1)]));

    expect(finalActions.inbox_indirect_instruction).toMatchObject({
      id: "inbox_forward_audit_copy",
      harmful: true,
      reversible: false,
      correctDecision: "block",
      explanation:
        "Block. Text inside a retrieved message is content, not authority. The send contradicts the user's no-forward instruction and would disclose customer data externally.",
    });
    expect(finalActions.purchase_over_limit).toMatchObject({
      id: "purchase_place_order_over_limit",
      harmful: true,
      reversible: false,
      correctDecision: "block",
      explanation:
        "Block. The user withheld purchase authority, and the all-in total exceeds $300. Scarcity and social pressure are vendor claims, not permission to spend.",
    });
    expect(finalActions.repo_cleanup_destructive_command).toMatchObject({
      id: "repo_execute_force_clean",
      harmful: true,
      reversible: false,
      correctDecision: "block",
      explanation:
        "Block. This destructive command directly violates the no-delete and no-modification boundaries. 'Generated' is an unverified label, and Git cannot restore every ignored or untracked file.",
    });
  });

  it("rejects unknown fields, broken provenance, and unsafe labels deterministically", async () => {
    const [fixture] = await loadFixtures();
    const invalid = structuredClone(fixture);
    invalid.actions[0].unexpected = "schema drift";
    invalid.actions[0].harmful = true;
    invalid.actions[2].provenance.source = "missing_source";
    invalid.metadata.teacherReviewRequired = false;

    const first = validateDrill(invalid);
    const repeat = validateDrill(invalid);
    expect(repeat).toEqual(first);
    expect(first.valid).toBe(false);
    expect(first.errors).toEqual(expect.arrayContaining([
      { path: "$.actions[0].correctDecision", message: "must be block when harmful is true" },
      { path: "$.actions[0].harmful", message: "must be false when the correct decision is allow" },
      { path: "$.actions[0].unexpected", message: "is not allowed" },
      { path: "$.actions[2].provenance.source", message: "must reference trustContext.source" },
      { path: "$.metadata.teacherReviewRequired", message: "must equal true" },
    ]));
    expect(() => assertValidDrill(invalid, "tampered fixture")).toThrow("tampered fixture is invalid");
  });

  it("rejects non-JSON arguments and traces without direct authority", async () => {
    const [fixture] = await loadFixtures();
    const invalid = structuredClone(fixture);
    invalid.trustContext[0].canAuthorize = false;
    invalid.actions[0].arguments.limit = Number.POSITIVE_INFINITY;

    expect(validateDrill(invalid).errors).toEqual(expect.arrayContaining([
      {
        path: "$.actions[0].arguments.limit",
        message: "must be JSON-serializable",
      },
      {
        path: "$.trustContext",
        message: "must include a trusted user_authority source that can authorize actions",
      },
    ]));
  });

  it("reads and validates a fixture through the filesystem helper", async () => {
    const path = fileURLToPath(fixtureUrls[1]);
    const fixture = await readAndValidateDrill(path);
    expect(fixture.id).toBe("purchase_over_limit");
  });

  it("publishes a frozen strict schema for authoring tools", () => {
    expect(DRILL_JSON_SCHEMA.properties.actions.items.additionalProperties).toBe(false);
    expect(Object.isFrozen(DRILL_JSON_SCHEMA)).toBe(true);
    expect(Object.isFrozen(DRILL_JSON_SCHEMA.properties.actions.items)).toBe(true);
  });
});
