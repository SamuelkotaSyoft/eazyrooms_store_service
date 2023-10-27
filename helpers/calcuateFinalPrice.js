import taxModel from "../models/taxModel.js";
export async function calculateFinalPrice(requestData) {
  let initialPrice = requestData.initialPrice ?? 0;
  const value = requestData?.discount?.discountValue ?? 0;
  const tax = requestData?.tax ?? [];
  let taxValue = 0;
  let finalPrice = 0;
  if (tax?.length > 0) {
    const taxes = await taxModel.find({ _id: { $in: tax } });
    taxValue =
      taxes?.length > 0 &&
      taxes
        ?.map((item) => item.taxValue)
        .reduce((acc, tax) => {
          return acc + tax;
        });
  }
  if (requestData?.discount?.discountType?.toLowerCase() === "percentage") {
    let priceAfterDiscount = initialPrice - (initialPrice * value) / 100;
    let priceAfterDiscountAndTax = (priceAfterDiscount * taxValue) / 100;
    finalPrice = priceAfterDiscount + priceAfterDiscountAndTax;
  } else if (requestData?.discount?.discountType?.toLowerCase() === "flat") {
    if (initialPrice > value) {
      let priceAfterDiscount = initialPrice - value;
      let priceAfterDiscountAndTax = (priceAfterDiscount * taxValue) / 100;
      finalPrice = priceAfterDiscount + priceAfterDiscountAndTax;
    }
  } else {
    finalPrice = Number(
      parseInt(initialPrice) +
        (parseInt(initialPrice) * parseInt(taxValue)) / 100
    );
  }
  return parseFloat(finalPrice.toFixed(2)) ?? finalPrice;
}
