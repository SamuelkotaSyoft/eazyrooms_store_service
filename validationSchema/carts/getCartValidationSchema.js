import { body } from "express-validator";
import guestModel from "../../models/guestModel.js";
import locationModel from "../../models/locationModel.js";

const getCartValidationSchema = [
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
];
export { getCartValidationSchema };
