import express from "express";
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  getOrderStats,
} from "../controllers/orderController";
import { protect, adminOnly } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", createOrder);
router.get("/", protect, adminOnly, getOrders);
router.get("/stats", protect, adminOnly, getOrderStats);
router.get("/:id", protect, adminOnly, getOrder);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

export default router;