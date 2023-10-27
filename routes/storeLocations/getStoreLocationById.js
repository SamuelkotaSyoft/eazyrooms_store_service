import express from "express";
import verifyToken from "../../helpers/verifyToken.js";
var router = express.Router();

import storeLocationModel from "../../models/storeLocationModel.js";
import { getStoreLocationValidationByIdSchema } from "../../validationSchema/storeLocationSchema.js";
import { matchedData } from "express-validator";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
async function getStoreLocationById(req, res) {
  const requestData = matchedData(req);
  //payload
  const storeLocationId = requestData.storeLocationId;

  try {
    console.log({ storeLocationId });
    //query
    let query = storeLocationModel.findOne({ _id: storeLocationId });

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
  "/:storeLocationId",
  getStoreLocationValidationByIdSchema,
  validateRequest,
  getStoreLocationById
);

export default router;
