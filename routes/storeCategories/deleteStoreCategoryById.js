import express from "express";
import verifyToken from "../../helpers/verifyToken.js";
var router = express.Router();

//import models
import StoreCategory from "../../models/storeCategoryModel.js";
import notify from "../../helpers/notifications/notify.js";

//new buyer
router.delete("/:storeCategoryId", verifyToken, async function (req, res) {
  //request payload
  const storeCategoryId = req.params.storeCategoryId;

  //validate storeCategoryId
  if (!storeCategoryId) {
    res
      .status(400)
      .json({ status: false, error: "storeCategoryId is required" });
    return;
  }

  try {
    //check if StoreCategory exists

    //delete StoreCategory
    const writeResult = await StoreCategory.findByIdAndUpdate(
      { _id: storeCategoryId },
      { status: false }
    );
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

    //send response to client
    res.status(200).json({ status: true, data: writeResult });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

export default router;
