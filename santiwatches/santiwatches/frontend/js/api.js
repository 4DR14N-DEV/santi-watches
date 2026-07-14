/**
 * js/api.js
 *
 * Capa única de comunicación con el backend. Todas las llamadas
 * fetch del proyecto pasan por aquí, para no repetir manejo de
 * errores ni configuración de `credentials` en cada archivo.
 *
 * No usa módulos ES (import/export) porque el proyecto se sirve
 * como scripts clásicos en <script> tags; en su lugar, expone un
 * objeto global `SantiAPI`.
 */

(function () {
  'use strict';

  const BASE_URL = ''; // mismo origen: el backend sirve el frontend.

  /**
   * Wrapper de fetch que:
   * - siempre manda cookies (credentials: 'include'), necesario
   *   para que el JWT httpOnly viaje con cada petición.
   * - parsea la respuesta como JSON.
   * - lanza un Error con el mensaje del backend si algo falla.
   */
  async function request(path, options = {}) {
    const response = await fetch(BASE_URL + path, {
      credentials: 'include',
      ...options,
    });

    let data = null;
    try {
      data = await response.json();
    } catch (_) {
      // Respuesta sin cuerpo JSON (poco común, pero no debe romper).
    }

    if (!response.ok) {
      const message = (data && data.error) || 'Ocurrió un error inesperado.';
      throw new Error(message);
    }

    return data;
  }

  const SantiAPI = {
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
      /**
       * @param {FormData} formData - debe incluir name, description,
       *   price (opcional) e image (archivo).
       */
      create(formData) {
        return request('/api/watches', {
          method: 'POST',
          body: formData, // FormData define su propio Content-Type con boundary.
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

  window.SantiAPI = SantiAPI;
})();
