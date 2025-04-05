import mongoose from "mongoose";
import ProductModel from "../productModel";
import redisClient from "../redisClient";
import { Request, Response } from "express";

export const writeBack = async (req: Request, res: Response): Promise<any> => {
  try {
    const cacheKey = `products`;
    const syncKey = `products:sync`;

    const generatedId = new mongoose.Types.ObjectId();
    req.body._id = generatedId;

    const cachedProduct = await redisClient.get(cacheKey);
    const products = cachedProduct ? JSON.parse(cachedProduct) : [];
    products.push(req.body);

    await redisClient.set(cacheKey, JSON.stringify(products));

    // Set a sync flag
    const syncProducts = await redisClient.get(syncKey);
    const syncProductsArray = syncProducts ? JSON.parse(syncProducts) : [];
    syncProductsArray.push(req.body);
    await redisClient.set(syncKey, JSON.stringify(syncProductsArray));

    return res.status(201).json(req.body);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const syncCacheToDB = async () => {
  try {
    const syncKey = `products:sync`;
    const syncProducts = await redisClient.get(syncKey);
    const syncProductsArray = syncProducts ? JSON.parse(syncProducts) : [];
    if (syncProductsArray.length > 0) {
      const products = syncProductsArray;
      await ProductModel.insertMany(products);
      await redisClient.del(syncKey);
      console.log("✅ Sync cache to DB");
    }
  } catch (error) {
    console.log("❌ Sync cache to DB");
  }
};

/**
 * @swagger
 * /write-back:
 *   post:
 *     summary: Add a product to the cache and mark it for database synchronization using Write-Back pattern
 *     description: This endpoint adds a new product to the cache immediately and flags it for future database synchronization.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the product.
 *               description:
 *                 type: string
 *                 description: A brief description of the product.
 *     responses:
 *       201:
 *         description: Product successfully added to cache and marked for synchronization with the database.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: The name of the product.
 *                 description:
 *                   type: string
 *                   description: A brief description of the product.
 *       500:
 *         description: Internal server error, something went wrong while adding the product to the cache or database.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 */
