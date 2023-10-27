import express from "express";
import verifyToken from "../../helpers/verifyToken.js";
import User from "../../models/userModel.js";
var router = express.Router();

//import models
import Product from "../../models/productModel.js";
import { matchedData } from "express-validator";
import { updateProductValidationSchema } from "../../validationSchema/products/updateProductValidationSchema.js";
import { uploadMulitpleImageToS3 } from "../../helpers/uploads/uploadMultipleImage.js";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import notify from "../../helpers/notifications/notify.js";
import { calculateFinalPrice } from "../../helpers/calcuateFinalPrice.js";
import createTag from "../../helpers/controllers/createTag.js";
import { createAddOn } from "../../helpers/controllers/createAddOn.js";

async function updateProduct(req, res) {
  //request payload
  const uid = req.user_info.main_uid;
  const role = req.user_info.role;
  const productId = req.params.productId;
  const requestData = matchedData(req);
  let product = await Product.findOne({ _id: productId });

  try {
    if (
      role !== "propertyAdmin" &&
      role !== "locationAdmin" &&
      role !== "storeAdmin"
    ) {
      res.status(403).json({ status: false, error: "Unauthorized" });
      return;
    }
    //check if user exists
    const user = await User.findOne({ uid: uid });
    if (!user) {
      res.status(400).json({ status: false, error: "Invalid userId" });
      return;
    }
    let additonalCalculations = {
      finalPrice: 0,
    };

    if (requestData?.initialPrice) {
      additonalCalculations.finalPrice = await calculateFinalPrice(requestData);
    } else {
      delete additonalCalculations.finalPrice;
    }
    //update user

    const writeResult = await Product.findByIdAndUpdate(
      { _id: productId },
      {
        ...requestData,
        updatedBy: user._id,
        ...additonalCalculations,
        ...(req.fileUrls?.length > 0 && { images: req.fileUrls }),
      },
      { new: true }
    );
    await createTag({ requestData, writeResult, user });
    // console.log({ addOns: req.body.addOns });
    if (req.body.addOns)
      await createAddOn({
        parsedAddOns: JSON.parse(req.body.addOns),
        requestData,
        writeResult,
        user,
        res,
      });
    await notify({
      userId: user._id,
      propertyId: user.property,
      location: [writeResult.location],
      stores: [writeResult.store],
      role: ["locationAdmin", "storeAdmin"],
      notificationText:
        user.fullName + " has updated a product named " + writeResult.name,
      authToken: req.headers["eazyrooms-token"],
    });

    res.status(200).json({ status: true, data: writeResult });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}
//new buyer
router.patch(
  "/:productId",
  verifyToken,
  uploadMulitpleImageToS3,
  updateProductValidationSchema,
  validateRequest,
  updateProduct
);

export default router;
