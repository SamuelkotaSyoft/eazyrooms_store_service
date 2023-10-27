import express from "express";
var router = express.Router();

//import middleware
import verifyToken from "../../helpers/verifyToken.js";

//import models
import Store from "../../models/storeModel.js";
import User from "../../models/userModel.js";
import { commonGetRequestValidationSchema } from "../../validationSchema/commonSchema.js";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import { matchedData } from "express-validator";
import { getAllStoreValidationSchema } from "../../validationSchema/stores/getAllStoreValidationSchema.js";

async function getAllStores(req, res) {
  // const uid = req.user_info.main_uid;
  const requestData = matchedData(req);
  const filterObj = {
    status: true,
  };
  if (requestData.active) {
    filterObj.active = requestData.active;
  }
  if (requestData.location) {
    filterObj.location = req.params.location;
  }
  if (requestData.status) {
    filterObj.status = requestData.status;
  }
  if (requestData.q) {
    filterObj.name = { $regex: requestData.q, $options: "i" };
  }

  try {
    var skip = 0;
    var limit = null;

    if (requestData.page && requestData.limit) {
      skip = (requestData.page - 1) * requestData.limit;
      limit = requestData.limit;
    }

    var queryResult = await Store.find(filterObj)
      .sort({ updatedAt: -1, active: -1 })
      .skip(skip)
      .limit(limit);

    const storeCount = await Store.countDocuments(filterObj).exec();
    if (requestData?.pagination === "false") {
      return res.status(200).json(queryResult);
    }
    res.status(200).json({
      status: true,
      data: {
        stores: queryResult,
        page: Number(requestData.page),
        limit: limit,
        totalPageCount: Math.ceil(storeCount / limit),
        totalCount: storeCount,
      },
    });
    //query
  } catch (err) {
    res.status(500).json({ status: false, error: err });
  }
}
//get all stores
router.get(
  "/:location",
  // verifyToken,
  getAllStoreValidationSchema,
  commonGetRequestValidationSchema,
  validateRequest,
  getAllStores
);

export default router;
