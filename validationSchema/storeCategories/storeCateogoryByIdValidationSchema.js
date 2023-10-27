import { query } from "express-validator";

const getStoreCategoryValidationByIdSchema = [
  query("storeId")
    .notEmpty()
    .custom((storeId) => mongoose.Types.ObjectId.isValid(storeId))
    .withMessage("StoreId is required"),
];
export { getStoreCategoryValidationByIdSchema };
