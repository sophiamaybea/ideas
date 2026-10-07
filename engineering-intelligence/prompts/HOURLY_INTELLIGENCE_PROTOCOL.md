# Hourly Intelligence Protocol

Every run should perform these stages.

## A. Recent-work ingestion
Retrieve the user's relevant ChatGPT work from roughly the preceding hour. Extract only durable technical/product/business knowledge:
- new systems or product ideas;
- architectural decisions;
- technologies/repositories mentioned;
- changed assumptions;
- constraints;
- experiments;
- results;
- rejected approaches.

Do not dump chat transcripts.

## B. GitHub frontier scan
Search for:
- repositories created recently;
- mature repositories pushed recently;
- major releases/architecture changes where discoverable.

Priority capability domains:
1. agent orchestration/runtime;
2. browser/computer use;
3. coding agents;
4. memory/RAG/knowledge graphs;
5. evals/verification/observability;
6. durable execution;
7. permissions/security;
8. tool/auth integrations;
9. scraping/data acquisition;
10. optimisation/simulation/decision science;
11. payment/treasury infrastructure;
12. web/product reconstruction;
13. local inference and cost reduction.

## C. Archaeology
For high-signal candidates, inspect repository metadata and README/source structure where useful. Capture capability, licence, maintenance, architecture, integration seam, risks and build-vs-borrow decision.

## D. Synthesis
Ask:
- What became possible?
- What got cheaper?
- What existing plan can be simplified?
- What component became obsolete?
- What new missing abstraction is visible?
- Can two unrelated repos combine into a new capability?
- Does this alter expected economics?
- Does it create a new product/business hypothesis?

## E. Repository update
Update only the relevant knowledge files, deduplicate, preserve provenance/date and append a timestamped log.

## F. Selection
Promote/demote repos and hypotheses based on evidence, not enthusiasm.

## G. Commit discipline
Commit concise, meaningful changes to the `engineering-intelligence` branch. Never modify `main` from the hourly process.
