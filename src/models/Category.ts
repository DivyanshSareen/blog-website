import mongoose, { Document, Model, Schema } from "mongoose";

interface ICategory extends Document {
  name: string;
  description: string;
}

const CategorySchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: false,
  },
});

CategorySchema.index({ name: 1 }, { unique: true });

const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
