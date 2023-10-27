async function calculateCartTotal(writableResult) {
  let productTotal = 0;
  let addOnTotal = 0;
  let discountedPrice = 0; //calculate price
  let taxAmount = 0;
  let discountingPrice = 0;

  await writableResult?.products.forEach((product) => {
    const initialPrice = product.product.initialPrice;
    const quantity = product.quantity;
    const discountValue = product.product.discount.discountValue;
    if (product.product.discount.discountType === "flat") {
      discountingPrice += discountValue * quantity;
      let tax = 0;
      console.log(product.product?.tax.length);
      if (product.product?.tax?.length > 0) {
        tax = product.product.tax
          ?.map((taxItex) => taxItex.taxValue)
          ?.reduce((acc, tax) => acc + tax);
        taxAmount +=
          Number(
            Number(tax) * ((Number(initialPrice) - Number(discountValue)) / 100)
          ) * quantity;
      }
    } else if (product.product.discount.discountType === "percentage") {
      discountingPrice += (initialPrice * discountValue) / 100;
      let tax = 0;
      console.log(product.product?.tax.length);
      if (product.product?.tax?.length > 0) {
        tax = product.product.tax
          ?.map((taxItex) => taxItex.taxValue)
          ?.reduce((acc, tax) => acc + tax);
        taxAmount +=
          Number(
            Number(tax) *
              ((Number(initialPrice) -
                Number((initialPrice * discountValue) / 100)) /
                100)
          ) * quantity;
      }
    } else {
      discountingPrice += 0;
      let tax = 0;
      console.log(product.product?.tax.length);
      if (product.product?.tax?.length > 0) {
        tax = product.product.tax
          ?.map((taxItex) => taxItex.taxValue)
          ?.reduce((acc, tax) => acc + tax);
        taxAmount +=
          Number(Number(tax) * (Number(initialPrice) / 100)) * quantity;
      }
    }

    discountedPrice += product.product.finalPrice * product.quantity;
    productTotal += product.product.initialPrice * product.quantity;
    product.addOns.forEach((addOn) => {
      discountedPrice += addOn.addOn.finalPrice * addOn.quantity;
      addOnTotal += addOn.addOn.initialPrice * addOn.quantity;
    });
  });
  addOnTotal = parseFloat(addOnTotal.toFixed(2));
  productTotal = parseFloat(productTotal.toFixed(2));
  discountedPrice = parseFloat(discountedPrice.toFixed(2));
  taxAmount = parseFloat(taxAmount.toFixed(2));
  discountingPrice = parseFloat(discountingPrice.toFixed(2));
  return {
    addOnTotal,
    productTotal,
    discountedPrice,
    taxAmount,
    discountingPrice,
  };
}
export { calculateCartTotal };

//TODO replicate this everywhere
