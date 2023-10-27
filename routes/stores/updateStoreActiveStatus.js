import express from "express";
import verifyToken from "../../helpers/verifyToken.js";

var router = express.Router();
//

//import models
import Store from "../../models/storeModel.js";
import User from "../../models/userModel.js";

//new buyer
router.patch("/", verifyToken, async function (req, res) {
  console.log(req.body);
  //request payload
  // const userId = req.auth.userId;
  const uid = req.user_info.main_uid;
  const storeId = req.body.storeId;
  const active = req.body.active;

  const role = req.user_info.role;

  //validate userId
  if (!uid) {
    res.status(400).json({ status: false, error: "uid is required" });
    return;
  }

  //validate quantity
  if (!storeId) {
    res.status(400).json({ status: false, error: "storeId is required" });
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
      res.status(400).json({ status: false, error: "Invalid uid" });
      return;
    }

    //check if store exists
    const store = await Store.findById(storeId);
    if (!store) {
      res.status(400).json({ status: false, error: "Invalid store" });
    }

    //disable all other stores if a store is being activated
    if (active == true) {
      const disableResult = await Store.updateMany(
        { user: user._id },
        {
          $set: {
            active: false,
          },
        },
        { new: true }
      );
    }

    //update store
    const writeResult = await Store.updateOne(
      { _id: storeId },
      {
        $set: {
          active: active,
        },
      },
      { new: true }
    );

    res.status(200).json({ status: true, data: writeResult });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

export default router;
