import express from "express";
import verifyToken from "../../helpers/verifyToken.js";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import { uploadMulitpleImageToS3 } from "../../helpers/uploads/uploadMultipleImage.js";
import StoreLocation from "../../models/storeLocationModel.js";
import User from "../../models/userModel.js";
import { updateStoreLocationValidationSchema } from "../../validationSchema/storeLocation/updateStoreLocationValidationSchema.js";
import { matchedData } from "express-validator";
import notify from "../../helpers/notifications/notify.js";

const router = express.Router();

async function updateStoreLocationById(req, res) {
  //request payload
  const uid = req.user_info.main_uid;
  const requestData = matchedData(req);
  const storeLocationId = requestData.storeLocationId;

  try {
    //check if user exists
    const user = await User.findOne({ uid: uid });
    if (!user) {
      res.status(400).json({ status: false, error: "Invalid userId" });
      return;
    }

    const writeResult = await StoreLocation.findByIdAndUpdate(
      { _id: storeLocationId },
      {
        ...requestData,
        updatedBy: user._id,
        ...(req.fileUrls?.length > 0 && { images: req.fileUrls }),
      },
      { new: true }
    );
    await notify({
      userId: user._id,
      propertyId: user.property,
      location: [writeResult.location],
      stores: [writeResult.store],
      role: ["locationAdmin", "storeAdmin"],
      notificationText:
        user.fullName +
        " has updated a new store Location named " +
        writeResult.name,
      authToken: req.headers["eazyrooms-token"],
    });
    res.status(200).json({ status: true, data: writeResult });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}
router.patch(
  "/",
  verifyToken,
  uploadMulitpleImageToS3,
  updateStoreLocationValidationSchema,
  validateRequest,
  updateStoreLocationById
);

export default router;
