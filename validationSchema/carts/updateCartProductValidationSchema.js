import { body } from "express-validator";
import guestModel from "../../models/guestModel.js";
import locationModel from "../../models/locationModel.js";
import cartModel from "../../models/cartModel.js";
import mongoose from "mongoose";

const updateCartValidationSchema = [
  body("product").custom(async (cartId, { req }) => {
    const { guest, location } = req.body;
    const guestData = await guestModel.findOne({ uid: guest });
    const cart = await cartModel.findOne({
      guest: guestData._id,
      location,
      products: {
        $elemMatch: {
          product: new mongoose.Types.ObjectId(req.body.product),
        },
      },
      //   products: { $in: [new mongoose.Types.ObjectId(req.body.product)] },
    });
    if (!cart) {
      return Promise.reject(
        "Product is required and should be a valid ObjectId"
      );
    }
  }),
  body("quantity")
    .isNumeric()
    .optional()
    .withMessage("Quantity should be a number"),
  body("addOns")
    .isArray()
    .optional({ values: [] })
    .withMessage("Add ons should be an Array"),
  body("addOns.*.addOn").optional({ value: "" | undefined }),
  body("addOns.*.quantity")
    .isNumeric()
    .optional({ value: "" | undefined })
    .withMessage("Quantity should be an Number"),
  body("guest").custom(async (guestId) => {
    const guest = await guestModel.findOne({ uid: guestId });
    if (!guest) {
      return Promise.reject("Guest is required and should be a valid ObjectId");
    }
  }),
  body("location").custom(async (locationId) => {
    const location = await locationModel.findOne({
      _id: locationId,
      status: true,
    });
    if (!location) {
      return Promise.reject(
        "Location is required and should be a valid ObjectId"
      );
    }
  }),
];
export { updateCartValidationSchema };
