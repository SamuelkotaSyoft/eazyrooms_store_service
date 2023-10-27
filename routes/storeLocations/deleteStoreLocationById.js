import express from "express";
import verifyToken from "../../helpers/verifyToken.js";
var router = express.Router();

//import models
import StoreLocation from "../../models/storeLocationModel.js";
import notify from "../../helpers/notifications/notify.js";
import User from "../../models/userModel.js";

//new buyer
router.delete("/:storeLocationId", verifyToken, async function (req, res) {
  //request payload
  const storeLocationId = req.params.storeLocationId;
  const uid = req.user_info.main_uid;
  const user = await User.findOne({ uid: uid });

  //validate storeLocationId
  if (!storeLocationId) {
    res
      .status(400)
      .json({ status: false, error: "storeLocationId is required" });
    return;
  }

  try {
    //check if StoreCategory exists

    //delete StoreCategory
    const writeResult = await StoreLocation.findByIdAndUpdate(
      { _id: storeLocationId },
      { status: false }
    );

    try {
      await notify({
        userId: user._id,
        propertyId: user.property,
        location: [writeResult.location],
        stores: [writeResult._id],
        role: ["locationAdmin", "storeAdmin"],
        notificationText:
          user.fullName +
          " has deleted a new store Location named " +
          writeResult.name,
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
