import express from "express";
import verifyToken from "../../helpers/verifyToken.js";
var router = express.Router();

//import models
import Store from "../../models/storeModel.js";
import { getStoreValidationByIdSchema } from "../../validationSchema/storeSchema.js";
async function getStoreDetailsById(req, res) {
  //payload
  const storeId = req.params.storeId;

  //validate userId

  try {
    //query
    let query = Store.findOne({ _id: storeId });

    //execute query
    const queryResult = await query.exec();

    //return result
    res.status(200).json({ status: true, data: queryResult });
  } catch (err) {
    res.status(500).json({ status: false, error: err });
  }
}
//get user by id
router.get("/:storeId", getStoreValidationByIdSchema, getStoreDetailsById);

export default router;
