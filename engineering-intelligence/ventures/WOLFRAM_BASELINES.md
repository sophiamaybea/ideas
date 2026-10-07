# Wolfram Venture Baselines

Initial run: 2026-10-07

**Important:** these are model outputs under explicit assumed distributions, not observed revenue and not guarantees.

Method: 20,000 Monte Carlo samples per venture. Inputs vary monthly qualified opportunities, conversion probability, price, gross margin and fixed cost.

| Venture | Mean monthly revenue | P10 | Median | P90 | Mean contribution profit | P(revenue >= $100) | Modelled median first-dollar time |
|---|---:|---:|---:|---:|---:|---:|---:|
| Repo-to-Revenue Foundry | $1,129 | $166 | $838 | $2,473 | $968 | 93.3% | 6.32d |
| Autonomous Website Revenue Rescue | $4,256 | $571 | $2,997 | $9,479 | $3,514 | 95.8% | 4.15d |
| Agent Procurement Hunter | $5,346 | $706 | $3,868 | $11,958 | $4,084 | 93.6% | 6.04d |
| Public Data Refinery | $1,169 | $162 | $831 | $2,579 | $1,024 | 93.9% | 4.47d |
| AI Stack Cost Optimizer | $4,488 | $556 | $3,161 | $10,005 | $3,628 | 93.7% | 5.95d |
| Autonomous Micro-SaaS Foundry | $266 | $0 | $166 | $650 | $215 | 64.7% | 14.26d |
| Open-Source Managed Service Arbitrage | $1,682 | $117 | $1,151 | $3,893 | $1,387 | 90.1% | 8.35d |
| Autonomous QA + Reconstruction Lab | $2,950 | $306 | $2,037 | $6,729 | $2,402 | 91.8% | 6.97d |

## What happens next

The priors must be replaced with evidence. Each experiment records actual opportunity count, response/conversion, accepted price, delivery cost, compute cost and time-to-cash. The next Wolfram run performs Bayesian/practical updates and reports prediction error.

A venture is not considered commercially validated because this table looks attractive.
