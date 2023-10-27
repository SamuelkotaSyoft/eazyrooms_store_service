import express from "express";
import verifyToken from "../../helpers/verifyToken.js";
var router = express.Router();

//import models
import Product from "../../models/productModel.js";
import User from "../../models/userModel.js";
import notify from "../../helpers/notifications/notify.js";

//new buyer
router.delete("/:productId", verifyToken, async function (req, res) {
  //request payload
  const productId = req.params.productId;

  const role = req.user_info.role;
  const uid = req.user_info.main_uid;

  //validate productId
  if (!productId) {
    res.status(400).json({ status: false, error: "productId is required" });
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
    const user = await User.findOne({ uid: uid });
    if (!user) {
      res.status(400).json({ status: false, error: "Invalid userId" });
      return;
    }
    //check if product exists
    const product = Product.findById(productId);
    if (!product) {
      res.status(400).json({ status: false, error: "Invalid product" });
      return;
    }

    //delete product
    const writeResult = await Product.findByIdAndUpdate(
      { _id: productId },
      { status: false, updatedBy: user._id }
    );

    try {
      await notify({
        userId: user._id,
        propertyId: user.property,
        location: [writeResult.location],
        stores: [writeResult.store],
        role: ["locationAdmin", "storeAdmin"],
        notificationText:
          user.fullName + " has deleted a product named " + writeResult.name,
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
