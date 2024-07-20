import mongoose, { Document, Model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

interface IComment extends Document {
  comment_id: string;
  post_id: string;
  content: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

const CommentSchema: Schema = new Schema({
  comment_id: {
    type: String,
    required: true,
    unique: true,
    default: uuidv4,
  },
  post_id: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

CommentSchema.index({ comment_id: 1 }, { unique: true });
CommentSchema.index({ post_id: 1 });
CommentSchema.index({ user_id: 1 });

const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;
