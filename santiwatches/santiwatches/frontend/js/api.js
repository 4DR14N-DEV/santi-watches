/**
 * js/api.js
 *
 * Capa única de comunicación con el backend.
 * Ahora es un módulo ES con exports nombrados.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const response = await fetch(BASE_URL + path, {
    credentials: 'include',
    ...options,
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
    login(username, password) {
      return request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
    },
    logout() {
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
