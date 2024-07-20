import type { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "@/models/User";

const jwtSecret: string = process.env.JWT_SECRET as string;

if (!jwtSecret) {
  throw new Error("JWT_SECRET is not defined");
}

export const authenticateJWT =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(" ")[1];

      jwt.verify(token, jwtSecret, async (err, decodedToken) => {
        if (err) {
          return res.status(403).json({ error: "Invalid token" });
        }

        const { user_id } = decodedToken as JwtPayload;

        const user = await User.findOne({ user_id });
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        (req as any).user = user;
        return handler(req, res);
      });
    } else {
      return res.status(401).json({ error: "No token provided" });
    }
  };
