#!/usr/bin/env python3
"""Record the judge demo from the checked-in app and proof artifacts."""

from __future__ import annotations

import html
import json
import math
import os
from pathlib import Path
import re
import shutil
import subprocess

from playwright.sync_api import Page, sync_playwright


ROOT = Path(__file__).resolve().parents[2]
VIDEO_DIR = ROOT / "submission" / "video"
SCENE_DIR = VIDEO_DIR / "scenes"
SCENE_MANIFEST = VIDEO_DIR / "scenes.txt"
NARRATION_TEXT = VIDEO_DIR / "narration.txt"
NARRATION_AUDIO = VIDEO_DIR / "narration.aiff"
OUTPUT_VIDEO = VIDEO_DIR / "before-you-approve-demo.mp4"
COLD_OPEN_SCREENSHOT = ROOT / "submission" / "screenshots" / "final-action-decision-16x9.png"
APP_URL = "http://127.0.0.1:4173/#practice"
ANSI = re.compile(r"\x1b\[[0-9;]*m")
CSS_VIEWPORT = {"width": 1600, "height": 900}
CAPTURE_SIZE = {"width": 2560, "height": 1440}
DEVICE_SCALE_FACTOR = CAPTURE_SIZE["width"] / CSS_VIEWPORT["width"]
TARGET_DURATION = 160


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


def load_app(page: Page) -> None:
    page.goto("about:blank")
    page.goto(APP_URL, wait_until="networkidle")
    page.get_by_role("heading", name=re.compile("supervision drill")).wait_for()


def capture_scene(
    page: Page,
    name: str,
    duration: float,
    scenes: list[tuple[Path, float]],
) -> Path:
    page.evaluate("document.fonts.ready")
    page.wait_for_timeout(250)
    path = SCENE_DIR / f"{len(scenes) + 1:02d}-{name}.png"
    page.screenshot(path=str(path), scale="device", animations="disabled")
    scenes.append((path, duration))
    return path


def write_scene_manifest(scenes: list[tuple[Path, float]]) -> None:
    lines: list[str] = []
    for path, duration in scenes:
        lines.extend((f"file '{path}'", f"duration {duration:.3f}"))
    lines.append(f"file '{scenes[-1][0]}'")
    SCENE_MANIFEST.write_text("\n".join(lines) + "\n", encoding="utf-8")


def render_video() -> None:
    if not NARRATION_AUDIO.exists():
        if not shutil.which("say"):
            raise FileNotFoundError(
                f"Missing {NARRATION_AUDIO}; macOS 'say' is unavailable to generate it."
            )
        subprocess.run(
            ["say", "-v", "Samantha", "-f", str(NARRATION_TEXT), "-o", str(NARRATION_AUDIO)],
            check=True,
        )
    if not shutil.which("ffmpeg"):
        raise RuntimeError("ffmpeg is required to render the demo video")

    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(SCENE_MANIFEST),
            "-i",
            str(NARRATION_AUDIO),
            "-map",
            "0:v:0",
            "-map",
            "1:a:0",
            "-t",
            str(TARGET_DURATION),
            "-r",
            "25",
            "-fps_mode",
            "cfr",
            "-c:v",
            "libx264",
            "-preset",
            "slow",
            "-crf",
            "12",
            "-tune",
            "stillimage",
            "-x264-params",
            "colorprim=bt709:transfer=bt709:colormatrix=bt709",
            "-g",
            "50",
            "-pix_fmt",
            "yuv420p",
            "-color_primaries",
            "bt709",
            "-color_trc",
            "bt709",
            "-colorspace",
            "bt709",
            "-c:a",
            "aac",
            "-af",
            "apad",
            "-b:a",
            "192k",
            "-ar",
            "48000",
            "-movflags",
            "+faststart",
            str(OUTPUT_VIDEO),
        ],
        cwd=ROOT,
        check=True,
    )


def proof_page(title: str, subtitle: str, columns: list[tuple[str, str]]) -> str:
    rendered = "".join(
        f"<section><h2>{html.escape(label)}</h2><pre>{html.escape(value)}</pre></section>"
        for label, value in columns
    )
    return f"""<!doctype html>
<html><head><meta charset="utf-8"><style>
*{{box-sizing:border-box;letter-spacing:0}}body{{margin:0;background:oklch(.99 0 0);color:oklch(0 0 0);font-family:'Geist Variable',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}}
header{{height:124px;padding:27px 54px;background:oklch(0 0 0);color:oklch(1 0 0);border-bottom:1px solid oklch(.26 0 0)}}
header small{{color:oklch(.72 0 0);font-size:14px;font-weight:720;text-transform:uppercase}}h1{{margin:7px 0 0;font-size:34px;font-weight:680}}header p{{margin:7px 0 0;color:oklch(.72 0 0);font-size:16px}}
main{{height:776px;padding:32px 54px;display:grid;grid-template-columns:repeat({len(columns)},minmax(0,1fr));gap:22px}}
section{{min-width:0;padding:24px;background:oklch(1 0 0);border:1px solid oklch(.92 0 0);border-radius:8px;box-shadow:0 1px 2px hsl(0 0% 0%/.09);overflow:hidden}}
h2{{margin:0 0 16px;color:oklch(0 0 0);font-size:20px}}pre{{height:650px;margin:0;padding:18px;overflow:hidden;background:oklch(.14 0 0);color:oklch(1 0 0);font:15px/1.48 'Geist Mono Variable',ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;overflow-wrap:anywhere}}
</style></head><body><header><small>Before You Approve / build proof</small><h1>{html.escape(title)}</h1><p>{html.escape(subtitle)}</p></header><main>{rendered}</main></body></html>"""


def main() -> None:
    SCENE_DIR.mkdir(parents=True, exist_ok=True)
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
    test_proof = run_output("npm", "test").replace(str(ROOT), "$PROJECT")
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

    scenes: list[tuple[Path, float]] = []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context(
            viewport=CSS_VIEWPORT,
            device_scale_factor=DEVICE_SCALE_FACTOR,
        )
        page = context.new_page()

        load_app(page)
        advance_to_final(page)
        cold_open = capture_scene(page, "cold-open", 14.011, scenes)
        shutil.copy2(cold_open, COLD_OPEN_SCREENSHOT)

        load_app(page)
        capture_scene(page, "product-intro", 12.925, scenes)

        capture_scene(page, "allow-before", 4, scenes)
        click(page, "Allow")
        page.get_by_text("What would change the decision", exact=True).scroll_into_view_if_needed()
        capture_scene(page, "allow-feedback", 8.902, scenes)

        click(page, "Next action")
        click(page, "Allow")
        click(page, "Next action")
        capture_scene(page, "ask-before", 5, scenes)
        click(page, "Ask")
        page.get_by_text("What would change the decision", exact=True).scroll_into_view_if_needed()
        capture_scene(page, "ask-feedback", 8.746, scenes)

        click(page, "Next action")
        capture_scene(page, "unsafe-before", 4, scenes)
        click(page, "Allow")
        page.get_by_text("Simulated consequence", exact=True).scroll_into_view_if_needed()
        capture_scene(page, "unsafe-consequence", 7, scenes)
        click(page, "Restart drill")
        advance_to_final(page, "Block")
        capture_scene(page, "block-feedback", 4.185, scenes)

        click(page, "See results")
        capture_scene(page, "completion", 7, scenes)
        click(page, "Progress")
        capture_scene(page, "progress-demo-data", 7.954, scenes)

        click(page, "Case library")
        page.get_by_role("button").filter(has_text="Purchase limit").click()
        capture_scene(page, "purchase-case", 6, scenes)
        page.get_by_role("button").filter(has_text="Repository cleanup").click()
        capture_scene(page, "repository-case", 8.334, scenes)

        page.set_content(
            proof_page(
                "MCP-shaped evidence, deterministic checks",
                "Synthetic input only. The receipt chain is self-consistent, not externally anchored.",
                [("npm run trace:demo", trace_proof), ("npm test", test_proof)],
            ),
            wait_until="load",
        )
        capture_scene(page, "technical-proof", 26.319, scenes)

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
        page.set_content(
            proof_page(
                "GPT-5.6 through Codex, with human review",
                "Build-time authoring evidence is checked in; runtime grading stays deterministic.",
                [
                    ("cases/GPT-5.6-AUTHORING.md", prompt_excerpt),
                    ("Fixture metadata + validator", f"{metadata_proof}\n\n{validator_excerpt}"),
                ],
            ),
            wait_until="load",
        )
        capture_scene(page, "gpt-codex-proof", 25.914, scenes)

        load_app(page)
        capture_scene(page, "closing", 9.710, scenes)
        context.close()
        browser.close()

    if not math.isclose(sum(duration for _, duration in scenes), TARGET_DURATION, abs_tol=0.001):
        raise RuntimeError(f"Scene durations must total exactly {TARGET_DURATION} seconds")
    write_scene_manifest(scenes)
    render_video()
    print(OUTPUT_VIDEO)


if __name__ == "__main__":
    main()
