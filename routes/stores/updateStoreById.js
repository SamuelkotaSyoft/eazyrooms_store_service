import express from "express";
import verifyToken from "../../helpers/verifyToken.js";
import User from "../../models/userModel.js";
var router = express.Router();

//import models
import Store from "../../models/storeModel.js";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import { matchedData } from "express-validator";
import { uploadMulitpleImageToS3 } from "../../helpers/uploads/uploadMultipleImage.js";
import { updateStoreValidationSchema } from "../../validationSchema/stores/updateStoreValidationSchema.js";
import notify from "../../helpers/notifications/notify.js";
import { generateQrcode } from "../../helpers/generateQrcode.js";

async function updateStoreById(req, res) {
  //request payload
  const uid = req.user_info.main_uid;

  const requestData = matchedData(req);

  const role = req.user_info.role;
  console.log("requestData----------", requestData);
  //validate userId
  if (!uid) {
    res.status(400).json({ status: false, error: "userId is required" });
    return;
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
    //check if user exists
    const user = await User.findOne({ uid: uid });
    if (!user) {
      res.status(400).json({ status: false, error: "Invalid userId" });
      return;
    }
    let extras = {
      qrCode: "",
    };
    const storeDetails = await Store.findById(requestData.storeId);
    if (requestData.name) {
      extras.qrCode = await generateQrcode(
        `${process.env.GUEST_APP_URL}/products/${requestData.storeId}?storeName=${requestData.name}&location=${storeDetails.location}&type=store`
      );
    } else {
      delete extras.qrCode;
    }
    //update user
    const writeResult = await Store.findByIdAndUpdate(
      { _id: requestData.storeId },
      {
        ...requestData,
        ...extras,
        updatedBy: user._id,
        ...(req.fileUrls?.length > 0 && { images: req.fileUrls }),
      },
      { new: true }
    );
    try {
      await notify({
        userId: user._id,
        propertyId: user.property,
        location: [writeResult.location],
        stores: [writeResult._id],
        role: ["locationAdmin", "storeAdmin"],
        notificationText:
          user.fullName + " has updated a new store named " + writeResult.name,
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
//new buyer
router.patch(
  "/",
  verifyToken,
  uploadMulitpleImageToS3,
  updateStoreValidationSchema,
  validateRequest,
  updateStoreById
);

export default router;
