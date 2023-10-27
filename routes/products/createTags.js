import express, { request } from "express";
import verifyToken from "../../helpers/verifyToken.js";
var router = express.Router();
import Product from "../../models/productModel.js";
import User from "../../models/userModel.js";
import { matchedData } from "express-validator";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import { uploadMulitpleImageToS3 } from "../../helpers/uploads/uploadMultipleImage.js";
import productTagModel from "../../models/productTagModel.js";
import { createTagsValidationSchema } from "../../validationSchema/products/createTagsValidationSchema.js";
import notify from "../../helpers/notifications/notify.js";

//create product
async function createTags(req, res) {
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

    const tags = new productTagModel({
      ...requestData,
      createdBy: user._id,
      store: product.store,
      updatedBy: user._id,
      status: true,
    });

    const writeResult = await tags.save();
    const updateProduct = Product.findByIdAndUpdate(
      { _id: requestData.product },
      { $push: { tag: writeResult._id } }
    );
    const parentProduct = await updateProduct.exec();
    await notify({
      userId: user._id,
      propertyId: user.property,
      location: [writeResult.location],
      stores: [writeResult.store],
      role: ["locationAdmin", "storeAdmin"],
      notificationText:
        user.fullName +
        " has created a tag named " +
        writeResult.name +
        "for product" +
        parentProduct.name,
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
  createTagsValidationSchema,
  validateRequest,
  createTags
);

export default router;
