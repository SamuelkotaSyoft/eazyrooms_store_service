import { body } from "express-validator";
import guestModel from "../../models/guestModel.js";
import locationModel from "../../models/locationModel.js";
const createCartValidationSchema = [
  body("guest")
    .optional()
    .custom(async (guestId) => {
      const guest = await guestModel.findOne({ uid: guestId });
      if (!guest) {
        return Promise.reject(
          "Guest is required and should be a valid ObjectId"
        );
      }
    }),
  body("previousCart").optional(),
  body("uuid").optional(),
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
  body("products")
    .isArray({ min: 0 })
    .withMessage("Products is required and should be an array"),
];
export { createCartValidationSchema };
