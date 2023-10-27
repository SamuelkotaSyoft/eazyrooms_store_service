import { body, param, query } from "express-validator";
import mongoose from "mongoose";
import storeLocation from "../models/storeLocationModel.js";
import Location from "../models/locationModel.js";
import storeModel from "../models/storeModel.js";
const createStoreLocationValidationSchema = [
  body("name")
    .ltrim()
    .rtrim()
    .notEmpty()
    .custom(async (name, { req }) => {
      const isNameExistsInLocationLevel = await storeLocation.findOne({
        name: new RegExp("^" + name + "$", "i"),
        store: req.body.store,
        status: true,
      });
      if (isNameExistsInLocationLevel) {
        throw new Error("Name already exists in store level");
      }
    }),
  body("location")
    .notEmpty()
    .custom((locationId) => mongoose.Types.ObjectId.isValid(locationId))
    .withMessage("Location is required and should be a valid ObjectId"),
  // body("status")
  //   .notEmpty()
  //   .isBoolean()
  //   .withMessage("status is required and should be a boolean value"),
  body("store")
    .notEmpty()
    .custom((storeId) => mongoose.Types.ObjectId.isValid(storeId))
    .withMessage("Store is required and should be a valid ObjectId"),
  body("description").optional(),
];

const updateStoreLocationValidationSchema = [
  body("name")
    .ltrim()
    .rtrim()
    .notEmpty()
    .withMessage("Name is required")
    .custom(async (name, { req }) => {}),
  body("location")
    .notEmpty()
    .custom((locationId) => mongoose.Types.ObjectId.isValid(locationId))
    .withMessage("Location is required and should be a valid ObjectId"),
  body("store")
    .notEmpty()
    .custom((storeId) => mongoose.Types.ObjectId.isValid(storeId))
    .withMessage("Store is required and should be a valid ObjectId"),
  body("description").optional(),
  body("images").optional().isArray(),
];
const getStoreLocationValidationByIdSchema = [
  param("storeLocationId")
    .notEmpty()
    .custom((storeLocationId) =>
      mongoose.Types.ObjectId.isValid(storeLocationId)
    )
    .withMessage("StoreLocationId is required"),
];

const getAllStoreLocationValidationSchema = [
  param("storeId")
    .notEmpty()
    .custom(async (storeId) => {
      console.log({ storeId });
      const isStoreExists = await storeModel.findOne({
        _id: new mongoose.Types.ObjectId(storeId),
        // status: true,
      });
      console.log({ isStoreExists });

      if (!isStoreExists) {
        throw new Error("Store is required and should be a valid ObjectId");
      }
    }),
];

export {
  createStoreLocationValidationSchema,
  getStoreLocationValidationByIdSchema,
  updateStoreLocationValidationSchema,
  getAllStoreLocationValidationSchema,
};
