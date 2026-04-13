const API_URL = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001');

const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('ua_token') : null;

const headers = (extra: Record<string, string> = {}) => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
};

const handleResponse = async (res: Response) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return data;
};

// ── AUTH ──────────────────────────────────────────────────────
export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    fetch(`${API_URL}/api/auth/register`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(handleResponse),

  login: (body: { email: string; password: string }) =>
    fetch(`${API_URL}/api/auth/login`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(handleResponse),

  logout: () =>
    fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' }),

  me: () =>
    fetch(`${API_URL}/api/auth/me`, { credentials: 'include', headers: headers() }).then(handleResponse),

  updateProfile: (body: Record<string, string>) =>
    fetch(`${API_URL}/api/auth/profile`, {
      method: 'PUT', credentials: 'include',
      headers: headers(),
      body: JSON.stringify(body),
    }).then(handleResponse),
};

// ── REPORTS ───────────────────────────────────────────────────
export const reportsApi = {
  getAll: (params: Record<string, string> = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${API_URL}/api/reports?${q}`).then(handleResponse);
  },

  getMy: () =>
    fetch(`${API_URL}/api/reports/my`, { credentials: 'include', headers: headers() }).then(handleResponse),

  getStats: () =>
    fetch(`${API_URL}/api/reports/stats`).then(handleResponse),

  getOne: (id: string) =>
    fetch(`${API_URL}/api/reports/${id}`).then(handleResponse),

  create: (formData: FormData) =>
    fetch(`${API_URL}/api/reports`, {
      method: 'POST', credentials: 'include',
      headers: { ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
      body: formData,
    }).then(handleResponse),

  delete: (id: string) =>
    fetch(`${API_URL}/api/reports/${id}`, {
      method: 'DELETE', credentials: 'include', headers: headers(),
    }).then(handleResponse),

  upvote: (id: string) =>
    fetch(`${API_URL}/api/reports/${id}/upvote`, {
      method: 'POST', credentials: 'include', headers: headers(),
    }).then(handleResponse),
};

// ── ISSUES ────────────────────────────────────────────────────
export const issuesApi = {
  getAll: () => fetch(`${API_URL}/api/issues`).then(handleResponse),
  getOne: (id: string) => fetch(`${API_URL}/api/issues/${id}`).then(handleResponse),
};

// ── ADMIN ─────────────────────────────────────────────────────
export const adminApi = {
  getStats: () =>
    fetch(`${API_URL}/api/admin/stats`, { credentials: 'include', headers: headers() }).then(handleResponse),

  getReports: (params: Record<string, string> = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${API_URL}/api/admin/reports?${q}`, { credentials: 'include', headers: headers() }).then(handleResponse);
  },

  updateReportStatus: (id: string, status: string, adminNote?: string) =>
    fetch(`${API_URL}/api/admin/reports/${id}/status`, {
      method: 'PATCH', credentials: 'include', headers: headers(),
      body: JSON.stringify({ status, adminNote }),
    }).then(handleResponse),

  deleteReport: (id: string) =>
    fetch(`${API_URL}/api/admin/reports/${id}`, {
      method: 'DELETE', credentials: 'include', headers: headers(),
    }).then(handleResponse),

  getUsers: (params: Record<string, string> = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${API_URL}/api/admin/users?${q}`, { credentials: 'include', headers: headers() }).then(handleResponse);
  },

  updateUserRole: (id: string, role: string) =>
    fetch(`${API_URL}/api/admin/users/${id}/role`, {
      method: 'PATCH', credentials: 'include', headers: headers(),
      body: JSON.stringify({ role }),
    }).then(handleResponse),

  deleteUser: (id: string) =>
    fetch(`${API_URL}/api/admin/users/${id}`, {
      method: 'DELETE', credentials: 'include', headers: headers(),
    }).then(handleResponse),
};
