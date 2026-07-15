/**
 * js/api.js
 *
 * Capa única de comunicación con el backend.
 * Token guardado en localStorage y enviado como Authorization header
 * para soporte cross-origin (Vercel → Render).
 */

const API_URL = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'santiwatches_token';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // No setear Content-Type si es FormData (el browser lo setea solo con el boundary)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(API_URL + path, {
    credentials: 'include',
    ...options,
    headers,
  });

  let data = null;
  try {
    data = await response.json();
  } catch (_) {
    // Respuesta sin cuerpo JSON
  }

  if (!response.ok) {
    const message = (data && data.error) || 'Ocurrió un error inesperado.';
    throw new Error(message);
  }

  return data;
}

export const SantiAPI = {
  auth: {
    async login(username, password) {
      const data = await request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (data.token) {
        setToken(data.token);
      }
      return data;
    },
    logout() {
      clearToken();
      return request('/api/auth/logout', { method: 'POST' });
    },
    me() {
      return request('/api/auth/me');
    },
  },

  watches: {
    getAll() {
      return request('/api/watches');
    },
    create(formData) {
      return request('/api/watches', {
        method: 'POST',
        body: formData,
      });
    },
    toggleSoldOut(id) {
      return request(`/api/watches/${id}/toggle-sold-out`, {
        method: 'PATCH',
      });
    },
    delete(id) {
      return request(`/api/watches/${id}`, { method: 'DELETE' });
    },
  },
};

export { API_URL };
