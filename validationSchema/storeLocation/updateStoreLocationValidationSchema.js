import { body, param } from "express-validator";
import storeLocationModel from "../../models/storeLocationModel.js";
import mongoose from "mongoose";

const updateStoreLocationValidationSchema = [
  body("name")
    .ltrim()
    .rtrim()
    .notEmpty()
    .optional()
    .withMessage("Name is required")
    .custom(async (name, { req }) => {
      const associatedStore = await storeLocationModel.findOne({
        _id: new mongoose.Types.ObjectId(req.body.storeLocationId),
      });
      const isNameExistsInLocationLevel = await storeLocationModel.findOne({
        _id: { $ne: req.body.storeLocationId },
        name: new RegExp("^" + name + "$", "i"),
        status: true,
        store: associatedStore.store,
      });
      if (isNameExistsInLocationLevel) {
        throw new Error("Name already exists in store level");
      }
    }),

  body("description").optional(),
  body("status").isBoolean().optional(),
  body("active").isBoolean().optional(),
  body("storeLocationId").custom(async (storeLocationId) => {
    const isValidStore = await storeLocationModel.findOne({
      _id: storeLocationId,
    });
    if (!isValidStore) {
      throw new Error("Invalid storeLocationId");
    }
  }),
];

export { updateStoreLocationValidationSchema };
