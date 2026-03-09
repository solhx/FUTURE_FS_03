import express from "express";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  uploadProductImage,
  createCategory,
  deleteCategory,
} from "../controllers/productController";
import { protect, adminOnly } from "../middleware/authMiddleware";
import upload from "../utils/multer";

const router = express.Router();

router.get("/categories", getCategories);
router.post("/categories", protect, adminOnly, createCategory);
router.delete("/categories/:category", protect, adminOnly, deleteCategory);
router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/upload", protect, adminOnly, upload.single("image"), uploadProductImage);
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;
