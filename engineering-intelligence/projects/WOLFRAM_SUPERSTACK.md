# Wolfram Super-Stack

## Role
Wolfram is the quantitative orchestrator and verifier, not necessarily the engine for every computation.

Pattern:
```
AI agent
  → formalise problem
  → Wolfram world/objective model
  → delegate specialist computation when stronger
  → retrieve result
  → verify/interrogate
  → simulate/optimise
  → choose experiment/action
  → observe reality
  → update model
```

## Current building blocks
- WolframResearch/AgentTools
- WolframResearch/WolframClientForPython
- pymoo
- Optuna
- Pyomo
- sensitivity-analysis tools
- graph/network packages
- simulation/agent-based modelling libraries

## What belongs in Wolfram
- objective functions;
- expected value;
- uncertainty distributions;
- Bayesian updates;
- Monte Carlo;
- symbolic manipulation;
- optimisation;
- Pareto fronts;
- sensitivity;
- scenario/counterfactual analysis;
- resource allocation;
- optimal stopping;
- anomaly detection in business metrics;
- digital-twin state.

## What does not automatically belong in Wolfram
- ordinary CRUD;
- browser automation;
- commodity queues;
- authentication;
- front-end state;
- every ML inference request.

Choose the strongest engine, then let the quantitative layer interrogate and combine it.
