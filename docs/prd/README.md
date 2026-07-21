# Product Requirements Document (PRD) - RuralOS

## 1. Product Overview
RuralOS is an AI-powered financial intelligence platform designed to close India's ₹8.5 Lakh Crore rural credit gap. The system empowers smallholder farmers, dairy owners, Self-Help Groups (SHGs), and Farmer Producer Organizations (FPOs) to build a robust digital credit footprint without traditional collateral.

---

## 2. Core User Personas & Journeys

### A. Rural Enterprise (Farmer / Dairy Owner / Retailer)
* **Goal**: Appraise their business health, stress-test cash flows, and apply for subvented government schemes or micro-loans.
* **Journey**: Logs in via passcode -> inspects digital twin -> runs simulation stress-tests -> applies for Mudra or AHIDF loans.

### B. NABARD Field Officer
* **Goal**: Assess local villages, review satellite greenness indices, and check pending applications.
* **Journey**: Views regional state heatmap -> audits local applicant twins offline/online -> pushes appraisal recommendations.

### C. Bank Officer
* **Goal**: Review explainable AI risk assessments and boardroom agent debates to verify credit limits.
* **Journey**: Opens AI Boardroom panel -> reviews CFO, Risk, Climate opinions -> outputs structured Credit Memo.

---

## 3. Alternative Credit Metrics Matrix
| Dimension | Data Feed Source | Target Weight | Threshold / Alert Limit |
| :--- | :--- | :--- | :--- |
| **Liquidity** | UPI transaction sweeps | 25% | < 1.1x DSCR |
| **Market Strength** | Gokul/Amul Milk coop invoices | 20% | Buyer rating downgrades |
| **Climate Dependency** | Landsat NDVI satellite check | 15% | > 20% rainfall deficit |
| **Repayment History** | Utility & Fertilizer ledger audits | 25% | Late payment blips |
| **Digital Adoption** | Payment app & SMS log audits | 15% | Non-digital ledger defaults |

---

## 4. Key Performance Indicators (KPIs)
* **Underwriting Processing Duration**: Reduced from 45 days to < 10 minutes.
* **Non-Performing Assets (NPAs)**: Projected default rate under 2.8% via early NDVI drought warning sweeps.
* **Disbursal Cost Efficiency**: Paperless ledger appraisal cuts administrative expenses by 85%.
