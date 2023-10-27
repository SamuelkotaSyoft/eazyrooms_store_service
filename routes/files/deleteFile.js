import express from "express";
const router = express.Router();
import verifyToken from "../../helpers/verifyToken.js";
import amenityModel from "../../models/amenityModel.js";
import roomTypeModel from "../../models/roomTypeModel.js";
import storeModel from "../../models/storeModel.js";
import productModel from "../../models/productModel.js";
import propertyModel from "../../models/propertyModel.js";
import { client } from "../../helpers/s3Client.js";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

const deleteFile = async (req, res) => {
  let { docId, collName } = req.body;
  collName = collName.toLowerCase();
  console.log({ docId, collName });
  if (!docId || !collName) {
    return res
      .status(400)
      .json({ status: false, error: [{ msg: "Invalid request" }] });
  }
  let response;
  if (collName === "amenity") {
    response = await amenityModel.findByIdAndUpdate(
      { _id: docId },
      { $set: { images: [] } }
    );
  } else if (collName === "property") {
    response = await propertyModel.findByIdAndUpdate(
      { _id: docId },
      { $set: { images: [] } }
    );
  } else if (collName === "roomtype") {
    response = await roomTypeModel.findByIdAndUpdate(
      { _id: docId },
      { $set: { images: [] } }
    );
  } else if (collName === "store") {
    response = await storeModel.findByIdAndUpdate(
      { _id: docId },
      { $set: { images: [] } }
    );
  } else if (collName === "product") {
    response = await productModel.findByIdAndUpdate(
      { _id: docId },
      { $set: { images: [] } }
    );
  }
  console.log({ response });
  console.log(process.env.S3_BUCKET);
  if (response?.images?.length > 0) {
    if (response?.images[0]?.includes("starting-content")) {
    } else {
      let fileKey = response.images[0]?.split("amazonaws.com/")[1];
      console.log({ fileKey });
      const deleteBucketParams = {
        Bucket: process.env.S3_BUCKET,
        Key: fileKey,
      };
      try {
        const data = await client.send(
          new DeleteObjectCommand(deleteBucketParams)
        );
        console.log("Success. Object deleted.", data);
      } catch (err) {
        console.log({ err });
      }
    }
  }
  res.status(200).json({
    status: true,
    data: response,
  });
};

router.post("/", verifyToken, deleteFile);
export default router;
