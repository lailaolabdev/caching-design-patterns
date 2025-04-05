import { Request, Response } from "express";
import redisClient from "../redisClient";
import ProductModel from "../productModel";

//cache aside pattern
export const getProducts = async (req: Request, res: Response): Promise<any> => {
  try {
    const cacheKey = "products";

    //step1: check data in cache
    const cachedProducts = await redisClient.get(cacheKey);
    if (cachedProducts) {
      console.log("Data found in cache");
      //step2: if data in cache, return data
      return res.json(JSON.parse(cachedProducts));
    }
    //step3: if data not in cache, fetch data from database
    const products = await ProductModel.find();

    //step4: set data to cache
    await redisClient.setex(cacheKey, 60, JSON.stringify(products));
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get products with Cache Aside pattern
 *     description: Retrieve the list of products from the cache if available, or fetch from the database if not.
 *     responses:
 *       200:
 *         description: List of products successfully retrieved from cache or database.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The product ID.
 *                   name:
 *                     type: string
 *                     description: The name of the product.
 *                   price:
 *                     type: number
 *                     description: The price of the product.
 *                   description:
 *                     type: string
 *                     description: A brief description of the product.
 *       500:
 *         description: Internal server error, something went wrong while fetching data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 *       404:
 *         description: Products not found if the database is empty (if applicable).
 */
