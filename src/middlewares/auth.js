import jwt from "jsonwebtoken";

// auth middleware factory: auth(requiredRole?)
export default function auth(requiredRole) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    console.log(
      "[Auth] Headers:",
      req.headers.authorization ? "present" : "missing",
    );

    if (!authHeader)
      return res.status(401).json({ error: "No token provided" });

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer")
      return res.status(401).json({ error: "Invalid authorization format" });

    const token = parts[1];
    const secret = process.env.JWT_SECRET || "default_jwt_secret";

    try {
      const payload = jwt.verify(token, secret);
      req.user = payload;
      console.log("[Auth] User:", payload.username, "Role:", payload.role);

      // Solo verificar rol si se especificó uno
      if (
        requiredRole !== undefined &&
        requiredRole !== null &&
        payload.role !== requiredRole
      ) {
        return res.status(403).json({ error: "Insufficient role" });
      }

      next();
    } catch (err) {
      console.log("[Auth] Token verification failed:", err.message);
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}

// isAdmin middleware - verifica que el usuario sea admin
// NOTA: Este middleware debe usarse DESPUÉS de auth() que ya valida el token
export const isAdmin = (req, res, next) => {
  // El usuario ya fue validado por auth(), solo verificar el rol
  if (!req.user) {
    return res.status(401).json({ error: "No autenticado" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: "Acceso denegado. Se requiere rol de administrador",
    });
  }

  next();
};
