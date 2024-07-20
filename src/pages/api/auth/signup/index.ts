import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "@/models/User";
import { authenticateJWT } from "@/lib/authenticate";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const connectionString: string = process.env.MONGO_URI as string;
  await mongoose.connect(connectionString);

  switch (req.method) {
    case "POST":
      return handleCreateUser(req, res);
    case "GET":
      if (req.query.id) {
        return handleReadUser(req, res);
      } else {
        return authenticateJWT(handleReadAllUsers)(req, res);
      }
    case "PUT":
      return handleUpdateUser(req, res);
    case "DELETE":
      return handleDeleteUser(req, res);
    default:
      res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  await mongoose.disconnect();
}

async function handleCreateUser(req: NextApiRequest, res: NextApiResponse) {
  console.log("Inside handleCreateUser");
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating user" });
  }
}

async function handleReadUser(req: NextApiRequest, res: NextApiResponse) {
  console.log("Inside handleReadUser");
  const { id } = req.query;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error reading user", error });
  }
}

async function handleReadAllUsers(req: NextApiRequest, res: NextApiResponse) {
  console.log("Inside handleReadAllUsers");

  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error reading users", error });
  }
}

async function handleUpdateUser(req: NextApiRequest, res: NextApiResponse) {
  console.log("Inside handleUpdateUser");
  const { id } = req.query;
  const { username, password } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { username, password },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user", error });
  }
}

async function handleDeleteUser(req: NextApiRequest, res: NextApiResponse) {
  console.log("Inside handleDeleteUser");
  const { id } = req.query;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting user", error });
  }
}
