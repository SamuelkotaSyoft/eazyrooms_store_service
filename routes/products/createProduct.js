import express, { request } from "express";
import verifyToken from "../../helpers/verifyToken.js";
var router = express.Router();

//import models
import Product from "../../models/productModel.js";
import User from "../../models/userModel.js";
import { matchedData } from "express-validator";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import { createProductValidationSchema } from "../../validationSchema/products/createProductValidationSchema.js";
import { uploadMulitpleImageToS3 } from "../../helpers/uploads/uploadMultipleImage.js";
import productTagModel from "../../models/productTagModel.js";
import notify from "../../helpers/notifications/notify.js";
import { calculateFinalPrice } from "../../helpers/calcuateFinalPrice.js";
import { createAddOn } from "../../helpers/controllers/createAddOn.js";
import createTag from "../../helpers/controllers/createTag.js";

//create product
async function createProduct(req, res) {
  //request payload
  const uid = req.user_info.main_uid;
  const role = req.user_info.role;
  const requestData = matchedData(req);
  if (requestData.tax === "") {
    delete requestData.tax;
  }
  if (requestData.storeCategory === "") {
    delete requestData.storeCategory;
  }
  try {
    if (
      role !== "propertyAdmin" &&
      role !== "locationAdmin" &&
      role !== "storeAdmin"
    ) {
      res.status(403).json({ status: false, error: "Unauthorized" });
      return;
    }
    //fetching user details in order to store created at and updated at
    const user = await User.findOne({ uid: uid });
    const finalPrice = await calculateFinalPrice(requestData);
    if (finalPrice < 0) {
      res.status(400).json({
        status: false,
        error: [{ msg: "finalPrice is less than 0" }],
      });
    }
    const product = new Product({
      ...requestData,
      addOns: [],
      tag: [],
      createdBy: user._id,
      updatedBy: user._id,
      property: user.property,
      status: true,
      active: true,
      // tags: tagObjectId,
      images: req.fileUrls,
      active: true,
      finalPrice,
    });
    const writeResult = await product.save();
    await createTag({ requestData, writeResult, user });
    await createAddOn({
      parsedAddOns: JSON.parse(req.body.addOns),
      requestData,
      writeResult,
      user,
      res,
    });

    try {
      await notify({
        userId: user._id,
        propertyId: user.property,
        location: [writeResult.location],
        stores: [writeResult.store],
        role: ["locationAdmin", "storeAdmin"],
        notificationText:
          user.fullName +
          " has created a new product named " +
          writeResult.name,
        authToken: req.headers["eazyrooms-token"],
      });
    } catch (error) {
      console.log(error);
    }

    res.status(200).json({ status: true, data: writeResult });
  } catch (err) {
    console.log("err-----------", err);
    res.status(500).json({ error: err });
  }
}
router.post(
  "/",
  verifyToken,

  uploadMulitpleImageToS3,
  createProductValidationSchema,
  validateRequest,
  createProduct
);

export default router;
