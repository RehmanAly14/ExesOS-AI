# AI Pipeline

This directory contains the AI Pipeline for ExesOS AI.

The AI Pipeline is isolated from the existing backend modules so it can be developed independently without affecting the current application.

## Folder Structure

### orchestrator/
Responsible for:
- LangGraph workflow
- Multi-agent architecture
- Workflow orchestration

Owner: Dinesh

---

### agents/

Contains all AI agents.

#### ceo/
Responsible for:
- CEO Agent
- Task planning
- Task delegation

Owner: Dinesh

#### finance/
Finance domain specialist.

Owner: Owen

#### marketing/
Marketing domain specialist.

Owner: Owen

#### business-analyst/
Business analysis specialist.

Owner: Owen

---

### memory/

Responsible for future conversation and workflow memory.

Owner: Dinesh

---

### prompts/

#### engineering/

Core prompt engineering and orchestration prompts.

Owner: Dinesh

#### optimization/

Prompt optimization for specialist agents.

Owner: Owen

---

### tools/

Shared tool integrations for specialist agents.

Owner: Owen

---

### retrieval/

Responsible for:
- Vector search
- Context retrieval
- RAG context packaging
- Retrieval evaluation design

Owner: Owen

---

### testing/

Agent testing and validation.

Owner: Owen

---

### evaluation/

Evaluation and benchmarking of agent performance.

Owner: Owen

---

## Current Status

This directory currently contains only the project structure.

No AI logic has been implemented.

Implementation will begin after the Business Profile, Document Upload, and Conversation modules are completed.
