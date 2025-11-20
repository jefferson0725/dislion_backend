import { User } from "../models/user.model.js";
import { RefreshToken } from "../models/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// =============
// Register user
// =============
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // NOTE: do not allow clients to set role to admin during registration.
    const forcedRole = "customer";

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: forcedRole,
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// =============
// Login user
// =============
export const loginUser = async (req, res) => {
  try {
    // Accept either `identifier` (username or email), or explicit `email`/`username` fields
    const { identifier, email, username, password } = req.body;

    // Build search condition: prefer explicit email/username, otherwise use identifier
    const searchValue = email || username || identifier;
    if (!searchValue) return res.status(400).json({ error: "Missing credentials" });

    // Find user by email OR username
    const { Op } = await import("sequelize");
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: searchValue }, { username: searchValue }],
      },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const payload = { id: user.id, email: user.email, role: user.role };
    const secret = process.env.JWT_SECRET || "default_jwt_secret";
    const expiresIn = process.env.JWT_EXPIRES_IN || "8h";

    const token = jwt.sign(payload, secret, { expiresIn });

    // Create refresh token (longer expiry)
    const refreshSecret = process.env.REFRESH_SECRET || "default_refresh_secret";
    const refreshExpiresIn = process.env.REFRESH_EXPIRES_IN || "7d";
  const refreshToken = jwt.sign({ id: user.id }, refreshSecret, { expiresIn: refreshExpiresIn });

  // Persist hashed refresh token
  const refreshExpiryDate = new Date(Date.now() + parseExpiryToMs(refreshExpiresIn));
  const tokenHash = await bcrypt.hash(refreshToken, 10);
  await RefreshToken.create({ tokenHash, userId: user.id, expiresAt: refreshExpiryDate });

  res.json({ message: "Login successful", token, refreshToken, user: payload });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper to convert expiry strings like '7d', '8h' to milliseconds
function parseExpiryToMs(expiry) {
  if (!expiry) return 0;
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 0;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    default:
      return 0;
  }
}

// =============
// Get all users
// =============
export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "username", "email", "role", "createdAt"], // hide password
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =============
// Get user by ID
// =============
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: ["id", "username", "email", "role", "createdAt"],
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =============
// Change password
// =============
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // From auth middleware

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Se requiere contraseña actual y nueva" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "La nueva contraseña debe tener al menos 6 caracteres" });
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // Verify current password
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ error: "Contraseña actual incorrecta" });

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await user.update({ password: hashedPassword });

    res.json({ message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
