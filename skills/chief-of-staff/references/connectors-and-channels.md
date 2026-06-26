# Connectors & Channels

A Personal Assistant is only as good as the information they can reach and the channels they can
act through. This file covers what to connect, how to choose a channel, and — for Base44 —
how to wire these workflows into an app.

## Taking stock at the start of a task

Before gathering context, know what's available:

1. **What's connected?** Check which tools/MCP connectors are active (email, calendar,
   Slack, Drive/Docs, Notion, a task system, etc.). Use them directly.
2. **What's uploaded?** Treat files the principal dropped in (notes, decks, CSVs, contracts)
   as first-class context.
3. **What's missing?** If the task needs a source that isn't connected, don't give up —
   search the connector registry and suggest connecting it. Then proceed with what you have
   and note the gap.

## Channels and what they're for

| Channel | Read | Write | Typical Personal Assistant use |
|---------|------|-------|----------------------------|
| **Email** (Gmail/Outlook) | Inbox, threads | Draft/send replies | Triage, follow-ups, drafting on the principal's behalf |
| **Calendar** (Google/Outlook) | Events, attendees | Create/propose events | Briefings, meeting prep, scheduling |
| **Slack** | Channels, DMs, mentions | Post messages, digests | Deliver briefings to a private channel, scan for what needs attention, post team updates |
| **Docs/Drive/Notion** | Documents, files | Create/update docs | Pull context, draft memos, maintain trackers |
| **SMS** | — | Send texts | Urgent nudges, reminders |
| **WhatsApp** | varies | Send messages | Reaching the principal or contacts on their preferred channel |
| **Spreadsheets** | Read tabular data | Create/update `.xlsx` | Trackers: follow-ups, stakeholders, decisions |

### Choosing a channel

- **Deliver briefings** wherever the principal lives — a private Slack DM/channel and email
  are the most common. Confirm their preference once, then default to it.
- **Keep private things private.** Don't post comp, personnel, or sensitive strategy into a
  shared channel. Default to DM/email for anything sensitive.
- **Match the contact's channel.** When drafting outbound messages, use the channel the
  recipient actually uses.

## Base44 app patterns

When the goal is to *build* these capabilities into a Base44 app rather than run them
conversationally, the same workflows map onto Base44 building blocks. Base44 provides Slack
(user and bot), email (Resend), SMS (Twilio), WhatsApp (via backend functions / automation
bridges), Google Sheets, Notion, and connections to thousands of apps via automations, plus
backend functions for any external API.

- **Daily briefing → scheduled backend function.** A backend function runs on a schedule,
  reads from the connected sources (or the app's own database), composes the briefing, and
  delivers it via the Slack bot, email, or SMS connector. Store delivery preferences and the
  last-run timestamp in the app database.
- **Follow-up tracker → database collection + view.** Model commitments as records (item,
  owner, due, status, source). Build a list/board view with filters for overdue and
  waiting-on-me. Optionally sync to Google Sheets for the principal to edit.
- **Meeting prep → on-demand function + view.** A function gathers calendar + contact +
  thread context for a selected meeting and renders a brief in the app; cache results so
  reopening is instant.
- **Notifications → Slack/SMS/WhatsApp connectors.** Use the Slack bot to post digests to a
  channel, Twilio for urgent texts, and backend functions for WhatsApp/any other API.
- **Sensitive data & secrets.** Keep API keys server-side in backend functions, never in the
  client. Respect the workspace's permissions for who can see what.

When building in Base44, confirm which connectors the workspace/plan actually has enabled —
capabilities depend on what's connected and authorized.
