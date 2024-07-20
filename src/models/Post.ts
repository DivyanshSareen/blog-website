import mongoose, { Document, Model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

interface IPost extends Document {
  post_id: string;
  title: string;
  sub_title: string;
  content: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
  tags: string[];
  categories: string[];
  comments: string[];
}

const PostSchema: Schema = new Schema({
  post_id: {
    type: String,
    required: true,
    unique: true,
    default: uuidv4,
  },
  title: {
    type: String,
    required: true,
  },
  sub_title: {
    type: String,
    required: false,
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
  tags: {
    type: [String],
    default: [],
  },
  categories: {
    type: [String],
    default: [],
  },
  comments: {
    type: [String],
    default: [],
  },
});

PostSchema.index({ post_id: 1 }, { unique: true });
PostSchema.index({ title: 1 });
PostSchema.index({ user_id: 1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ categories: 1 });

const Post: Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);

export default Post;
