import express from "express";
import { getCartValidationSchema } from "../../validationSchema/carts/getCartValidationSchema.js";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import { matchedData } from "express-validator";
import guestModel from "../../models/guestModel.js";
import cartModel from "../../models/cartModel.js";
import "../../models/taxModel.js";

import { calculateCartTotal } from "../../helpers/createCartTotal.js";
const router = express.Router();

async function getCartItems(req, res) {
  const requestData = matchedData(req);

  const filterObj = {};
  if (requestData.location) {
    filterObj.location = requestData.location;
  }
  if (requestData.guest) {
    const guest = await guestModel.findOne({ uid: requestData.guest });
    filterObj.guest = guest._id;
  }
  if (requestData.uuid) {
    filterObj.uuid = requestData.uuid;
  }

  const query = cartModel
    .findOne(filterObj)
    .populate({
      path: "products.product",
      populate: { path: "addOns" },
    })
    .populate({
      path: "products.product",
      populate: { path: "location", select: ["currency"] },
    })
    .populate({
      path: "products.product",
      populate: { path: "tag" },
    })
    .populate({
      path: "products.product",
      populate: { path: "tax" },
    })
    .populate("products.addOns.addOn");
  // .populate("products.tax");
  // .populate("products.products.tax");

  const writableResult = await query.exec();
  const {
    addOnTotal,
    productTotal,
    discountedPrice,
    discountingPrice,
    taxAmount,
  } = await calculateCartTotal(writableResult);
  if (writableResult === null) {
    return res.status(200).json({
      status: true,
      data: {
        products: [],
        totalProductAmount: 0,
        totalAddOnAmount: 0,
        discountPrice: 0,
        totalAmount: 0,
      },
    });
  }

  res.status(200).json({
    status: true,
    data: {
      ...writableResult?._doc,
      totalProductAmount: productTotal,
      //this is the total amount before discount and tax
      totalAddOnAmount: addOnTotal,
      totalAmount: discountedPrice,
      //totalAmount is sum of  finalPrice that is sum
      taxAmount,
      //tax amount is the total tax applied
      discountingPrice,
      //this is the total discout applied
    },
  });
}

export default router.post(
  "/",
  getCartValidationSchema,
  validateRequest,
  getCartItems
);
