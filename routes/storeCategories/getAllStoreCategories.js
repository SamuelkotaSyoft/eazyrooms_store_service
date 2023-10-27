import express from "express";
var router = express.Router();

//import middleware
import verifyToken from "../../helpers/verifyToken.js";

//import models
import User from "../../models/userModel.js";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import { matchedData } from "express-validator";
import { commonGetRequestValidationSchema } from "../../validationSchema/commonSchema.js";
import StoreCategory from "../../models/storeCategoryModel.js";
async function getAllStoreCategories(req, res) {
  // const uid = req.user_info.main_uid;
  const requestData = matchedData(req);
  let filterObj = {
    status: true,
  };

  const storeId = req.params.storeId;
  if (storeId) {
    filterObj.store = storeId;
  }
  if (requestData.active) {
    filterObj.active = requestData.active;
  }
  if (requestData.status) {
    filterObj.status = requestData.status;
  }
  if (requestData.q) {
    filterObj.name = { $regex: requestData.q, $options: "i" };
  }
  try {
    // const user = await User.findOne({ uid: uid });
    //if the user wants pagination
    var skip = 0;
    var limit = null;
    if (requestData.page && requestData.limit) {
      skip = (requestData.page - 1) * requestData.limit;
      limit = requestData.limit;
    }

    var query = StoreCategory.find(filterObj)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);
    const queryResult = await query.exec();

    const storeCategoriesCount = await StoreCategory.countDocuments(
      filterObj
    ).exec();
    if (requestData?.pagination === "false") {
      return res.status(200).json(queryResult);
    }
    res.status(200).json({
      status: true,
      data: {
        storeCategories: queryResult,
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
  // verifyToken,
  commonGetRequestValidationSchema,
  validateRequest,
  getAllStoreCategories
);

export default router;
