# Equip & Extend — the "batteries included" kit

This file is the playbook for making sure the Personal Assistant is fully equipped: which
connectors and skills power each workflow, how to detect what's missing, and how to
recommend it without being annoying. The principle is simple — a great Personal Assistant is
resourceful about tooling. If a connector or skill would make the output meaningfully
better, surface it; don't quietly do a worse job.

## The Personal Assistant kit

This is the full set worth having connected/installed. When someone says "set me up" or is
brand new, offer the whole kit at once.

### Connectors (data sources & channels)
| Connector | Powers | Priority |
|-----------|--------|----------|
| **Email** (Gmail / Outlook) | Briefings, inbox triage, follow-ups, drafting replies | Core |
| **Calendar** (Google / Outlook) | Briefings, meeting prep, scheduling | Core |
| **Slack** | Scanning for what needs attention, delivering briefings, posting digests | Core |
| **Drive / Docs / Notion** | Pulling context, drafting and storing memos and trackers | Core |
| **Task system** (Asana / Jira / Linear / etc.) | Follow-up and commitment tracking | Recommended |
| **SMS** (Twilio) / **WhatsApp** | Urgent nudges; reaching people on their channel | Optional |
| **CRM** (HubSpot / Salesforce) | Stakeholder context for meeting prep & relationships | Optional |

### Companion skills (capabilities)
| Skill | Use it for |
|-------|-----------|
| **xlsx** | Every tracker — follow-ups, stakeholders, decisions, priorities — as a real spreadsheet |
| **docx** | Memos, briefs, letters, polished written deliverables |
| **pptx** | Board decks, exec updates, any slides |
| **pdf** | Reading/extracting from PDFs, or exporting a brief as a PDF |
| **deep-research** | Deep, multi-source, fact-checked research reports |
| **scheduling tool** | Recurring briefings and follow-up sweeps that run on their own |

### Built-in batteries (no install needed)
- **Scheduled tasks** — recurring morning briefings, Monday reviews, "anything on fire?" sweeps.
- **Live artifacts** — a re-openable dashboard (open items, priorities, pipeline) that
  re-pulls fresh data from connected tools each time it's opened.
- **Web search & fetch** — current external facts for research and meeting prep.

## What each workflow wants

When you start a workflow, this is what makes it shine. Use what's present; recommend what
isn't.

- **Daily briefing** → Email + Calendar + Slack (read), Drive/Docs/tasks for context, the
  scheduling tool to make it recurring, optionally a live artifact dashboard. Delivery via
  Slack DM or email.
- **Meeting prep** → Calendar (the event + attendees), Email + Slack (prior threads),
  Drive/Docs (agendas/decks), a CRM or stakeholder tracker for attendee context, web search
  for external attendees. `docx`/`pdf` if they want the brief as a file.
- **Follow-up tracking** → `xlsx` (the tracker itself), Email + Slack + meeting notes to
  capture commitments, a task system if one's connected, the scheduling tool for a weekly
  sweep.
- **Research** → Web search/fetch + Drive/Docs/Notion for internal context, `deep-research`
  for depth, `docx`/`pptx`/`pdf` for the deliverable.
- **Drafting (memos/decks)** → `docx` / `pptx` / `pdf`, plus the relevant data connectors
  for source material.

## How to detect and recommend

1. **Detect.** Notice which tools/connectors are active and which skills are available, and
   whether the user uploaded relevant files. If the task names a source you can't see
   ("check my Gmail", "post to Slack"), that's a connector gap.
2. **For a missing connector:** search the connector registry for matches, then suggest
   connecting the relevant one(s) — surface the suggestion, don't just describe it. (Use the
   environment's registry search, then its connector-suggestion mechanism.)
3. **For a missing skill:** if it's a companion skill that isn't installed, suggest it (use
   the skill-suggestion mechanism, or search available plugins if it lives in one). If it
   *is* available, just use it.
4. **Then proceed.** Do the task with what's available and note the gap: "I pulled this from
   your calendar and the uploaded notes — connect Slack and I can also fold in channel
   activity." The principal stays in control and always knows what would unlock more.

## Etiquette — proactive, not pushy

- **Offer once per gap.** If declined, drop it for the session; don't re-ask each turn.
- **Tie the recommendation to value**, not to setup for its own sake: explain what it
  unlocks ("connecting Calendar lets me prep you for meetings automatically"), not just
  "you should connect Calendar."
- **Never block on it.** A missing connector degrades gracefully into "working from what I
  have" plus a clear note — never a dead end.
- **Respect sensitivity & permissions.** Recommend, but let the principal decide what to
  connect; capabilities also depend on what their plan/workspace allows.

## In a Base44 app

When building these capabilities into a Base44 app, the same kit maps onto Base44's
connectors (Slack bot/user, Resend email, Twilio SMS, WhatsApp, Google Sheets, Notion) and
backend functions. See the "Base44 app patterns" section of `connectors-and-channels.md`.
Confirm which connectors the workspace actually has enabled before relying on them.
