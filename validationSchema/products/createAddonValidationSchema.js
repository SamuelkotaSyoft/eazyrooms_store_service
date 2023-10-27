import { body } from "express-validator";
import productModel from "../../models/productModel.js";

const createAddOnValidationSchema = [
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
  body("finalPrice")
    .notEmpty()
    .isNumeric()
    .withMessage("Final price should be a number"),
  body("minQuantity")
    .optional()
    .notEmpty()
    .withMessage("Min Quantity is required")
    .isNumeric()
    .withMessage("Min Quantity should be a number"),
  body("maxQuantity")
    .optional()
    .notEmpty()
    .withMessage("Max Quantity is required")
    .isNumeric()
    .withMessage("Max Quantity should be a number"),
];
export { createAddOnValidationSchema };
