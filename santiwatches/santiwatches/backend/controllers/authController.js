/**
 * controllers/authController.js
 *
 * Login / logout del administrador. Solo existe un usuario en todo
 * el sistema, creado desde variables de entorno en el arranque
 * (ver server.js -> seedAdmin).
 */

'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const isProduction = process.env.NODE_ENV === 'production';

const AuthController = {
  login(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son obligatorios.' });
    }

    const user = UserModel.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    const passwordMatches = bcrypt.compareSync(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 8 * 60 * 60 * 1000, // 8 horas
    });

    return res.json({
      message: 'Sesión iniciada correctamente.',
      user: { id: user.id, username: user.username },
    });
  },

  logout(req, res) {
    res.clearCookie('token');
    return res.json({ message: 'Sesión cerrada.' });
  },

  /**
   * Devuelve el usuario autenticado actual, o 401 si no hay sesión.
   * Lo usa el frontend al cargar la página para saber si debe
   * mostrar el panel de administrador o la vista pública.
   */
  me(req, res) {
    return res.json({ user: req.user });
  },
};

module.exports = AuthController;
