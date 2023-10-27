import express from "express";
import verifyToken from "../../helpers/verifyToken.js";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import { matchedData } from "express-validator";
import User from "../../models/userModel.js";
import { uploadMulitpleImageToS3 } from "../../helpers/uploads/uploadMultipleImage.js";
import StoreLocation from "../../models/storeLocationModel.js";
import { createStoreLocationValidationSchema } from "../../validationSchema/storeLocationSchema.js";
import { generateQrcode } from "../../helpers/generateQrcode.js";
import notify from "../../helpers/notifications/notify.js";
import Store from "../../models/storeModel.js";
const router = express.Router();
async function createStoreLocation(req, res) {
  const uid = req.user_info.main_uid;
  const requestData = matchedData(req);
  try {
    const user = await User.findOne({ uid: uid });
    const store = await Store.findOne({ _id: requestData.store });
    const property = user.property;
    const qrCodeLink = await generateQrcode(
      `${process.env.GUEST_APP_URL}/product?storeLocation=${requestData.name}&type=storeLocation`
    );
    const storeLocation = new StoreLocation({
      ...requestData,
      property,
      qrCode: qrCodeLink,
      createdBy: user._id,
      updatedBy: user._id,
      status: true,
      images: req.fileUrls,
      active: true,
    });
    const writableResult = await storeLocation.save();
    const updatedQrCodeLink = await generateQrcode(
      `${process.env.GUEST_APP_URL}/products/${requestData.store}?storeLocation=${requestData.name}&location=${requestData?.location}&storeLocationId=${writableResult._id}&storeName=${store?.name}&type=storeLocation`
    );
    const updatedStoreLocation = await StoreLocation.findByIdAndUpdate(
      writableResult._id,
      { qrCode: updatedQrCodeLink },
      { new: true }
    );
    await notify({
      userId: user._id,
      propertyId: user.property,
      location: [writableResult.location],
      stores: [writableResult.store],
      role: ["locationAdmin", "storeAdmin"],
      notificationText:
        user.fullName +
        " has created a new store Location named " +
        writableResult.name,
      authToken: req.headers["eazyrooms-token"],
    });
    res.status(200).json({ status: true, data: writableResult });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}
router.post(
  "/",
  verifyToken,
  uploadMulitpleImageToS3,
  createStoreLocationValidationSchema,
  validateRequest,
  createStoreLocation
);

export default router;
