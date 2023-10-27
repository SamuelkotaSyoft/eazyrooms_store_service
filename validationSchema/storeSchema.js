import { body, param } from "express-validator";
import mongoose from "mongoose";
import Store from "../models/storeModel.js";

const createStoreValidationSchema = [
  body("name")
    .ltrim()
    .rtrim()
    .notEmpty()
    .custom(async (name, { req }) => {
      const store = await Store.findOne({
        name: new RegExp("^" + name + "$", "i"),
        location: req.body.location,
        status: true,
      });
      if (store) {
        return Promise.reject("Store name already exists in location level");
      }
    }),
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

export { createStoreValidationSchema, getStoreValidationByIdSchema };
