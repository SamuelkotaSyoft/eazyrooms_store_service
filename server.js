import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import "./models/guestModel.js";
import "./models/taxModel.js";
import "./firebase-config.js";

const app = express();
const port = 3003;

app.use(cors());
app.use(express.json());

/**
 *
 * dotenv config
 */
const __dirname = path.resolve();
dotenv.config({
  path: path.resolve(__dirname, ".env"),
});

/**
 *
 * connect to mongodb
 */
await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
console.log("MONGODB CONNECTED...");

/**
 *
 * store routes
 */
app.use(
  "/createStore",
  (await import("./routes/stores/createStore.js")).default
);
app.use(
  "/getAllStores",
  (await import("./routes/stores/getAllStores.js")).default
);
app.use(
  "/getStoreById",
  (await import("./routes/stores/getStoreById.js")).default
);
app.use(
  "/updateStoreById",
  (await import("./routes/stores/updateStoreById.js")).default
);
app.use(
  "/deleteStoreById",
  (await import("./routes/stores/deleteStoreById.js")).default
);
app.use(
  "/storeSearch",
  (await import("./routes/stores/searchStores.js")).default
);
/**
 *
 * store category routes
 */
app.use(
  "/createStoreCategory",
  (await import("./routes/storeCategories/createStoreCategory.js")).default
);
app.use(
  "/getAllStoreCategories",
  (await import("./routes/storeCategories/getAllStoreCategories.js")).default
);
app.use(
  "/getStoreCategoryById",
  (await import("./routes/storeCategories/getStoreCategoryById.js")).default
);
app.use(
  "/updateStoreCategoryById",
  (await import("./routes/storeCategories/updateStoreCategoryById.js")).default
);
app.use(
  "/deleteStoreCategoryById",
  (await import("./routes/storeCategories/deleteStoreCategoryById.js")).default
);

/**
 *
 * store locations routes
 */
app.use(
  "/createStoreLocation",
  (await import("./routes/storeLocations/createStoreLocation.js")).default
);
app.use(
  "/getAllStoreLocations",
  (await import("./routes/storeLocations/getAllStoreLocations.js")).default
);
app.use(
  "/getStoreLocationById",
  (await import("./routes/storeLocations/getStoreLocationById.js")).default
);
app.use(
  "/updateStoreLocationById",
  (await import("./routes/storeLocations/updateStoreLocationById.js")).default
);
app.use(
  "/deleteStoreLocationById",
  (await import("./routes/storeLocations/deleteStoreLocationById.js")).default
);

/**
 *
 * product routes
 */
app.use(
  "/createProduct",
  (await import("./routes/products/createProduct.js")).default
);
app.use(
  "/createAddOn",
  (await import("./routes/products/createAddOns.js")).default
);
app.use(
  "/createTags",
  (await import("./routes/products/createTags.js")).default
);
app.use(
  "/getAllProducts",
  (await import("./routes/products/getAllProducts.js")).default
);
app.use(
  "/getAllProductFilters",
  (await import("./routes/products/getAllProductFilters.js")).default
);
app.use(
  "/getProductById",
  (await import("./routes/products/getProductById.js")).default
);
app.use(
  "/updateProductById",
  (await import("./routes/products/updateProductById.js")).default
);
app.use(
  "/deleteProductById",
  (await import("./routes/products/deleteProductById.js")).default
);

/**
 * cart routes
 */

app.use("/searchAll", (await import("./routes/common/searchAll.js")).default);
app.use(
  "/createCart",
  (await import("./routes/carts/createCartItems.js")).default
);
app.use(
  "/getCartItems",
  (await import("./routes/carts/getAllCartItems.js")).default
);
app.use(
  "/updateCartItemsByProductId",
  (await import("./routes/carts/updateCartItemsByProductId.js")).default
);
//TODO change to file service
app.use("/deleteFile", (await import("./routes/files/deleteFile.js")).default);
/**
 *
 * start listening to requests
 */
app.listen(port, () => {
  console.log(`Store service listening on port ${port}`);
});

app.get("/", (req, res) => {
  res.status(200).json({ status: "OK", service: "Store Service" });
});
