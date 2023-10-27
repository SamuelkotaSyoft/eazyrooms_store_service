import { body } from "express-validator";
import productModel from "../../models/productModel.js";

const createTagsValidationSchema = [
  body("product")
    .notEmpty()
    .custom(async (productId) => {
      const product = await productModel.findOne({
        _id: productId,
        status: true,
      });
      if (!product) {
        throw new Error("Product is required and should be a valid ObjectId");
      }
    })
    .withMessage("Product is required"),
  body("name")
    .ltrim()
    .rtrim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 40 })
    .withMessage("Name should be less than 40 characters"),
];
export { createTagsValidationSchema };
