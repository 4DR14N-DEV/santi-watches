/**
 * middleware/authMiddleware.js
 *
 * Protege las rutas que solo el administrador puede usar
 * (crear, editar, marcar como agotado o eliminar relojes).
 *
 * El token JWT se guarda en una cookie httpOnly (no en localStorage),
 * para reducir el riesgo de robo del token vía XSS.
 */

'use strict';

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_inseguro_cambiar';

function requireAuth(req, res, next) {
  const token = req.cookies && req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'No autenticado. Inicia sesión para continuar.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, username }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Sesión inválida o expirada. Inicia sesión de nuevo.' });
  }
}

module.exports = { requireAuth, JWT_SECRET };
