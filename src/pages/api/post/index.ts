import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import Post from "@/models/Post";
import { authenticateJWT } from "@/lib/authenticate";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const connectionString: string = process.env.MONGO_URI as string;
  await mongoose.connect(connectionString);

  switch (req.method) {
    case "POST":
      return authenticateJWT(handleCreatePost)(req, res);
    case "GET":
      if (req.query.id) {
        return authenticateJWT(handleReadPost)(req, res);
      } else {
        return handleReadAllPosts(req, res);
      }
    case "PUT":
      return authenticateJWT(handleUpdatePost)(req, res);
    case "DELETE":
      return authenticateJWT(handleDeletePost)(req, res);
    default:
      res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function handleCreatePost(req: NextApiRequest, res: NextApiResponse) {
  console.log("Inside handleCreatePost");
  const { title, sub_title, content, tags, categories } = req.body;
  const { user_id } = req.user!;

  try {
    const post = new Post({
      title,
      sub_title,
      content,
      user_id,
      tags,
      categories,
      created_at: new Date(),
      updated_at: new Date(),
    });
    await post.save();
    res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating post", error });
  }
}

async function handleReadPost(req: NextApiRequest, res: NextApiResponse) {
  console.log("Inside handleReadPost");
  const { id } = req.query;

  try {
    const post = await Post.findOne({ post_id: id });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error reading post", error });
  }
}

async function handleReadAllPosts(req: NextApiRequest, res: NextApiResponse) {
  console.log("Inside handleReadAllPosts");

  try {
    const posts = await Post.find().sort({ created_at: -1 }).limit(20);
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error reading posts", error });
  }
}

async function handleUpdatePost(req: NextApiRequest, res: NextApiResponse) {
  console.log("Inside handleUpdatePost");
  const { id } = req.query;
  const { user_id } = req.user!;
  const { title, sub_title, content, tags, categories } = req.body;

  try {
    const post = await Post.findOneAndUpdate(
      { user_id, post_id: id },
      {
        title,
        sub_title,
        content,
        tags,
        categories,
        updated_at: new Date(),
      },
      { new: true }
    );
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json({ message: "Post updated successfully", post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating post", error });
  }
}

async function handleDeletePost(req: NextApiRequest, res: NextApiResponse) {
  console.log("Inside handleDeletePost");
  const { id } = req.query;
  const { user_id } = req.user!;

  try {
    const post = await Post.findOneAndDelete({ user_id, post_id: id });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting post", error });
  }
}
