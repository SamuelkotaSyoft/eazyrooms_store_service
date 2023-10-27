import express from "express";
/**
 * importing the validator functions
 */
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import { createCartValidationSchema } from "../../validationSchema/carts/createCartValidationSchema.js";
import { matchedData } from "express-validator";
/**
 * importing the models
 */
import cartModel from "../../models/cartModel.js";
import guestModel from "../../models/guestModel.js";
import productModel from "../../models/productModel.js";
import mongoose from "mongoose";
const router = express.Router();
const createCart = async (req, res) => {
  try {
    /**
     * checking if the cart is already exist for the guest
     */

    const requestData = matchedData(req);
    //update cart function call just updating with the new products
    // function incrementCartItems(products, cartProducts, newProducts) {
    //   const cartProductIds = cartProducts.map((product) =>
    //     product.product?.toString()
    //   );
    //   products?.forEach((product) => {
    //     if (!cartProductIds.includes(product.product)) {
    //       newProducts.push(product);
    //     } else {
    //       const index = cartProductIds.indexOf(product.product);
    //       cartProducts[index].quantity += product.quantity;
    //       for (let j = 0; j < product.addOns.length; j++) {
    //         const addOnIndex = cartProducts[index].addOns.findIndex(
    //           (addOn) => addOn.addOn.toString() === product.addOns[j].addOn
    //         );
    //         if (addOnIndex === -1) {
    //           cartProducts[index].addOns.push(product.addOns[j]);
    //         } else {
    //           cartProducts[index].addOns[addOnIndex].quantity +=
    //             product.addOns[j].quantity;
    //         }
    //       }
    //     }
    //   });
    // }
    async function updateCart(cartId, cart) {
      let products = requestData.products;
      let cartProducts = cart.products;
      let newProducts = [];
      // await incrementCartItems(products, cartProducts, newProducts);
      if (products?.length > 0) {
      } else {
        cartProducts = [];
      }
      if (products?.length > 0) {
        for (let i = 0; i < products?.length; i++) {
          const product = await productModel.findOne({
            _id: products[i].product,
          });
          if (
            product?.maxQuantity > 0 &&
            product?.maxQuantity < products[i].quantity
          ) {
            products[i].quantity = product?.maxQuantity;
          }
        }
      }
      const query = cartModel.findByIdAndUpdate(
        {
          _id: cartId,
        },
        {
          products,
        },
        {
          new: true,
        }
      );
      /**
       * executing the query
       */
      const writableResult = await query.exec();

      return res.status(200).json({ status: true, data: writableResult });
    }

    //create cart function
    async function createNewCart(cartDetails) {
      const cart = new cartModel({
        ...requestData,
        ...cartDetails,
        status: true,
      });
      const writableResult = await cart.save();
      return res.status(200).json({ status: true, data: writableResult });
    }
    //checking if the cart is already exist for the guest
    async function cartExists(cartOptions) {
      const isCartExist = await cartModel.findOne({
        ...cartOptions,
        location: requestData.location,
      });
      return isCartExist;
    }

    //checking if the guest has a cart without logged in status
    if (requestData.uuid) {
      const isCartExist = await cartExists({ uuid: requestData.uuid });
      if (isCartExist) {
        return updateCart(isCartExist._id, isCartExist);
      }
      return createNewCart({});
    }
    if (requestData?.previousCart) {
      const deleteCart = await cartModel.deleteOne({
        uuid: requestData.previousCart,
      });
    }
    //if the user data exists then we will check if the cart exists for the user
    const guest = await guestModel.findOne({ uid: requestData.guest });
    const isCartExist = await cartExists({ guest: guest._id });
    if (isCartExist) {
      return updateCart(isCartExist._id, isCartExist);
    }
    //creating the cart if neither of the above conditions are true

    return createNewCart({ guest: guest._id });
  } catch (err) {
    console.log({ error });
    res.status(500).json({ error: err });
  }
};

export default router.post(
  "/",
  createCartValidationSchema,
  validateRequest,
  createCart
);
