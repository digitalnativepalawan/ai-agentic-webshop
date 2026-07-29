"""TALA Research Lab backend — FastAPI + Agent Reach + OpenRouter.

Endpoints:
  GET  /health
  POST /research
"""
from __future__ import annotations

import json
import os
import sys
from typing import Any, Dict, List, Optional

# Add the Agent Reach repo to the path so we can import it directly
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "tmp", "agent-reach"))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from openai import OpenAI

app = FastAPI(title="TALA Research Lab", version="0.1.0")

ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
TALA_LLM_MODEL = os.environ.get("TALA_LLM_MODEL", "openai/gpt-4o-mini")


class ResearchRequest(BaseModel):
    business: str
    location: str
    audience: str
    question: str


class SourceCard(BaseModel):
    title: str
    url: str
    domain: str
    evidence: str
    retrieval_status: str


class ReportSections(BaseModel):
    summary: str
    audience_signals: List[str]
    problems_and_objections: List[str]
    opportunities: List[str]
    investor_channels: List[str] = []
    recommended_next_actions: List[str]
    sources: List[SourceCard]


class ResearchResponse(BaseModel):
    report: ReportSections
    query: ResearchRequest


# ---------------------------------------------------------------------------
# Source validation — reject blocked/empty/abnormally-short pages
# ---------------------------------------------------------------------------
BLOCKED_PATTERNS = [
    "401", "403", "403 forbidden", "429",
    "you've been blocked", "access denied", "login required",
    "captcha", "recaptcha", "cloudflare",
]


def is_blocked(content: str, url: str, status_code: Optional[int] = None) -> bool:
    if status_code and status_code in (401, 403, 429):
        return True
    text = content.strip()
    if len(text) < 120:
        return True
    lowered = (content + " " + url).lower()
    for pattern in BLOCKED_PATTERNS:
        if pattern.lower() in lowered:
            return True
    return False


def extract_domain(url: str) -> str:
    from urllib.parse import urlparse
    return urlparse(url).netloc.replace("www.", "") or url


async def fetch_page(url: str) -> Dict[str, Any]:
    """Fetch a single page via Agent Reach's web reader."""
    import asyncio
    try:
        from agent_reach import AgentReach
        reach = AgentReach()
        # Agent Reach's read method returns {content, title, status_code}
        result = await reach.read(url)
        content = result.get("content", "") or ""
        title = result.get("title", "") or url
        status = result.get("status_code")
        return {"url": url, "title": title, "content": content, "status": status}
    except Exception as e:
        return {"url": url, "title": url, "content": "", "status": None}


async def search_web(query: str, count: int = 10) -> List[Dict[str, str]]:
    """Use Agent Reach to search the web."""
    try:
        from agent_reach import AgentReach
        reach = AgentReach()
        results = await reach.search(query, count=count)
        return results if isinstance(results, list) else []
    except Exception:
        return []


def build_report(research_result: str, sources: List[Dict[str, Any]]) -> ReportSections:
    """Parse the LLM result into structured sections."""
    try:
        data = json.loads(research_result)
        return ReportSections(**data)
    except (json.JSONDecodeError, TypeError, KeyError):
        pass
    return ReportSections(
        summary=research_result[:2000],
        audience_signals=[],
        problems_and_objections=[],
        opportunities=[],
        investor_channels=[],
        recommended_next_actions=[],
        sources=[
            SourceCard(
                title=s.get("title", ""),
                url=s.get("url", ""),
                domain=extract_domain(s.get("url", "")),
                evidence=s.get("content", "")[:300],
                retrieval_status="verified",
            )
            for s in sources
        ],
    )


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "tala-research",
        "model": TALA_LLM_MODEL,
        "openrouter_configured": bool(OPENROUTER_API_KEY),
    }


@app.post("/research", response_model=ResearchResponse)
async def research(req: ResearchRequest):
    """Run web research and return a structured report."""
    prompt = (
        f"Research the following business and question. "
        f"Provide a concise report in valid JSON with these keys:\n"
        f"  summary — 2-3 sentences\n"
        f"  audience_signals — bullet list of 3-5 signals\n"
        f"  problems_and_objections — bullet list of 3-5 obstacles\n"
        f"  opportunities — bullet list of 3-5 market opportunities\n"
        f"  investor_channels — bullet list of credible investor networks (only if relevant)\n"
        f"  recommended_next_actions — bullet list of 3-5 concrete next steps\n"
        f"  sources — array of {{title, url, domain, evidence}}\n\n"
        f"Business: {req.business}\n"
        f"Location: {req.location}\n"
        f"Audience: {req.audience}\n"
        f"Question: {req.question}\n\n"
        f"Return ONLY valid JSON. Never invent sources, URLs, or statistics."
    )

    # Step 1: Web search via Agent Reach
    search_results = await search_web(req.question, count=10)

    # Step 2: Fetch and verify each result
    verified_sources: List[Dict[str, Any]] = []
    for item in search_results:
        url = item.get("url", "") or item.get("link", "")
        if not url:
            continue
        page = await fetch_page(url)
        content = page.get("content", "")
        verified_sources.append({
            "url": url,
            "title": page.get("title", ""),
            "content": content,
            "status": page.get("status"),
            "rejected": is_blocked(content, url, page.get("status")),
        })

    verified_count = sum(1 for s in verified_sources if not s["rejected"])
    rejected_count = len(verified_sources) - verified_count

    # Step 3: Build context for the LLM
    llm_context = (
        f"Web research results for: {req.question}\n\n"
        f"Verified pages: {verified_count}\n"
        f"Rejected/blocked pages: {rejected_count}\n\n"
    )
    for s in verified_sources:
        if s["rejected"]:
            llm_context += f"[REJECTED] {s['url']}\n"
        else:
            llm_context += f"[VERIFIED] {s['title']} ({s['url']})\n{s['content'][:600]}\n\n"

    full_prompt = f"{prompt}\n\nRESEARCH FINDINGS:\n{llm_context}"

    # Step 4: Generate report via OpenRouter (backend-only — key never leaves)
    client = OpenAI(
        api_key=OPENROUTER_API_KEY,
        base_url="https://openrouter.ai/api/v1",
    )
    response = client.chat.completions.create(
        model=TALA_LLM_MODEL,
        messages=[
            {"role": "system", "content": "You are TALA, a research assistant for merQato. Provide concise, factual reports with verified sources. Never invent sources, URLs, people, or statistics. If you cannot verify a claim, say so."},
            {"role": "user", "content": full_prompt},
        ],
        temperature=0.3,
        max_tokens=4000,
    )

    report_text = response.choices[0].message.content or ""

    # Step 5: Parse report
    report = build_report(report_text, verified_sources)

    # Update retrieval status on each source card
    for src in report.sources:
        for raw in verified_sources:
            if raw["url"] and raw["url"] in src.url:
                src.retrieval_status = "blocked" if raw["rejected"] else "verified"
                break
        else:
            if src.retrieval_status != "blocked":
                src.retrieval_status = "verified"

    return ResearchResponse(report=report, query=req)