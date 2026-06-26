# Daily Priorities Briefing

A briefing answers one question: **"What deserves the principal's attention right now?"**
Everything else is secondary. A good briefing can be read in under a minute and leaves the
principal knowing exactly what to do next.

## Gather

Pull from whatever is connected, in parallel:

- **Email** — unread and recently-received messages, especially anything awaiting a reply,
  flagged, or from key people.
- **Calendar** — today's (or the requested window's) events; note prep needs, conflicts,
  back-to-backs, and gaps.
- **Slack / chat** — direct mentions, DMs, and threads in important channels since the last
  briefing.
- **Docs / tasks** — recently edited docs, shared files, and any connected task system.
- **Trackers** — your own follow-up sheet for items now due or overdue.
- **Uploaded files** — anything the principal dropped in for this briefing.

If a key source isn't connected, note it briefly ("Slack not connected — not included") and
offer to connect it, rather than silently omitting it.

## Synthesize

Apply judgment, not just collection. For each candidate item ask: does the principal need to
*do* something, *know* something, or neither? Drop the "neither." Merge duplicates (the same
topic raised in email and Slack is one item). Rank by urgency × importance, not by recency.

## Output format

Use this structure. Keep "Needs you" to the genuinely actionable few — if everything is a
priority, nothing is.

```
# Briefing — [Day, Date]

## ☀️ Needs you today
- [Action] — [why / what's blocked] — [deadline]. [link]
- ...

## 📅 On your calendar
- [Time] [Event] — [one-line context or prep note]. [link]
- ...  (flag conflicts, prep needs, or a packed day)

## ✅ Handled / FYI
- [What happened or what's in motion]. [link]

## 👀 Worth watching
- [Slow-developing item or risk]. [link]
```

Omit a section if it's empty rather than padding it. If today is unusually light or heavy,
say so in a one-line opener — that framing is itself useful.

## On a schedule

Briefings are the canonical recurring task. When setting one up:

- Confirm the **time** (e.g. 7:00am weekdays) and **what to check** (which sources).
- Decide **where it's delivered** — a message, an email to the principal, or posted to a
  private Slack channel/DM.
- Cron examples: every weekday at 7am → `0 7 * * 1-5`; every morning at 6 → `0 6 * * *`;
  Monday 8am weekly review → `0 8 * * 1`.

After a strong one-off briefing, offer to schedule it.

## Common pitfalls

- **Dumping instead of triaging.** A list of 40 emails is not a briefing. Cut hard.
- **Burying the lede.** The thing on fire goes first, not in chronological order.
- **Missing the deadline/why.** "Reply to Sam" is weak; "Reply to Sam — he needs your OK to
  send the client proposal today" is a briefing.
- **Silent gaps.** If you couldn't reach a source, say so; don't let the principal assume
  it was clear.
