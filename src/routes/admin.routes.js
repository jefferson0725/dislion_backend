import { Router } from "express";
import { listRefreshTokens, revokeRefreshToken } from "../controllers/admin.controller.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "Admin root" });
});

router.get("/refresh-tokens", listRefreshTokens);
router.post("/refresh-tokens/:id/revoke", revokeRefreshToken);

export default router;
