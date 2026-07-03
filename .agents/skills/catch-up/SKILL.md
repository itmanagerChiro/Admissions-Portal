---
name: catch-up
description: Brings you up to speed at the start of a session. Reads the latest Security Audit Report and Daily Report from the reports/ folder structure, loads them into context, and suggests the most important security changes to tackle — without implementing anything. Use when the user says "catch up", "what should we work on?", "where were we?", or starts a new session on this project.
license: MIT
metadata:
  author: NZCC
  version: "1.1"
---

You are catching the user up at the start of a session. Do not implement anything. Do not write any code. Your job is to read, synthesise, and suggest.

## Steps

1. **Find the latest dated folder** — list the subfolders in `reports/`. Each subfolder is named `YYYY-MM-DD`. Pick the one with the most recent date.

2. **Read the reports in that folder** — read both:
   - `reports/{YYYY-MM-DD}/Technical Report.md` — what was built
   - `reports/{YYYY-MM-DD}/Security Audit Report.md` — security findings

3. **Synthesise and present** — respond with the following structure, in plain prose and short bullet points. No headers longer than necessary. Be concise.

---

## Output Structure

### What was built
2–4 bullet points from the Technical Report summarising the most recent features or changes completed. Focus on what's new, not the full history.

### Security — suggested changes
Present the security findings from the Audit Report as actionable suggestions, grouped by priority. For each suggestion:
- Name the issue in plain language (no jargon)
- One sentence on why it matters
- One sentence on what implementing it would involve

Order them: Critical → High → Medium. Skip Low unless there are no higher items.

Do NOT show code. Do NOT start implementing. End with a single sentence asking the user which of these they'd like to tackle first, or whether they want to continue with feature work instead.
