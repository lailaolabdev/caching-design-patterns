import mongoose, { Schema, Document } from "mongoose";

interface Product extends Document {
  name: string;
  description: string;
}

const ProductSchema: Schema = new Schema({
  name: { type: String },
  description: { type: String },
});

const ProductModel = mongoose.model<Product>("Product", ProductSchema);
export default ProductModel;
