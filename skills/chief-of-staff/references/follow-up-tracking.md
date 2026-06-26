# Follow-up & Commitment Tracking

Commitments are where things quietly fall apart: someone says "I'll send that over," it's
never written down, and two weeks later it's a fire. The Personal Assistant's job is to make
sure every commitment — the principal's and other people's — is captured, owned, and chased
to closure.

## Capture

Action items come from many places. Pull commitments from:

- **Meetings** — from notes or transcripts the principal provides ("Action items:" lines,
  but also implied promises buried in discussion).
- **Email & Slack** — "I'll get you the numbers by Friday," "can you review this?", "let's
  circle back next week."
- **The principal directly** — "remind me to follow up with Legal."

For each item, capture: what, who owns it, who it's for, when it's due, and where it came
from (link). If a due date is implied but unstated, infer a reasonable one and mark it as an
estimate.

## Track in a spreadsheet

Maintain a follow-up tracker as a real `.xlsx` (use the `xlsx` skill). Start from
`assets/follow-up-tracker.csv` if creating fresh. Columns:

| Item | Owner | For (waiting on me?) | Due | Status | Source | Last update |
|------|-------|----------------------|-----|--------|--------|-------------|

Status values: `Open`, `In progress`, `Blocked`, `Waiting on them`, `Done`, `Dropped`.

When you update the tracker, **append and update — never overwrite the principal's existing
rows or history.** Add new commitments, update statuses, and stamp the "Last update" date.
Preserve `Done`/`Dropped` rows for the record unless asked to archive them.

## Chase

The value is in the follow-through. On each pass (often a scheduled one):

- Flag items **overdue** or **due today**.
- Separate **"waiting on me"** (the principal needs to act) from **"waiting on them"**
  (someone owes the principal — time for a nudge).
- For "waiting on them" items past due, offer to draft a friendly nudge.

## Output format

```
## Follow-ups — [Date]

### ⚠️ Overdue
- [Item] — owner: [who] — due [date] — [status]. [link]

### 📌 Due soon
- ...

### ⏳ Waiting on others (nudge?)
- [Item] — [who] owes this since [date]. [draft a nudge?]

### ✅ Recently closed
- ...
```

## On a schedule

A weekly (or daily) follow-up sweep is a high-value recurring task: re-read the tracker,
re-scan email/Slack for movement, update statuses, and surface what's overdue. Offer to set
this up.

## Pitfalls

- **Capturing without chasing.** A tracker no one looks at is dead weight. The sweep is the
  point.
- **Losing the source.** Always link back to where the commitment was made, so it's
  verifiable and the principal can act in one click.
- **Overwriting history.** Update in place; don't wipe the principal's prior entries.
