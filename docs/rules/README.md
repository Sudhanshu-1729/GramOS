# Risk Underwriting & Alert Rules - RuralOS

## 1. Credit Appraisal Rules Engine
The platform calculates default probabilities and risk levels based on alternate data factors:
* **Rule 1 (Excellent)**: Alternate Credit Score $\ge$ 750 AND default probability $\le$ 10%. Eligible for Mudra subvented rate (8.5%).
* **Rule 2 (Good)**: Alternate Credit Score $\ge$ 650 AND default probability $\le$ 25%. Eligible with cooperative escrow bank sweeps.
* **Rule 3 (Critical)**: Alternate Credit Score < 650 OR default probability > 25%. Triggers mandatory manual field appraisal visits.

---

## 2. Early Warning Climate Limits
* **Rainfall Deficit Threshold**: If monsoon rainfall deficit exceeds **-20%**, the system triggers a localized warning.
* **NDVI Drought Check**: If crop greenness index drops below **0.6**, the system generates an alert inside the Bank Portfolio list, instructing officers to adjust subvention levels.

---

## 3. Automated Cooperative Sweeps
* Daily payouts from Gokul or Amul cooperative ledgers are automatically split:
  * **85%**: Deposited directly to the farmer's liquid cash account.
  * **15%**: Swept into the debt service escrow account, ensuring monthly EMIs are pre-funded.
