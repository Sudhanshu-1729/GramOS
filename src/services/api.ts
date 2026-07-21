const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Check if backend API server is online
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL.replace('/api/v1', '')}/health`);
    if (res.ok) {
      const data = await res.json();
      return data.status === 'healthy';
    }
  } catch (e) {
    // Offline
  }
  return false;
}

// Fetch live alternate risk assessment
export async function getRiskAssessment(businessId: string): Promise<any | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/analytics/risk/${businessId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend risk evaluation failed, using local mock.', e);
  }
  return null;
}

// Fetch cash flow forecast
export async function getCashFlowForecast(businessId: string, horizon: number = 30): Promise<any | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/analytics/forecast/${businessId}?horizon_days=${horizon}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend cash flow forecast failed, using local mock.', e);
  }
  return null;
}

// Run scenario stress test
export async function runSimulation(businessId: string, params: {
  rainfall_change_percent: number;
  mandi_price_change_percent: number;
  loan_applied_amount: number;
  interest_rate_percent?: number;
  subsidy_amount?: number;
  inventory_change_percent?: number;
}): Promise<any | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/analytics/simulation/${businessId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend simulation failed, using local mock.', e);
  }
  return null;
}

// Run LangGraph boardroom debate
export async function runBoardroomEvaluation(businessId: string, loanAmount: number, tenure: number): Promise<any | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/analytics/boardroom/${businessId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loan_amount: loanAmount,
        tenure_months: tenure
      })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend boardroom debate failed, using local mock.', e);
  }
  return null;
}

// Fetch matched government schemes
export async function getSchemeMatches(businessId: string): Promise<any | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/analytics/schemes/${businessId}`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend scheme matching failed, using local mock.', e);
  }
  return null;
}

// Upload document for OCR parsing and invoice audit
export async function uploadDocument(businessId: string, file: File, docType: 'INVOICE' | 'BANK_STATEMENT'): Promise<any | null> {
  try {
    const formData = new FormData();
    formData.append('document_type', docType);
    formData.append('file', file);

    const res = await fetch(`${BACKEND_URL}/analytics/documents/upload/${businessId}`, {
      method: 'POST',
      body: formData
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend document upload failed, using local mock.', e);
  }
  return null;
}

// Query Voice assistant
export async function queryVoiceAssistant(businessId: string, queryText: string, lang: string = 'hi'): Promise<any | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/analytics/voice/${businessId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: lang,
        text_query: queryText
      })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend voice assistant failed, using local mock.', e);
  }
  return null;
}

// Fetch general business recommendations
export async function getRecommendations(businessId: string): Promise<any | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/recommendations/${businessId}`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend recommendations failed, using local mock.', e);
  }
  return null;
}

// Fetch generated Credit Memo
export async function getCreditMemo(businessId: string): Promise<any | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/credit-memo/${businessId}`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend credit memo retrieval failed, using local mock.', e);
  }
  return null;
}

