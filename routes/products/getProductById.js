import express from "express";
import verifyToken from "../../helpers/verifyToken.js";
var router = express.Router();

//import models
import Product from "../../models/productModel.js";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import { getProductValidationByIdSchema } from "../../validationSchema/products/getProductByIdValidationSchema.js";

async function getProductById(req, res) {
  //payload
  const productId = req.params.productId;

  try {
    let query = Product.findOne({ _id: productId }).populate(
      "addOns tag tax storeCategory"
    );
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
  "/:productId",
  // verifyToken,
  getProductValidationByIdSchema,
  validateRequest,
  getProductById
);

export default router;
