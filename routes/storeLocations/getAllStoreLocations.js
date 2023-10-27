import express from "express";
var router = express.Router();

//import middleware
import verifyToken from "../../helpers/verifyToken.js";

//import models
import User from "../../models/userModel.js";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import { matchedData } from "express-validator";
import { commonGetRequestValidationSchema } from "../../validationSchema/commonSchema.js";
import StoreLocation from "../../models/storeLocationModel.js";
import { getAllStoreLocationValidationSchema } from "../../validationSchema/storeLocationSchema.js";
async function getAllStoreLocations(req, res) {
  const uid = req.user_info.main_uid;
  const requestData = matchedData(req);
  let filterObj = { status: true };

  if (requestData.q) {
    filterObj.name = { $regex: requestData.q, $options: "i" };
  }
  if (requestData.storeId) {
    filterObj.store = requestData.storeId;
  }
  try {
    const user = await User.findOne({ uid: uid });
    //if the user wants pagination
    var skip = 0;
    var limit = null;
    if (requestData.page && requestData.limit) {
      skip = (requestData.page - 1) * requestData.limit;
      limit = requestData.limit;
    }

    var query = StoreLocation.find(filterObj)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);
    const queryResult = await query.exec();

    const storeCategoriesCount = await StoreLocation.countDocuments(
      filterObj
    ).exec();
    res.status(200).json({
      status: true,
      data: {
        storeLocations: queryResult,
        page: Number(requestData.page),
        limit: limit,
        totalPageCount: Math.ceil(storeCategoriesCount / limit),
        totalCount: storeCategoriesCount,
      },
    });
  } catch (err) {
    res.status(500).json({ status: false, error: err });
  }
}
//get all tasks
router.get(
  "/:storeId",
  verifyToken,
  commonGetRequestValidationSchema,
  getAllStoreLocationValidationSchema,
  validateRequest,
  getAllStoreLocations
);

export default router;
