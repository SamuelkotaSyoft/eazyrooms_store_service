import { param, query } from "express-validator";
import productModel from "../../models/productModel.js";

const getProductValidationByIdSchema = [
  param("productId")
    .notEmpty()
    .custom(async (productId) => {
      const product = await productModel.findOne({ _id: productId });
      if (!product) {
        return Promise.reject(
          "productId is required and should be a valid ObjectId"
        );
      }
    })
    .withMessage("productId is required and should be a valid ObjectId"),
];
export { getProductValidationByIdSchema };
