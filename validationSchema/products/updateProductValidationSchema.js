import { body, param } from "express-validator";
import Product from "../../models/productModel.js";
import mongoose from "mongoose";
import productTagModel from "../../models/productTagModel.js";

const updateProductValidationSchema = [
  body("name")
    .ltrim()
    .rtrim()
    .isString()
    .optional()
    .custom(async (value, { req }) => {
      if (
        req.params.productId !== null ||
        req.params.productId !== undefined ||
        req.params.productId !== ""
      ) {
        const data = await Product.findOne({
          name: new RegExp("^" + value + "$", "i"),
          store: req.body.store,
          _id: { $ne: req.params.productId },
          status: true,
        });
        if (data) {
          return Promise.reject("Product name already exists in store level");
        }
      }
    }),
  body("active").optional().isBoolean(),
  body("property")
    .notEmpty()
    .optional()
    .custom((propertyId) => mongoose.Types.ObjectId.isValid(propertyId))
    .withMessage("Property is required and should be a valid ObjectId"),
  body("location")
    .notEmpty()
    .optional()
    .custom((locationId) => mongoose.Types.ObjectId.isValid(locationId))
    .withMessage("Location is required and should be a valid ObjectId"),
  body("store")
    .notEmpty()
    .optional()
    .custom((storeId) => mongoose.Types.ObjectId.isValid(storeId))
    .withMessage("store is required and should be a valid ObjectId"),
  body("storeCategory")
    .optional({ values: "falsy" })
    .custom((categoryId) => mongoose.Types.ObjectId.isValid(categoryId))
    .withMessage("storeCategory is required and should be a valid ObjectId"),
  body("shortDescription")
    .isString()
    .optional()
    .withMessage("Short description must be string"),
  body("description")
    .isString()
    .optional()
    .withMessage("Description must be string"),
  body("estimatedTime")
    .optional({ values: "falsy" })
    .isNumeric()
    .withMessage("Estimated time must be a Number"),
  body("initialPrice")
    .isNumeric()
    .optional()
    .withMessage("Initial price must be number"),

  body("status").isBoolean().optional(),
  body("discount.discountValue")
    .optional()
    .toFloat()
    .custom((discountValue, { req }) => {
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
    })
    .isNumeric()
    .withMessage("Discount value must be number"),
  body("discount.discountType")
    .toLowerCase()
    .optional({ checkFalsy: true })
    .matches(/^(percentage|flat|nodiscount)$/i)
    .withMessage(
      "Discount type must be string and should be one of percentage|nodiscount|flat"
    ),
  body("tax")
    .optional({ values: "falsy" })
    .custom((tax) => {
      if (tax === "") {
        return true;
      } else {
        return tax.map((taxId) => {
          return mongoose.Types.ObjectId.isValid(taxId);
        });
      }
    }),
  body("units").isString().optional().withMessage("Units are required"),
  body("minQuantity")
    .isNumeric()
    .optional()
    .withMessage("Min quantity must be number"),
  body("maxQuantity")
    .isNumeric()
    .optional()
    .withMessage("Max quantity must be number"),
  body("stock")
    .optional({ values: "falsy" })
    .isNumeric()
    .withMessage("Stock must be number"),
  body("sku").isString().optional().withMessage("Sku must be string"),
  body("addons.*.name")
    .isString()
    .optional()
    .withMessage("Addons.name must be a string"),
  body("addons.*.price")
    .isNumeric()
    .optional()
    .withMessage("Addons.price must be a number"),

  body("status").isBoolean().optional().withMessage("Status must be boolean"),
  param("productId")
    .notEmpty()
    .custom(async (productId) => {
      const data = await Product.findOne({
        _id: productId,
      });
      if (!data) {
        return Promise.reject("Product Id should exists");
      }
    }),
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

export { updateProductValidationSchema };
