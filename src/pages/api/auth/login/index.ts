import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "@/models/User";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const connectionString: string = process.env.MONGO_URI as string;
  await mongoose.connect(connectionString);

  switch (req.method) {
    case "POST":
      return handleCreateAuthToken(req, res);
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  await mongoose.disconnect();
}

async function handleCreateAuthToken(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Inside handleCreateAuthToken");
  const jwtSecret: string = process.env.JWT_SECRET as string;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ message: "Missing username or password in body" });
    return;
  }

  const user = await User.findOne({
    username: username,
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ message: "Invalid Credentials" });
  }

  const token = jwt.sign({ username, user_id: user?.user_id }, jwtSecret, {
    expiresIn: "1h",
  });

  res.status(200).json({ token });
}
