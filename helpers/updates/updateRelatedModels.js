import productModel from "../../models/productModel.js";

function updateRelatedModels(matchingData, updatingContent, parentModel) {
  let updatingObj = {
    status: updatingContent.status,
    active: updatingContent.active,
  };
  /**
   * if true ignore because it will update all the inactive models as well of dependent models
   */
  if (updatingObj?.status) {
    delete updatingObj?.status;
  }
  /**
   * if true ignore because it will update all the inactive models as well of dependent models
   */
  if (updatingObj?.active) {
    delete updatingObj?.active;
  }
  /**
   * checks with the parent model and updates the related models
   * we don't need the if conditions over here since the filter will take care of it
   * ie the lower levels will only always match the filter and update the models
   * for the sake of understanding i have added the if conditions
   */
  return new Promise(async (resolve, reject) => {
    try {
      if (parentModel === "storeCategory") {
        const sdata = await productModel.updateMany(
          matchingData,
          updatingContent
        );
      }
      resolve({ status: true });
    } catch (err) {
      reject({ status: false, error: `Error updating ${updatingContent}` });
    }
  });
}
export default updateRelatedModels;
