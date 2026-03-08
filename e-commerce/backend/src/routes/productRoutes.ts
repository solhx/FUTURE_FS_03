import express from "express";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} from "../controllers/productController";
import { protect, adminOnly } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/categories", getCategories);
router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;