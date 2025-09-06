import jwt from "jsonwebtoken";
import { randomBytes, createHash } from "crypto";
import { JWT_SECRET } from "../../config";
import { Role } from "../../interfaces";
import { TokenGenerationResult, JWTPayload } from "../../interfaces";

class TokenService {
  // Generate JWT token for authentication
  generateJWTToken(userId: string, role: Role): string {
    return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "7d" });
  }

  // Generate verification token for email/password reset
  generateVerificationToken(): TokenGenerationResult {
    const token = randomBytes(32).toString("hex");
    const hashedToken = createHash("sha256").update(token).digest("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    return { token, hashedToken, expires };
  }

  // Verify JWT token
  verifyJWTToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      return decoded;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  // Hash token for storage
  hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}

export default new TokenService();
