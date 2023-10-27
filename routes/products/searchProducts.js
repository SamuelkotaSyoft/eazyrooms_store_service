import express from "express";
import Product from "../../models/productModel.js";
import mongoose from "mongoose";

const router = express.Router();
async function searchProducts(req, res) {
  const { q } = req.query;
  const { store } = req.params;
  const filterOpts = {
    status: true,
    active: true,
  };
  if (store) {
    filterOpts.store = new mongoose.Types.ObjectId(store);
  }
  if (req.query.active) {
    filterOpts.active = req.query.active;
  }
  if (req.query.status) {
    filterOpts.status = req.query.status;
  }
  try {
    const query = Product.find({
      name: { $regex: q, $options: "i" },

      ...filterOpts,
    }).populate("tag addOns");
    const queryResult = await query.exec();
    res.status(200).json({ status: true, data: queryResult });
  } catch (err) {
    res.status(500).json({ status: false, error: err });
  }
}
export default router.get("/:store", searchProducts);
