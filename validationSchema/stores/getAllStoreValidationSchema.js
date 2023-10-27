import { param,  } from "express-validator";
import Location from "../../models/locationModel.js";

const getAllStoreValidationSchema = [
  param("location").custom(async (locationId) => {
    const location = await Location.findOne({ _id: locationId });
    if (!location) {
      throw new Error("location is required and should be a valid ObjectId");
    }
  }),
];

export { getAllStoreValidationSchema };
