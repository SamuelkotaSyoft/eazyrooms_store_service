import express from "express";
var router = express.Router();
//import middleware
//import models
import mongoose from "mongoose";
import Product from "../../models/productModel.js";
import { matchedData } from "express-validator";
import { commonGetRequestValidationSchema } from "../../validationSchema/commonSchema.js";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import { getAllProductValidationByIdSchema } from "../../validationSchema/products/getAllProductValidationSchema.js";
/**
 *   * @api {get} /products/:store Get all products
 *
 *
 */
async function getAllProducts(req, res) {
  const store = req.params.store;

  const requestData = matchedData(req);

  try {
    /**
     * pagination steps
     */
    let skip = 0;
    let limit = null;
    if (requestData.page && requestData.limit) {
      skip = (requestData.page - 1) * requestData.limit;
      limit = requestData.limit;
    }
    /**
     * * @param {Object} filterObj
     * * @param {Boolean} filterObj.status
     * * @param {Boolean} filterObj.isAddOn
     * * @param {Array} filterObj.tagId optional field to check filters by tag if empty not included in query
     */
    const filterObj = {
      status: true,
      isAddOn: false,
    };

    if (requestData.active) {
      filterObj.active = requestData.active;
    }
    if (store) {
      filterObj.store = new mongoose.Types.ObjectId(store);
    }
    if (requestData.status) {
      filterObj.status = requestData.status;
    }
    if (requestData.isAddOn) {
      filterObj.isAddOn = requestData.isAddOn;
    }
    if (requestData.q) {
      filterObj.name = { $regex: requestData.q, $options: "i" };
    }
    if (requestData.tagId) {
      filterObj.tagId = [];
      /**
       * checks weather tagId is string or array if single it will be array since it is sending from query Params
       */
      if (typeof requestData.tagId === "string") {
        filterObj.tagId.push(new mongoose.Types.ObjectId(requestData.tagId));
      } else {
        requestData?.tagId?.forEach((tag) => {
          filterObj.tagId.push(new mongoose.Types.ObjectId(tag));
        });
      }
      /**
       * reassigning to a new field tag to use in query
       */
      filterObj.tag = { $in: filterObj.tagId };
      /**
       * deleting tagId from filterObj since it is not a field in product model
       */
      delete filterObj.tagId;
    }
    let sortObject = {};

    if (requestData.price === "asc") {
      sortObject.finalPrice = 1;
    }
    if (requestData.price === "desc") {
      sortObject.finalPrice = -1;
    }
    if (requestData.time === "asc") {
      sortObject.updatedAt = 1;
    }
    if (requestData.time === "desc") {
      sortObject.updatedAt = -1;
    }
    if (requestData.storeCategory) {
      filterObj.storeCategory = new mongoose.Types.ObjectId(
        requestData.storeCategory
      );
    }

    let query = Product.find(filterObj)
      .sort({ updatedAt: -1, active: -1, ...sortObject })
      .skip(skip)
      .limit(limit)
      .populate("addOns tag tax storeCategory")
      .populate({
        path: "location",
        select: ["currency"],
      });

    const queryResult = await query.exec();

    const productCount = await Product.countDocuments(filterObj).exec();
    console.log({ requestData });
    if (requestData?.pagination === "false") {
      return res.status(200).json(queryResult);
    }

    //return result
    res.status(200).json({
      status: true,
      data: {
        products: queryResult,
        page: Number(requestData.page),
        limit: limit,
        totalPageCount: Math.ceil(productCount / limit),
        totalCount: productCount,
      },
    });
  } catch (err) {
    console.log({ err });
    res.status(500).json({ status: false, error: err });
  }
}
//get all products
router.get(
  "/:store",
  commonGetRequestValidationSchema,
  getAllProductValidationByIdSchema,
  validateRequest,
  getAllProducts
);

export default router;
