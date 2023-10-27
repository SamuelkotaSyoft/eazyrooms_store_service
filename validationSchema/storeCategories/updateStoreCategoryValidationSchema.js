import { body, param } from "express-validator";
import mongoose from "mongoose";
import storeCategoryModel from "../../models/storeCategoryModel.js";

const updateStoreCategoryValidationSchema = [
  body("name")
    .ltrim()
    .rtrim()
    .notEmpty()
    .optional()
    .withMessage("Name is required")
    .custom(async (name, { req }) => {
      console.log("hi helllo world");
      const associatedStore = await storeCategoryModel.findOne({
        _id: new mongoose.Types.ObjectId(req.body.storeCategoryId),
      });
      // console.log({ associatedStore, body: req.body });
      const isStoreNameExistsInLocationLevel = await storeCategoryModel.findOne(
        {
          _id: { $ne: new mongoose.Types.ObjectId(req.body.storeCategoryId) },
          store: associatedStore?.store,
          name: new RegExp("^" + name + "$", "i"),
          status: true,
        }
      );
    // console.log({ isStoreNameExistsInLocationLevel });
      if (isStoreNameExistsInLocationLevel) {
        throw new Error("store name already exists in Store level");
      }
    }),

  body("location")
    .notEmpty()
    .optional()
    .custom((locationId) => mongoose.Types.ObjectId.isValid(locationId))
    .withMessage("Location is required and should be a valid ObjectId"),

  body("description").optional(),
  body("status").isBoolean().optional(),
  body("active").isBoolean().optional(),
  body("storeCategoryId").custom(async (storeCategoryId) => {
    const isValidStoreCategory = await storeCategoryModel.findOne({
      _id: storeCategoryId,
    });
    console.log(isValidStoreCategory);
    if (!isValidStoreCategory) {
      throw new Error("Invalid storeCategoryId");
    }
  }),
];

export { updateStoreCategoryValidationSchema };
