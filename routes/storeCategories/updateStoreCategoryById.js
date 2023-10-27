import express from "express";
import verifyToken from "../../helpers/verifyToken.js";
import StoreCategory from "../../models/storeCategoryModel.js";
import { validateRequest } from "../../helpers/validatorErrorHandling.js";
import { uploadMulitpleImageToS3 } from "../../helpers/uploads/uploadMultipleImage.js";
import User from "../../models/userModel.js";
import { matchedData } from "express-validator";
import { updateStoreCategoryValidationSchema } from "../../validationSchema/storeCategories/updateStoreCategoryValidationSchema.js";
import notify from "../../helpers/notifications/notify.js";
import updateRelatedModels from "../../helpers/updates/updateRelatedModels.js";

const router = express.Router();

async function updateStoreCategoryById(req, res) {
  //request payload
  const uid = req.user_info.main_uid;
  const requestData = matchedData(req);
  const categoryId = requestData.storeCategoryId;

  try {
    //check if user exists
    const user = await User.findOne({ uid: uid });
    if (!user) {
      res.status(400).json({ status: false, error: "Invalid userId" });
      return;
    }

    const writeResult = await StoreCategory.findByIdAndUpdate(
      { _id: categoryId },
      {
        ...requestData,
        updatedBy: user._id,
        ...(req.fileUrls?.length > 0 && { images: req.fileUrls }),
      },
      { new: true }
    );

    if (writeResult.status === false || writeResult.active === false)
      await updateRelatedModels(
        { storeCategory: requestData.storeCategoryId },
        { status: writeResult.status, active: writeResult.active },
        "storeCategory"
      );
    try {
      await notify({
        userId: user._id,
        propertyId: user.property,
        location: [writeResult.location],
        stores: [writeResult.store],
        role: ["locationAdmin", "storeAdmin"],
        notificationText:
          user.fullName +
          " has deleted a new store category named " +
          writeResult.name,
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
router.patch(
  "/",
  verifyToken,
  uploadMulitpleImageToS3,
  updateStoreCategoryValidationSchema,
  validateRequest,
  updateStoreCategoryById
);

export default router;
