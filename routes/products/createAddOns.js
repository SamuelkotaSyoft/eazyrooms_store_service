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
import { createAddOnValidationSchema } from "../../validationSchema/products/createAddonValidationSchema.js";
import notify from "../../helpers/notifications/notify.js";

//create product
async function createAddons(req, res) {
  //request payload
  const uid = req.user_info.main_uid;
  const role = req.user_info.role;
  const requestData = matchedData(req);
  try {
    if (
      role !== "propertyAdmin" &&
      role !== "locationAdmin" &&
      role !== "storeAdmin"
    ) {
      res.status(403).json({ status: false, error: "Unauthorized" });
      return;
    }

    const user = await User.findOne({ uid: uid });
    const product = await Product.findOne({ _id: requestData.product });

    const addOns = new Product({
      ...requestData,
      createdBy: user._id,
      store: product.store,
      location: product.location,
      storeCategory: product.storeCategory,
      isAddOn: true,
      updatedBy: user._id,
      property: user.property,
      status: true,
      images: req.fileUrls,
      active: true,
      units: "per item",
    });

    const writeResult = await addOns.save();

    const updateProduct = Product.findByIdAndUpdate(
      { _id: requestData.product },
      { $push: { addOns: writeResult._id } },
      {
        new: true,
      }
    );
    const parentProductWrite = await updateProduct.exec();
    await notify({
      userId: user._id,
      propertyId: user.property,
      location: [writeResult.location],
      stores: [writeResult.store],
      role: ["locationAdmin", "storeAdmin"],
      notificationText:
        user.fullName +
        " has added a new Addon named " +
        writeResult.name +
        "for product" +
        parentProductWrite.name,
      authToken: req.headers["eazyrooms-token"],
    });

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
  createAddOnValidationSchema,
  validateRequest,
  createAddons
);

export default router;
