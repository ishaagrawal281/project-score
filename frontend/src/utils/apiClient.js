/**
 * API Client Utility
 * Automatically includes authentication token in all requests
 */

import { getSession } from 'next-auth/react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/api/folders')
 * @param {object} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function apiFetch(endpoint, options = {}) {
  const session = await getSession();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (session?.accessToken) {
    headers.Authorization = `Bearer ${session.accessToken}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${BACKEND_URL}${endpoint}`;

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * GET request
 */
export async function apiGet(endpoint, options = {}) {
  return apiFetch(endpoint, {
    ...options,
    method: 'GET',
  });
}

/**
 * POST request
 */
export async function apiPost(endpoint, data, options = {}) {
  return apiFetch(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT request
 */
export async function apiPut(endpoint, data, options = {}) {
  return apiFetch(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request
 */
export async function apiDelete(endpoint, options = {}) {
  return apiFetch(endpoint, {
    ...options,
    method: 'DELETE',
  });
}
