import { body, param } from "express-validator";
import mongoose from "mongoose";
import StoreCategory from "../../models/storeCategoryModel.js";

const createStoreCategoryValidationSchema = [
  body("name")
    .ltrim()
    .rtrim()
    .notEmpty()
    .custom(async (name, { req }) => {
      const storeCategory = await StoreCategory.findOne({
        name: new RegExp("^" + name + "$", "i"),
        store: req.body.store,
        status: true,
      });
      if (storeCategory) {
        return Promise.reject(
          "Store category name already exists in location level"
        );
      }
    }),
  body("store")
    .notEmpty()
    .custom((storeId) => mongoose.Types.ObjectId.isValid(storeId)),

  body("location")
    .notEmpty()
    .custom((locationId) => mongoose.Types.ObjectId.isValid(locationId))
    .withMessage("Location is required and should be a valid ObjectId"),
  body("description").optional(),
];
const getStoreValidationByIdSchema = [
  body("storeId")
    .notEmpty()
    .custom((storeId) => mongoose.Types.ObjectId.isValid(storeId)),
];

export { createStoreCategoryValidationSchema };
