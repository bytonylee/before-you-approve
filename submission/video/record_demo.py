#!/usr/bin/env python3
"""Record the judge demo from the checked-in app and proof artifacts."""

from __future__ import annotations

import html
import json
import os
from pathlib import Path
import re
import subprocess
import time

from playwright.sync_api import Page, sync_playwright


ROOT = Path(__file__).resolve().parents[2]
VIDEO_DIR = ROOT / "submission" / "video"
RAW_DIR = VIDEO_DIR / "raw"
APP_URL = "http://127.0.0.1:4173/#practice"
ANSI = re.compile(r"\x1b\[[0-9;]*m")
PACE = float(os.environ.get("BYA_DEMO_PACE", "1"))


def run_output(*args: str) -> str:
    env = {**os.environ, "NO_COLOR": "1", "FORCE_COLOR": "0"}
    result = subprocess.run(
        args,
        cwd=ROOT,
        env=env,
        check=True,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    return ANSI.sub("", result.stdout)


def segment(page: Page, seconds: float, action) -> None:
    seconds *= PACE
    started = time.monotonic()
    action()
    remaining = seconds - (time.monotonic() - started)
    if remaining > 0:
        page.wait_for_timeout(remaining * 1000)


def pause(page: Page, milliseconds: float) -> None:
    page.wait_for_timeout(milliseconds * PACE)


def click(page: Page, name: str) -> None:
    page.get_by_role("button", name=name).first.click()


def advance_to_final(page: Page, final_choice: str | None = None) -> None:
    click(page, "Allow")
    click(page, "Next action")
    click(page, "Allow")
    click(page, "Next action")
    click(page, "Ask")
    click(page, "Next action")
    if final_choice:
        click(page, final_choice)


def proof_page(title: str, subtitle: str, columns: list[tuple[str, str]]) -> str:
    rendered = "".join(
        f"<section><h2>{html.escape(label)}</h2><pre>{html.escape(value)}</pre></section>"
        for label, value in columns
    )
    return f"""<!doctype html>
<html><head><meta charset="utf-8"><style>
*{{box-sizing:border-box}}body{{margin:0;background:#f5f7f6;color:#171a19;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}}
header{{height:124px;padding:28px 54px;background:#151817;color:white;border-bottom:5px solid #28cf82}}
header small{{color:#70dda9;font-size:14px;font-weight:750;text-transform:uppercase}}h1{{margin:7px 0 0;font-size:34px}}header p{{margin:7px 0 0;color:#c9cecb;font-size:16px}}
main{{height:776px;padding:32px 54px;display:grid;grid-template-columns:repeat({len(columns)},minmax(0,1fr));gap:22px}}
section{{min-width:0;padding:24px;background:white;border:1px solid #c8cecb;border-radius:6px;overflow:hidden}}
h2{{margin:0 0 16px;color:#075c48;font-size:20px}}pre{{height:650px;margin:0;padding:18px;overflow:hidden;background:#171a19;color:#e7f4ef;font:15px/1.48 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;overflow-wrap:anywhere}}
</style></head><body><header><small>Before You Approve / build proof</small><h1>{html.escape(title)}</h1><p>{html.escape(subtitle)}</p></header><main>{rendered}</main></body></html>"""


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    trace = json.loads(run_output("node", "proxy/bya-trace.mjs", "check", "--scenario", "injected-message"))
    trace_proof = json.dumps(
        {
            "tool": trace["action"]["tool"],
            "target": trace["action"]["target"],
            "externalHosts": trace["action"]["externalHosts"],
            "decision": trace["evaluation"]["decision"],
            "reason": trace["evaluation"]["reason"],
            "requestForwarding": trace["receipt"]["enforcement"]["requestForwarding"],
            "previousHash": trace["receipt"]["previousHash"],
            "receiptHash": trace["receipt"]["receiptHash"],
        },
        indent=2,
    )
    test_proof = run_output("npm", "test")
    authoring = (ROOT / "cases" / "GPT-5.6-AUTHORING.md").read_text(encoding="utf-8")
    fixture = json.loads((ROOT / "cases" / "inbox-indirect-instruction.json").read_text(encoding="utf-8"))
    metadata_proof = json.dumps(
        {
            "fixture": fixture["id"],
            "metadata": fixture["metadata"],
            "decisions": [action["correctDecision"] for action in fixture["actions"]],
        },
        indent=2,
    )

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1600, "height": 900},
            record_video_dir=str(RAW_DIR),
            record_video_size={"width": 1600, "height": 900},
        )
        page = context.new_page()
        video = page.video

        cold_open = (ROOT / "submission" / "screenshots" / "final-action-decision-16x9.png").as_uri()
        segment(page, 14, lambda: page.goto(cold_open, wait_until="load"))

        def introduce() -> None:
            page.goto("about:blank")
            page.goto(APP_URL, wait_until="networkidle")
            page.get_by_role("heading", name=re.compile("supervision drill")).wait_for()

        segment(page, 14, introduce)

        def allow_step() -> None:
            pause(page, 3000)
            click(page, "Allow")
            pause(page, 1200)
            page.get_by_text("What would change the decision", exact=True).scroll_into_view_if_needed()

        segment(page, 16, allow_step)

        def ask_step() -> None:
            click(page, "Next action")
            click(page, "Allow")
            click(page, "Next action")
            pause(page, 3500)
            click(page, "Ask")
            pause(page, 1200)
            page.get_by_text("What would change the decision", exact=True).scroll_into_view_if_needed()

        segment(page, 16, ask_step)

        def mistake_then_block() -> None:
            click(page, "Next action")
            pause(page, 3500)
            click(page, "Allow")
            pause(page, 1000)
            page.get_by_text("Simulated consequence", exact=True).scroll_into_view_if_needed()
            pause(page, 6000)
            click(page, "Restart drill")
            advance_to_final(page, "Block")

        segment(page, 23, mistake_then_block)

        def show_signals() -> None:
            pause(page, 3500)
            click(page, "See results")
            pause(page, 4500)
            click(page, "Progress")

        segment(page, 15, show_signals)

        def show_cases() -> None:
            click(page, "Case library")
            pause(page, 3000)
            page.get_by_role("button").filter(has_text="Purchase limit").click()
            pause(page, 3500)
            page.get_by_role("button").filter(has_text="Repository cleanup").click()

        segment(page, 13, show_cases)

        segment(
            page,
            21,
            lambda: page.set_content(
                proof_page(
                    "MCP-shaped evidence, deterministic checks",
                    "Synthetic input only. The receipt chain is self-consistent, not externally anchored.",
                    [("npm run trace:demo", trace_proof), ("npm test", test_proof)],
                ),
                wait_until="load",
            ),
        )

        prompt_excerpt = "\n".join(authoring.splitlines()[:34])
        validator_excerpt = """DRILL_JSON_SCHEMA
additionalProperties: false

Semantic checks
- declared user authority
- provenance source + trust match
- JSON-serializable arguments
- harmful action => Block
- Allow action => not harmful
- every case teaches Allow / Ask / Block"""
        segment(
            page,
            23,
            lambda: page.set_content(
                proof_page(
                    "GPT-5.6 through Codex, with human review",
                    "Build-time authoring evidence is checked in; runtime grading stays deterministic.",
                    [
                        ("cases/GPT-5.6-AUTHORING.md", prompt_excerpt),
                        ("Fixture metadata + validator", f"{metadata_proof}\n\n{validator_excerpt}"),
                    ],
                ),
                wait_until="load",
            ),
        )

        segment(page, 10, introduce)
        context.close()
        video.save_as(str(VIDEO_DIR / "visuals.webm"))
        browser.close()

    print(VIDEO_DIR / "visuals.webm")


if __name__ == "__main__":
    main()
