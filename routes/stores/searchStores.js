import express from "express";
import mongoose from "mongoose";
import Store from "../../models/storeModel.js";

const router = express.Router();
async function searchStore(req, res) {
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
    const query = Store.find({
      name: { $regex: q, $options: "i" },
      ...filterOpts,
    });
    const queryResult = await query.exec();
    res.status(200).json({ status: true, data: queryResult });
  } catch (err) {
    res.status(500).json({ status: false, error: err });
  }
}
export default router.get("/:location", searchStore);
