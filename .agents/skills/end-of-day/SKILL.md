---
name: end-of-day
description: End-of-day wrap-up skill. Runs the vibe-security audit, then generates three reports saved into reports/{YYYY-MM-DD}/: a Security Audit Report, a technical daily report of all work performed today, and a simplified stakeholder report in plain language. Use when the user says "end of day", "wrap up", "EOD", "generate reports", or "daily reports".
license: MIT
metadata:
  author: NZCC
  version: "1.1"
---

You are performing an end-of-day wrap-up. Execute the following three steps in order. All three reports must be saved before you finish.

Today's date is available from the system. Use it in all report headers as `YYYY-MM-DD`. All three reports go into a single dated folder:

```
reports/{YYYY-MM-DD}/
  Security Audit Report.md
  Technical Report.md
  Stakeholder Report.md
```

The Stakeholder Report also ends with a one-paragraph "ConnectWise Note" summary (see Step 3).

Create the folder if it does not exist. If any report already exists for today, overwrite it — this run supersedes it.

---

## Step 1 — Security Audit

Run the full `vibe-security` skill audit against the codebase. Follow all steps in that skill's SKILL.md (secrets, auth, rate limiting, input validation, data access, deployment — skip sections not relevant to this stack).

Save the output to:
```
reports/{YYYY-MM-DD}/Security Audit Report.md
```

Follow the exact file format defined in the vibe-security skill (executive summary table at top, findings by severity, prioritised remediation table at bottom).

---

## Step 2 — Technical Daily Report

Review the full conversation history for this session to identify everything that was built, changed, fixed, or discussed today. Also read the git log if available (`git log --oneline --since="midnight"`) for any committed work.

Save a technical report to:
```
reports/{YYYY-MM-DD}/Technical Report.md
```

Structure:
```
# Build Report — {DD Month YYYY}

**Project:** NZCC Applicant Portal
**Stack:** Next.js 16.2.9 · TypeScript · PostgreSQL · Prisma 7 · NextAuth v5 · Tailwind CSS v4

---

## Summary

{2–3 sentence overview of the day's work.}

---

## Changes Made

### {Feature or area name}
- Bullet points describing what was built or changed
- Include file paths where relevant
- Note any schema migrations run

### {Next feature or area}
- ...

---

## Bugs Fixed

- {Description of bug} — {file or component} — {how it was fixed}

---

## Known Issues / Carry-Forward

- {Anything unresolved, deferred, or flagged for tomorrow}
```

---

## Step 3 — Simplified Stakeholder Report

Using the same session history and the technical report from Step 2, write a plain-English summary for non-technical stakeholders (board members, managers, clients). No jargon. No file paths. No code. Write as if explaining to someone who uses the software but didn't build it.

Save to:
```
reports/{YYYY-MM-DD}/Stakeholder Report.md
```

Structure:
```
# What We Built — {DD Month YYYY}

**Project:** NZCC Applicant Portal

---

## The Big Picture

{2–3 sentences: what was worked on today and why it matters.}

---

## What's New or Improved

### {Plain-language feature name}
{2–4 sentences describing what changed from the user's perspective — what can they now do that they couldn't before, or what works better than it did?}

### {Next item}
...

---

## Issues Resolved

{Plain-language descriptions of bugs that were fixed and what the experience is like now.}

---

## Security

{1–2 sentences summarising the security posture from today's audit in plain terms. Do not list technical vulnerability names — describe the risk level and whether action is needed.}

---

## What's Next

{2–3 bullet points on likely next steps or open items, in plain language.}

---

## Connectwise Note

{One paragraph, 3–5 sentences, no headers or bullets. A single dense summary of today's work suitable for pasting directly into a ConnectWise ticket note: what was done, what was fixed, and the most important open item. Plain language, no jargon, no file paths.}
```

---

## Completion

After all three files are written, print a short confirmation in chat:

```
End-of-day reports saved to reports/{YYYY-MM-DD}/:
- Security Audit Report.md
- Technical Report.md
- Stakeholder Report.md
```

Then give a single sentence summarising the most important security finding from Step 1 and whether it needs action before the next session.
