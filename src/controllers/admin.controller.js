import { RefreshToken, User } from "../models/index.js";

export const listRefreshTokens = async (req, res) => {
  try {
    const tokens = await RefreshToken.findAll({ include: [{ model: User, as: "user", attributes: ["id", "email"] }] });
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const revokeRefreshToken = async (req, res) => {
  try {
    const { id } = req.params; // id of refresh token record
    const token = await RefreshToken.findByPk(id);
    if (!token) return res.status(404).json({ error: "Refresh token not found" });
    token.revoked = true;
    await token.save();
    res.json({ message: "Revoked" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
