import { query } from "express-validator";
import storeCategoryModel from "../../models/storeCategoryModel.js";

const getAllProductValidationByIdSchema = [
  query("tagId").optional(),
  query("isAddon").optional().isBoolean(),
  query("storeCategory")
    .optional()
    .custom(async (storeCategoryId) => {
      const isValidStoreCategory = await storeCategoryModel.find({
        _id: storeCategoryId,
      });
      if (!isValidStoreCategory) {
        throw new Error("Invalid Store Category");
      }
    }),
];
export { getAllProductValidationByIdSchema };
