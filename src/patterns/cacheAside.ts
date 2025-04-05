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

export const cacheAside = async (req: Request, res: Response): Promise<any> => {
  try {
    const product = await ProductModel.create(req.body);
    return res.status(201).json(product);
  } catch {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /cache-aside:
 *   post:
 *     summary: Create a new product
 *     description: Create a new product and store it in the database (write-through/write-back/caching strategy can be applied separately).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the product.
 *                 example: "Wireless Mouse"
 *               description:
 *                 type: string
 *                 description: A short description of the product.
 *                 example: "A high-quality wireless mouse"
 *     responses:
 *       201:
 *         description: Product created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Unique identifier of the created product.
 *                 name:
 *                   type: string
 *                   description: Name of the product.
 *                 description:
 *                   type: string
 *                   description: Product description.
 *       500:
 *         description: Internal server error, something went wrong while creating the product.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 */
