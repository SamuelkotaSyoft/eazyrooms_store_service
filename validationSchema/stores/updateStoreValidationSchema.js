import { body, param } from "express-validator";
import storeModel from "../../models/storeModel.js";
import mongoose from "mongoose";

const updateStoreValidationSchema = [
  body("name")
    .ltrim()
    .rtrim()
    .notEmpty()
    .optional()
    .withMessage("Name is required")
    .custom(async (name, { req }) => {
      const associatedLocation = await storeModel.findOne({
        _id: new mongoose.Types.ObjectId(req.body.storeId),
      });
      const isStoreNameExistsInLocationLevel = await storeModel.findOne({
        _id: { $ne: new mongoose.Types.ObjectId(req.body.storeId) },
        location: associatedLocation?.location,
        name: new RegExp("^" + name + "$", "i"),
        status: true,
      });
      if (isStoreNameExistsInLocationLevel) {
        throw new Error("store name already exists in location level");
      }
    }),
  body("description").optional(),
  body("status").isBoolean().optional(),
  body("active").isBoolean().optional(),
  body("storeId").custom(async (storeId) => {
    const isValidStore = await storeModel.findOne({ _id: storeId });
    if (!isValidStore) {
      throw new Error("Invalid storeId");
    }
  }),
];

export { updateStoreValidationSchema };
