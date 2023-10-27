import { query } from "express-validator";

const commonGetRequestValidationSchema = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page should be a number"),
  query("limit").optional().isNumeric().withMessage("limit should be a number"),
  query("status")
    .optional()
    .isBoolean()
    .withMessage("status should be a boolean"),
  query("active")
    .optional()
    .isBoolean()
    .withMessage("active should be a boolean"),
  query("q").optional().isString().withMessage("q should be a string"),
  query("price").optional().isString(),
  query("time").optional().optional(),
  query("pagination").optional().isBoolean(),
];

export { commonGetRequestValidationSchema };
