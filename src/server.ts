import express from "express";
import mongoose from "mongoose";
import swaggerJs from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import cron from "node-cron";
import { getProducts } from "./patterns/cacheAside";
import swaggerDoc from "./swagger";
import { writeThrough } from "./patterns/writeThrough";
import { syncCacheToDB, writeBack } from "./patterns/writeBack";

const app = express();
app.use(express.json());

//connect to mongodb
mongoose
  .connect(
    "mongodb+srv://jubmuedev:oALy4L3HRpUMMbjI@cluster0.ffitseg.mongodb.net/caching-design-pattern?retryWrites=true&w=majority"
  )
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.log(err));

const swaggerDocs = swaggerJs(swaggerDoc);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Route
app.get("/products", getProducts);
app.post("/write-through", writeThrough);
app.post("/write-back", writeBack);

cron.schedule("* * * * *", async () => {
  console.log("Running a task every minute");
  syncCacheToDB();
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
  console.log("Swagger docs are running on http://localhost:3000/api-docs");
});
