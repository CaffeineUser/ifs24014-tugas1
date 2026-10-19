const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status = 0, payload = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

export function getToken() {
  return sessionStorage.getItem('suarakita_token');
}

export function setToken(token) {
  if (token) sessionStorage.setItem('suarakita_token', token);
  else sessionStorage.removeItem('suarakita_token');
}

export async function apiRequest(path, options = {}) {
  const { body, headers = {}, ...rest } = options;
  const token = getToken();
  const requestHeaders = { Accept: 'application/json', ...headers };
  if (token) requestHeaders.Authorization = `Bearer ${token}`;
  if (body && !(body instanceof FormData) && !requestHeaders['Content-Type']) requestHeaders['Content-Type'] = 'application/json';
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...rest,
      headers: requestHeaders,
      body: body && !(body instanceof FormData) && typeof body !== 'string' ? JSON.stringify(body) : body,
    });
  } catch {
    throw new ApiError('Tidak dapat terhubung ke server. Periksa apakah backend Express.js sedang berjalan.', 0);
  }
  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json().catch(() => ({})) : null;
  if (!response.ok) {
    if (response.status === 401 && getToken()) {
      setToken(null);
      window.dispatchEvent(new Event('suarakita:unauthorized'));
    }
    throw new ApiError(payload?.message || payload?.error || `Permintaan gagal (${response.status}).`, response.status, payload);
  }
  return payload;
}

export const api = {
  login: (input) => apiRequest('/auth/login', { method: 'POST', body: input }),
  register: (input) => apiRequest('/auth/register', { method: 'POST', body: input }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  me: () => apiRequest('/auth/me'),
  categories: () => apiRequest('/categories'),
  reports: (params = {}) => apiRequest(`/reports?${new URLSearchParams(Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined))}`),
  report: (id) => apiRequest(`/reports/${id}`),
  createReport: (formData) => apiRequest('/reports', { method: 'POST', body: formData }),
  history: (id) => apiRequest(`/reports/${id}/history`),
  support: (id) => apiRequest(`/reports/${id}/supports`, { method: 'POST' }),
  removeSupport: (id) => apiRequest(`/reports/${id}/supports/me`, { method: 'DELETE' }),
  updateStatus: (id, input) => apiRequest(`/reports/${id}/status`, { method: 'PATCH', body: input }),
  updateUrgency: (id, urgency) => apiRequest(`/reports/${id}/urgency`, { method: 'PATCH', body: { urgency } }),
  dashboardSummary: () => apiRequest('/dashboard/summary'),
  dashboardByCategory: () => apiRequest('/dashboard/by-category'),
  dashboardByStatus: () => apiRequest('/dashboard/by-status'),
  dashboardPriority: () => apiRequest('/dashboard/priority?limit=5'),
};

export function photoUrl(id) {
  return `${API_BASE}/reports/${id}/photo`;
}
