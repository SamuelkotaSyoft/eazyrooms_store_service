import express from "express";
import { matchedData } from "express-validator";
import { createOrderValidationSchema } from "../../validationSchema/orders/createOrderValidationSchema.js";
import orderModel from "../../models/orderModel.js";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import guestModel from "../../models/guestModel.js";
import storeLocationModel from "../../models/storeLocationModel.js";
import bookingModel from "../../models/bookingModel.js";
import { ObjectId } from "mongoose";
import cartModel from "../../models/cartModel.js";
import { calculateCartTotal } from "../../helpers/createCartTotal.js";
import notify from "../../helpers/notifications/notify.js";
const router = express.Router();

async function createOrder(req, res) {
  try {
    const requestData = matchedData(req);
    if (
      requestData.floor === null ||
      requestData.floor === undefined ||
      requestData.floor === ""
    ) {
      delete requestData.floor;
    }
    if (
      requestData.block === null ||
      requestData.block === undefined ||
      requestData.block === ""
    ) {
      delete requestData.block;
    }
    const guest = await guestModel.findOne({ uid: requestData.guest });
    const booking = await bookingModel.findOne({
      guests: { $in: guest._id },
    });
    const cart = await cartModel
      .findOne({ _id: requestData.cart })
      .populate({ path: "products.product", populate: { path: "addOns" } })
      .populate("products.addOns.addOn");
    const { addOnTotal, productTotal, discountedPrice, discountingPrice } =
      await calculateCartTotal(cart);
    const order = new orderModel({
      ...requestData,
      products: cart.products,
      createdBy: guest._id,
      updatedBy: guest._id,
      orderStatus: "ordered",
      addOnPrice: addOnTotal,
      productPrice: productTotal,
      discountPrice: discountingPrice,
      finalPrice: discountedPrice,
      status: true,
      location: booking.location,
      property: booking.property,
      guest: guest._id,
    });
    const writeResult = await order.save();

    try {
      await notify({
        userId: guest._id,
        propertyId: booking.property,
        location: [writeResult.location],
        stores: [writeResult.store],
        role: ["locationAdmin", "storeAdmin"],
        notificationText:
          guest.name + " has created an order for " + writeResult.name,
        authToken: req.headers["eazyrooms-token"],
      });
    } catch (error) {
      console.log(error);
    }

    res.status(200).json({ status: true, data: "Order Placed Successfully" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}

router.post(
  "/:guest",
  createOrderValidationSchema,
  validateRequest,
  createOrder
);
export default router;
