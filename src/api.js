/**
 * src/api.js
 * Centralised API client. All backend calls go through here.
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getToken() {
  return sessionStorage.getItem('cf_token') || '';
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: authHeaders(),
    credentials: 'include',
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function apiGetMe() {
  return request('GET', '/api/auth/me');
}

export async function apiSendOtp(email) {
  return request('POST', '/api/auth/send-otp', { email });
}

export async function apiVerifyOtp(email, code) {
  return request('POST', '/api/auth/verify-otp', { email, code });
}

export async function apiLogout() {
  const res = await fetch(`${BASE}/api/auth/logout`, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'include',
  });
  sessionStorage.removeItem('cf_token');
  return res.json().catch(() => ({}));
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function apiGetProfile() {
  return request('GET', '/api/profile');
}

export async function apiUpdateProfile(data) {
  return request('PUT', '/api/profile', data);
}

export async function apiUpdateNotifications(prefs) {
  return request('PUT', '/api/profile/notifications', prefs);
}

export async function apiDeleteAccount() {
  return request('DELETE', '/api/profile');
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export async function apiGetProjects(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return request('GET', `/api/projects${qs ? `?${qs}` : ''}`);
}

export async function apiGetProject(slug) {
  return request('GET', `/api/projects/${slug}`);
}

export async function apiCreateProject(data) {
  return request('POST', '/api/projects', data);
}

export async function apiUpdateProject(slug, data) {
  return request('PUT', `/api/projects/${slug}`, data);
}

export async function apiDeleteProject(slug) {
  return request('DELETE', `/api/projects/${slug}`);
}

// ─── Contributors ─────────────────────────────────────────────────────────────

export async function apiGetContributors(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return request('GET', `/api/contributors${qs ? `?${qs}` : ''}`);
}

export async function apiGetContributor(slug) {
  return request('GET', `/api/contributors/${slug}`);
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export async function apiUploadImages(files) {
  const token = getToken();
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append('images', file));

  const res = await fetch(`${BASE}/api/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: 'include',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data; // { urls: string[] }
}

// ─── AI Chat ──────────────────────────────────────────────────────────────────

export async function apiChat(message, history = []) {
  return request('POST', '/api/ai/chat', { message, history });
}
