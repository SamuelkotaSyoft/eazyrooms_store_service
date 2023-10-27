import express from "express";
import verifyToken from "../../helpers/verifyToken.js";
var router = express.Router();

//import models
import StoreCategory from "../../models/storeCategoryModel.js";
import User from "../../models/userModel.js";
import { getStoreCategoryValidationByIdSchema } from "../../validationSchema/storeCategories/storeCateogoryByIdValidationSchema.js";
async function getStoreCategoryDetailsById(req, res) {
  //payload
  const uid = req.user_info.main_uid;
  const storeId = req.params.storeId;

  //validate userId
  if (!uid) {
    return res.status(400).json({ status: false, error: "userId is required" });
  }
  const user = User.findOne({ uid: uid });

  try {
    //query
    let query = StoreCategory.findOne({ _id: storeId });

    //execute query
    const queryResult = await query.exec();

    //return result
    res.status(200).json({ status: true, data: queryResult });
  } catch (err) {
    res.status(500).json({ status: false, error: err });
  }
}
//get user by id
router.get(
  "/:storeId",
  getStoreCategoryValidationByIdSchema,
  verifyToken,
  getStoreCategoryDetailsById
);

export default router;
