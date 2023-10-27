import { body } from "express-validator";
import mongoose from "mongoose";
import Product from "../../models/productModel.js";
import productTagModel from "../../models/productTagModel.js";
//TODO change in this to initial stage from git
const createProductValidationSchema = [
  body("name")
    .ltrim()
    .rtrim()
    .isString()
    .custom(async (value, { req }) => {
      const data = await Product.findOne({
        name: new RegExp("^" + value + "$", "i"),
        store: req.body.store,
        status: true,
      });
      if (data) {
        return Promise.reject("Product name already exists in store level");
      }
    }),

  body("location")
    .notEmpty()
    .custom((locationId) => mongoose.Types.ObjectId.isValid(locationId))
    .withMessage("Location is required and should be a valid ObjectId"),
  body("store")
    .notEmpty()
    .custom((storeId) => mongoose.Types.ObjectId.isValid(storeId))
    .withMessage("Store is required and should be a valid ObjectId"),
  body("storeCategory").optional({ values: "falsy" }),
  body("shortDescription")
    .optional({ values: "falsy" })
    .isString()
    .withMessage("Short description must be string"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be string"),
  body("estimatedTime")
    .optional({ values: "falsy" })
    .isNumeric()
    .withMessage("Estimated time must be a number"),
  body("initialPrice")
    .isNumeric()
    .toFloat()
    .withMessage("Initial price must be number"),
  body("discount.discountValue")
    .optional({ checkFalsy: true })
    .isNumeric()
    .toFloat()
    .withMessage("DiscountValue must be number")
    .custom((discountValue, { req }) => {
      if (req.body["discount.discountType"] === "") return true;
      const discountType = req.body["discount.discountType"]?.toLowerCase();
      if (
        discountType === "flat" &&
        Number(discountValue) > Number(req.body?.initialPrice)
      ) {
        throw new Error("Discount value should be less than initialPrice");
      } else if (discountType === "percentage" && Number(discountValue) > 100) {
        throw new Error("Discount value should be less than 100");
      }
      return true;
    }),
  body("discount.discountType")
    .toLowerCase()
    .optional({ checkFalsy: true })
    .matches(/^(percentage|flat|nodiscount)$/i)
    .withMessage(
      "Discount type must be string and should be percentage, No discount or flat"
    ),
  body("tax").optional({ allow: "" | null | undefined }),
  body("tags").optional().isArray().withMessage("Tag must be array"),
  body("units").isString().withMessage("Units is required"),
  body("productQuantity")
    .isInt({ min: 1 })
    .withMessage("Product quantity must be alteast 1"),
  body("minQuantity")
    .optional({ values: "falsy" })
    .isNumeric()
    .withMessage("Minimum quantity should be a number"),
  body("maxQuantity")
    .optional({ values: "falsy" })
    .isNumeric()
    .withMessage("Maximum quantity must be number"),
  body("stock")
    .optional({ values: "falsy" })
    .isNumeric()
    .withMessage("Stock must be number"),
  body("sku").optional({ values: "falsy" }),
  body("addOns.*"),
  // body("addOns.*.name.*")
  //   .ltrim()
  //   .rtrim()
  //   .optional({ values: "falsy" })
  //   .custom((value) => {
  //     console.log({ value });
  //   })
  //   .isString()
  //   .withMessage("AddOn name must be string"),
  // body("addOns.*.price.*")
  //   .optional({ values: "falsy" })
  //   .isNumeric()
  //   .withMessage("AddOn price must be number"),
  body("tags.*").optional({ values: "falsy" }),
  body("tagIds")
    .isArray()
    .optional({ values: "falsy" })
    .custom(async (tagId) => {
      const isValidTag = await productTagModel.find({ _id: { $in: tagId } });
      if (isValidTag.length !== tagId.length) {
        throw new Error("Invalid tag id");
      }
    }),
];

export { createProductValidationSchema };
