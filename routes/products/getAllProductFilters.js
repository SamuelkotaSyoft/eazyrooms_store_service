import express from "express";
var router = express.Router();

//import middleware

//import models
import ProductTag from "../../models/productTagModel.js";
import { commonGetRequestValidationSchema } from "../../validationSchema/commonSchema.js";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import { matchedData } from "express-validator";

async function getAllFilters(req, res) {
  const store = req.params.store;
  // const role = req.user_info.role;
  let skip = 0;
  let limit = null;
  let status = true;
  const requestData = matchedData(req);
  if (requestData.page && requestData.limit) {
    skip = (requestData.page - 1) * requestData.limit;
    limit = requestData.limit;
  }

  if (requestData.status) {
    status = requestData.status;
  }

  try {
    const query = ProductTag.find({ store, status })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);
    const queryResult = await query.exec();
    const filtersCount = await ProductTag.countDocuments(queryResult);
    //return result
    res.status(200).json({
      status: true,
      data: {
        filters: queryResult,
        page: Number(requestData.page),
        limit: limit,
        totalPageCount: Math.ceil(filtersCount / limit),
        totalCount: filtersCount,
      },
    });
  } catch (err) {
    res.status(500).json({ status: false, error: err });
  }
}
//get all products
router.get(
  "/:store",
  commonGetRequestValidationSchema,
  validateRequest,
  getAllFilters
);

export default router;
