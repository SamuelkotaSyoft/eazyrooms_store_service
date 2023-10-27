import express from "express";
import verifyToken from "../../helpers/verifyToken.js";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import { matchedData } from "express-validator";
import User from "../../models/userModel.js";
import StoreCategory from "../../models/storeCategoryModel.js";
import { uploadMulitpleImageToS3 } from "../../helpers/uploads/uploadMultipleImage.js";
import { createStoreCategoryValidationSchema } from "../../validationSchema/storeCategories/createStoreCategoryValidationSchema.js";
import notify from "../../helpers/notifications/notify.js";
const router = express.Router();

async function createStoreCategory(req, res) {
  const uid = req.user_info.main_uid;
  const requestData = matchedData(req);
  try {
    const user = await User.findOne({ uid: uid });
    const property = user.property;
    const storeCategory = new StoreCategory({
      ...requestData,
      property,
      createdBy: user._id,
      updatedBy: user._id,
      status: true,
      images: req.fileUrls,
      active: true,
    });
    const writableResult = await storeCategory.save();

    try {
      await notify({
        userId: user._id,
        propertyId: user.property,
        location: [writableResult.location],
        stores: [writableResult.store],
        role: ["locationAdmin", "storeAdmin"],
        notificationText:
          user.fullName +
          " has created a new store category named " +
          writableResult.name,
        authToken: req.headers["eazyrooms-token"],
      });
    } catch (error) {
      console.log(error);
    }

    res.status(200).json({ status: true, data: writableResult });
  } catch (err) {
    res.status(500).json({ error: err });
  }
}
router.post(
  "/",
  verifyToken,
  uploadMulitpleImageToS3,
  createStoreCategoryValidationSchema,
  validateRequest,
  createStoreCategory
);

export default router;
