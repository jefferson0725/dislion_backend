import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { RefreshToken, User } from "../models/index.js";

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: "refreshToken is required" });

    // Find in DB by comparing hash
    const candidates = await RefreshToken.findAll({ where: { revoked: false } });
    let stored = null;
    for (const c of candidates) {
      if (await bcrypt.compare(refreshToken, c.tokenHash)) {
        stored = c;
        break;
      }
    }
    if (!stored) return res.status(401).json({ error: "Invalid refresh token" });

    const refreshSecret = process.env.REFRESH_SECRET || "default_refresh_secret";
    let payload;
    try {
      payload = jwt.verify(refreshToken, refreshSecret);
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired refresh token" });
    }

    // Issue new access token
    const user = await User.findByPk(payload.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const accessSecret = process.env.JWT_SECRET || "default_jwt_secret";
    const accessExpiresIn = process.env.JWT_EXPIRES_IN || "8h";
    const accessToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, accessSecret, { expiresIn: accessExpiresIn });

    // (Optional) rotate refresh token: revoke old and issue new
  stored.revoked = true;
  await stored.save();

  const refreshExpiresIn = process.env.REFRESH_EXPIRES_IN || "7d";
  const newRefreshToken = jwt.sign({ id: user.id }, refreshSecret, { expiresIn: refreshExpiresIn });
  const newExpiryDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // default 7d
  const newHash = await bcrypt.hash(newRefreshToken, 10);
  await RefreshToken.create({ tokenHash: newHash, userId: user.id, expiresAt: newExpiryDate });

  res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: "refreshToken is required" });

    const candidates = await RefreshToken.findAll({ where: { revoked: false } });
    let stored = null;
    for (const c of candidates) {
      if (await bcrypt.compare(refreshToken, c.tokenHash)) {
        stored = c;
        break;
      }
    }
    if (!stored) return res.status(200).json({ message: "Logged out" });

    stored.revoked = true;
    await stored.save();

    res.json({ message: "Logged out, refresh token revoked" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
