import express from "express";
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  getOrderStats,
  getMyOrders,
} from "../controllers/orderController";
import { protect, adminOnly } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", protect, createOrder);          // ← now requires login
router.get("/my-orders", protect, getMyOrders);  // ← customer's own orders
router.get("/", protect, adminOnly, getOrders);
router.get("/stats", protect, adminOnly, getOrderStats);
router.get("/:id", protect, getOrder);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

export default router;