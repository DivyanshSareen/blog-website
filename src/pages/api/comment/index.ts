import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import Comment from "@/models/Comment";
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
      return authenticateJWT(handleCreateComment)(req, res);
    case "PUT":
      return authenticateJWT(handleUpdateComment)(req, res);
    case "DELETE":
      return authenticateJWT(handleDeleteComment)(req, res);
    default:
      res.setHeader("Allow", ["POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function handleCreateComment(req: NextApiRequest, res: NextApiResponse) {
  console.log("Inside handleCreateComment");
  const { post_id, content } = req.body;
  const { user_id } = req.user!;

  try {
    const comment = new Comment({
      post_id,
      content,
      user_id,
      created_at: new Date(),
      updated_at: new Date(),
    });
    await comment.save();

    // Update the corresponding post to add the comment ID
    await Post.findOneAndUpdate(
      { post_id },
      { $push: { comments: comment.comment_id } }
    );

    res.status(201).json({ message: "Comment created successfully", comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating comment", error });
  }
}

async function handleUpdateComment(req: NextApiRequest, res: NextApiResponse) {
  console.log("Inside handleUpdateComment");
  const { id } = req.query;
  const { user_id } = req.user!;
  const { content } = req.body;

  try {
    const comment = await Comment.findOneAndUpdate(
      { user_id, comment_id: id },
      {
        content,
        updated_at: new Date(),
      },
      { new: true }
    );
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.status(200).json({ message: "Comment updated successfully", comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating comment", error });
  }
}

async function handleDeleteComment(req: NextApiRequest, res: NextApiResponse) {
  console.log("Inside handleDeleteComment");
  const { id } = req.query;
  const { user_id } = req.user!;

  try {
    const comment = await Comment.findOneAndDelete({ user_id, comment_id: id });
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Update the corresponding post to remove the comment ID
    await Post.findOneAndUpdate(
      { post_id: comment.post_id },
      { $pull: { comments: comment.comment_id } }
    );

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting comment", error });
  }
}
