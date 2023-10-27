import Product from "../../models/productModel.js";

export async function createAddOn({
  parsedAddOns,
  requestData,
  writeResult,
  user,
  res,
}) {
  try {
    if (parsedAddOns) {
      const addOns = parsedAddOns?.map((item) => {
        if (!item.name || item.name === "") {
          return;
        }
        return item.name;
      });

      const uniqueSet = new Set(addOns);
      if (uniqueSet.size !== addOns.length) {
        res.status(400).json({
          status: false,
          error: [{ msg: "AddOns name should be unique" }],
        });
      }
      const price = parsedAddOns?.map((item) => {
        if (!item.price || item.price === "") {
          return;
        }
        return item.price;
      });
      const addOnExists = await Product.find({
        name: { $in: addOns },
        finalPrice: { $in: price },
        store: requestData.store,
        isAddOn: true,
      });
      const existingAddOnsName = addOnExists.map((item) => item.name);
      if (existingAddOnsName.length > 0) {
        const addOnsObjectId = addOnExists.map((item) => item._id);
        await Product.findByIdAndUpdate(
          { _id: writeResult._id },
          { $set: { addOns: addOnsObjectId } }
        );
      }
      parsedAddOns
        .filter((addOn) => !existingAddOnsName.includes(addOn?.name))
        ?.forEach(async (addOnItem) => {
          if (addOnItem.name === "") {
            return;
          }
          const addOnProduct = new Product({
            ...addOnItem,
            name: addOnItem.name,
            addOns: [],
            tag: [],
            createdBy: user._id,
            updatedBy: user._id,
            store: requestData.store,
            location: requestData.location,
            property: user.property,
            status: true,
            active: true,
            active: true,
            initialPrice: addOnItem.price,
            finalPrice: addOnItem.price,
            isAddOn: true,
            addOnFor: writeResult._id,
          });
          const addOnWriteResult = await addOnProduct.save();
          await Product.findByIdAndUpdate(
            { _id: writeResult._id },
            { $set: { addOns: addOnWriteResult._id } }
          );
        });
    }
  } catch (err) {}
}
