import express from "express";
import verifyToken from "../../helpers/verifyToken.js";
var router = express.Router();

//import models
import Store from "../../models/storeModel.js";
import userModel from "../../models/userModel.js";
import notify from "../../helpers/notifications/notify.js";

//new buyer
router.delete("/:storeId", verifyToken, async function (req, res) {
  //request payload
  const storeId = req.params.storeId;

  const role = req.user_info.role;
  const uid = req.user_info.main_uid;

  //validate storeId
  if (!storeId) {
    res.status(400).json({ status: false, error: "storeId is required" });
    return;
  }

  try {
    const user = await userModel.findOne({ uid: uid });
    if (
      role !== "propertyAdmin" &&
      role !== "locationAdmin" &&
      role !== "storeAdmin"
    ) {
      res.status(403).json({ status: false, error: "Unauthorized" });
      return;
    }
    //check if store exists

    //delete store
    const writeResult = await Store.findByIdAndUpdate(
      { _id: storeId },
      { status: false, updatedBy: user._id }
    );

    try {
      await notify({
        userId: user._id,
        propertyId: user.property,
        location: [writeResult.location],
        stores: [writeResult._id],
        role: ["locationAdmin", "storeAdmin"],
        notificationText:
          user.fullName + " has deleted a new store named " + writeResult.name,
        authToken: req.headers["eazyrooms-token"],
      });
    } catch (error) {
      console.log(error);
    }

    //send response to client
    res.status(200).json({ status: true, data: writeResult });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

export default router;
