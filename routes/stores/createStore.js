import express from "express";
import verifyToken from "../../helpers/verifyToken.js";
var router = express.Router();

//import models
import Store from "../../models/storeModel.js";
import User from "../../models/userModel.js";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import { uploadMulitpleImageToS3 } from "../../helpers/uploads/uploadMultipleImage.js";
import { createStoreValidationSchema } from "../../validationSchema/storeSchema.js";
import { matchedData } from "express-validator";
import { generateQrcode } from "../../helpers/generateQrcode.js";
import notify from "../../helpers/notifications/notify.js";

async function createStore(req, res) {
  //request payload
  const uid = req.user_info.main_uid;
  const requestData = matchedData(req);
  console.log(req.fileUrls);
  const role = req.user_info.role;

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
    const qrCodeLink = await generateQrcode(
      `${process.env.GUEST_APP_URL}/product?storeName=${requestData.name}&type=store`
    );
    //add store

    const store = new Store({
      name: requestData.name,
      images: req.fileUrls,
      property: user.property,
      location: requestData.location,
      createdBy: user._id,
      images: req.fileUrls,
      updatedBy: user._id,
      qrCode: qrCodeLink,
      status: true,
      active: true,
    });

    //save address
    const writeResult = await store.save();
    const updatedQrCodeLink = await generateQrcode(
      `${process.env.GUEST_APP_URL}/products/${writeResult._id}?storeName=${requestData.name}&location=${writeResult.location}&type=store`
    );
    const updatedStore = await Store.findByIdAndUpdate(
      writeResult._id,
      {
        qrCode: updatedQrCodeLink,
      },
      { new: true }
    );

    try {
      await notify({
        userId: user._id,
        propertyId: user.property,
        location: [writeResult.location],
        role: ["locationAdmin", "storeAdmin"],
        notificationText:
          user.fullName + " has created a new store named " + writeResult.name,
        authToken: req.headers["eazyrooms-token"],
      });
    } catch (error) {
      console.log(error);
    }

    res.status(200).json({ status: true, data: writeResult });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}
//create chatbot
router.post(
  "/",
  verifyToken,
  uploadMulitpleImageToS3,
  createStoreValidationSchema,
  validateRequest,
  createStore
);

export default router;
