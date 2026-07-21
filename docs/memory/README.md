# Data Storage & State Management - RuralOS

## 1. Local Cache & Offline State Sync
To support rural connectivity conditions, RuralOS utilizes a local-first storage configuration:
- **`localStorage`**: Stores drafted loan applications and profile swaps.
- **Offline Indicator**: A header status tag indicating if backend APIs are offline. If offline, the client transitions to "Sandbox Sandbox Mode," loading local fallback dataset profiles so the application remains fully functional during appraisal demonstrations.

---

## 2. API Schema Sync
All dynamic fields are validated against strict JSON schemas:
- **Risk Assessment**:
  - `default_probability`: Float parameter (0.0 to 1.0).
  - `liquidity_risk`: Evaluated against DSCR inputs.
  - `evidence`: JSON containing `outstanding_loans`, `supplier_stability_score`, and `historical_inflows`.
- **Forecast Horizon Outputs**:
  - Projections for 30, 60, 90, and 180 days with lower and upper confidence limits.

---

## 3. Data Flow Ledger Sweeps
Cooperative payouts are routed to a mock escrow account. If an early warning check detects a climate drought trigger, the system performs automatic daily margin balances sweeps to assure bank EMI repayment.
