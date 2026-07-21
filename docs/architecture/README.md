# System Architecture Document - RuralOS

## 1. Technical Architecture Overview
RuralOS is architected as a decoupled client-server platform optimized for high data density, low-latency client-side rendering, and robust fail-safe operations.

```mermaid
graph TD
  Client[React Vite Client] -->|HTTP / JSON| API[FastAPI Gateway]
  API -->|SQL Queries| DB[(SQLite Database)]
  API -->|Scenarios Simulation| ML[LightGBM Forecaster]
  API -->|Multi-Agent Debate| AgentBlock[LangGraph Orchestrator]
  AgentBlock --> CFO[CFO Agent]
  AgentBlock --> Climate[Climate Risk Agent]
  AgentBlock --> Fraud[Fraud Investigator Agent]
```

---

## 2. Platform Data Pipeline & Engine Flow
This model maps the transition from raw inputs to ML intelligence predictions, showing the endpoints loaded in the dashboards:

```mermaid
graph TD
  subgraph Inputs["1. Rural Entrepreneur Inputs"]
    UPI[UPI Transactions]
    SR[Sales Records]
    EX[Expenses]
    INV[Inventory]
    CR[Crop Data]
    WE[Weather Telemetry]
    MP[Market Prices]
    GS[Govt Schemes catalog]
  end

  Inputs -->|Raw Feeds| DataPrep["2. Data Cleaning & Processing"]
  DataPrep -->|Processed Inflows| FE["3. AI Feature Engineering Pipeline"]
  
  subgraph MLEngine["4. Machine Learning Engine"]
    CF_Model[Cash Flow Prediction Model]
    Risk_Model[Risk Detection Model]
    Score_Engine[Rural Credit Score Engine]
    Income_Forecast[Seasonal Income Forecasting]
    Loan_Prediction[Loan Eligibility Prediction]
    Govt_Recommend[Government Scheme Recommendation]
  end

  FE -->|Feature Vectors| MLEngine

  subgraph DecIntel["5. Decision Intelligence Layer"]
    Dashboard_Ent[Entrepreneur Dashboard]
    Dashboard_Bank[Bank Dashboard]
    Dashboard_Gov[Govt Dashboard]
  end

  MLEngine -->|Predictive Inference| DecIntel

  subgraph Actions_Ent[Entrepreneur Actions]
    Forecast_Ent[Cash Forecast]
    Alerts_Ent[Risk Alerts]
    Advice_Ent[Business Advice]
  end
  Dashboard_Ent --> Actions_Ent

  subgraph Actions_Bank[Bank Actions]
    Decision_Bank[Credit Decision]
    Approval_Bank[Loan Approval]
    Risk_Bank[Risk Score]
  end
  Dashboard_Bank --> Actions_Bank

  subgraph Actions_Gov[Govt Actions]
    Analytics_Gov[Rural Analytics]
    Inclusion_Gov[Financial Inclusion]
    Monitoring_Gov[Scheme Monitoring]
  end
  Dashboard_Gov --> Actions_Gov

  classDef inputNode fill:#0b3c26,stroke:#10b981,stroke-width:1px,color:#fff;
  classDef engineNode fill:#1e1b4b,stroke:#6366f1,stroke-width:1px,color:#fff;
  classDef dashboardNode fill:#1c1917,stroke:#78716c,stroke-width:1px,color:#fff;
  
  class UPI,SR,EX,INV,CR,WE,MP,GS inputNode;
  class CF_Model,Risk_Model,Score_Engine,Income_Forecast,Loan_Prediction,Govt_Recommend engineNode;
  class Dashboard_Ent,Dashboard_Bank,Dashboard_Gov dashboardNode;
```

### Raw Data Flow Schematic
```text
                 Rural Entrepreneur
                         │
                         ▼
          Financial & Business Data Collection
──────────────────────────────────────────────────
• UPI Transactions
• Sales Records
• Expenses
• Inventory
• Crop Data
• Weather
• Market Prices
• Government Schemes
──────────────────────────────────────────────────
                         │
                         ▼
               Data Cleaning & Processing
                         │
                         ▼
          AI Feature Engineering Pipeline
                         │
                         ▼
──────────────────────────────────────────────────
           Machine Learning Engine
──────────────────────────────────────────────────
│ Cash Flow Prediction Model                  │
│ Risk Detection Model                        │
│ Rural Credit Score Engine                   │
│ Seasonal Income Forecasting                 │
│ Loan Eligibility Prediction                 │
│ Government Scheme Recommendation            │
──────────────────────────────────────────────────
                         │
                         ▼
               Decision Intelligence Layer
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
 Entrepreneur Dashboard  Bank Dashboard  Govt Dashboard
        │                │                │
        ▼                ▼                ▼
Cash Forecast      Credit Decision   Rural Analytics
Risk Alerts        Loan Approval     Financial Inclusion
Business Advice    Risk Score        Scheme Monitoring
```

---

## 3. Component Blueprint

### A. React Frontend Core (`src/`)
* **Framework**: React 18, Vite 8, TypeScript.
* **Styling**: TailwindCSS 4, Custom Glassmorphism, CRED glows.
* **Charts**: Recharts (Radar, Area, Bar, Custom Gauges).
* **Interactions**: Framer Motion, keyboard hotkeys event handlers.

### B. FastAPI Backend Core (`backend/`)
* **Endpoint Router**: Direct REST API routes for simulation models, PDF memos, and courtroom consensus debates.
* **Database Layer**: SQLite engine storing credit profiles, transaction ledgers, and early warning notifications.
* **Agents Framework**: Independent LangGraph node agents analyzing credit and drought alerts:
  * **CFO Agent**: Evaluates debt-service coverage ratio (DSCR).
  * **Climate Agent**: Monitors NDVI satellite indexes and moisture stress.
  * **Fraud Agent**: Runs anomaly audits on uploaded ledger PDF invoices.

---

## 4. Database Schema Blueprint
* **`businesses`**: Profile ID, name, sector, location, baseline score, assets, outstanding loans.
* **`transactions`**: Credit/debit logs, cooperative milk payments, invoice uploads.
* **`early_warnings`**: Deficit triggers, price changes, local drought warnings.
