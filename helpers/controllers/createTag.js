import mongoose from "mongoose";
import productModel from "../../models/productModel.js";
import productTagModel from "../../models/productTagModel.js";

export default async function createTag({ requestData, writeResult, user }) {
  if (requestData?.tagIds?.length > 0) {
    const tagObjectId = requestData?.tagIds;
    const productData = await productModel.findByIdAndUpdate(
      { _id: writeResult._id },
      {
        tag: tagObjectId,
      },
      { new: true }
    );
  }
  if (requestData?.tags?.length > 0)
    await requestData?.tags?.forEach(async (tag) => {
      const tags = await productTagModel.find({
        name: tag,
        store: requestData.store,
      });
      if (tags) {
        const tagObjectId = tags.map((tag) => tag._id);
        const updateTag = productTagModel.updateMany(
          { _id: { $in: tagObjectId } },
          { $push: { products: writeResult._id } },
          {
            new: true,
          }
        );
        const tagWrite = await updateTag.exec();
      } else {
        const tagData = new productTagModel({
          name: tag,
          store: requestData.store,
          products: [writeResult._id],
          createdBy: user._id,
          updatedBy: user._id,
          property: user.property,
          status: true,
          active: true,
        });
        const tagWrite = await tagData.save();
      }
    });
}
