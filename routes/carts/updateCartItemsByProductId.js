import express from "express";

import { matchedData } from "express-validator";
import guestModel from "../../models/guestModel.js";
import cartModel from "../../models/cartModel.js";
import { updateCartValidationSchema } from "../../validationSchema/carts/updateCartProductValidationSchema.js";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";

const router = express.Router();
const updateCartItemsByProductId = async (req, res) => {
  const requestData = matchedData(req);
  console.log(requestData.addOns);
  const guest = await guestModel.findOne({ uid: requestData.guest });
  const updateCartQuery = cartModel.findOneAndUpdate(
    {
      guest: guest._id,
      location: requestData.location,
      "products.product": requestData.product,
    },
    {
      $set: {
        "products.$.quantity": requestData.quantity,
        "products.$.addOns": requestData.addOns,
      },
    },
    { new: true }
  );
  const writableResult = await updateCartQuery.exec();
  return res.status(200).json({ status: true, data: writableResult });
};

export default router.post(
  "/",
  updateCartValidationSchema,
  validateRequest,
  updateCartItemsByProductId
);
