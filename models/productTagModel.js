import mongoose from "mongoose";

const ProductTagSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 20,
      minLength: 2,
      required: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Store",
    },
    status: {
      type: Boolean,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
      ref: "User",
    },
    updatedBy: {
      type: String,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("ProductTag", ProductTagSchema);
