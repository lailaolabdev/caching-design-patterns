import ProductModel from "../productModel";
import redisClient from "../redisClient";
import { Request, Response } from "express";

export const writeThrough = async (req: Request, res: Response): Promise<any> => {
  try {
    const product = await ProductModel.create(req.body);

    const cacheKey = `products`;

    const cachedProduct = await redisClient.get(cacheKey);
    const products = cachedProduct ? JSON.parse(cachedProduct) : [];
    products.push(product);

    await redisClient.set(cacheKey, JSON.stringify(products));

    return res.status(201).json(product);
  } catch {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /write-through:
 *   post:
 *     summary: Create a new product and update cache using Write-Through pattern
 *     description: This endpoint creates a new product and updates the cache immediately.
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
 *         description: Product successfully created and cached.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The product ID.
 *                 name:
 *                   type: string
 *                   description: The name of the product.
 *                 description:
 *                   type: string
 *                   description: A brief description of the product.
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
