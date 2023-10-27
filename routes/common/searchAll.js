import express from "express";
import mongoose from "mongoose";
import Store from "../../models/storeModel.js";
import Product from "../../models/productModel.js";

const router = express.Router();
async function searchAll(req, res) {
  const { q } = req.query;
  const { location } = req.params;
  const filterOpts = {
    status: true,
    active: true,
  };
  if (location) {
    filterOpts.location = new mongoose.Types.ObjectId(location);
  }
  if (req.query.active) {
    filterOpts.active = req.query.active;
  }
  if (req.query.status) {
    filterOpts.status = req.query.status;
  }
  try {
    let result = [];
    const store = Store.find({
      name: { $regex: q, $options: "i" },
      ...filterOpts,
    }).select("_id name ");
    const storeQuery = await store.exec();

    storeQuery.forEach((storeData) => {
      const storeObj = {
        _id: storeData._id,
        name: storeData.name,
        Type: "store",
      };

      result.push(storeObj);
    });
    const product = Product.find({
      name: { $regex: q, $options: "i" },
      ...filterOpts,
    }).select("_id name ");
    const productQuery = await product.exec();
    productQuery.forEach((productData) => {
      const storeObj = {
        _id: productData._id,
        name: productData.name,
        Type: "product",
      };

      result.push(storeObj);
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ status: false, error: err });
  }
}
export default router.get("/:location", searchAll);
