import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Order from "../models/Order";
import Product from "../models/Product";
import { sendOrderConfirmationEmail } from "../utils/emailService";

// @desc    Create order
// @route   POST /api/orders
// @access  Public
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const {
    customerName,
    email,
    phone,
    address,
    city,
    governorate,
    postalCode,
    products,
    paymentMethod,
    notes,
  } = req.body;

  if (!customerName || !email || !phone || !address || !city || !governorate || !products) {
    res.status(400).json({ success: false, message: "Please provide all required fields" });
    return;
  }

  if (!products || products.length === 0) {
    res.status(400).json({ success: false, message: "Order must have at least one product" });
    return;
  }

  // Calculate total price
  let totalPrice = 0;
  const shippingPrice = 50;

  for (const item of products) {
    const product = await Product.findById(item.productId);
    if (!product) {
      res.status(404).json({
        success: false,
        message: `Product ${item.productId} not found`,
      });
      return;
    }
    if (product.stock < item.quantity) {
      res.status(400).json({
        success: false,
        message: `Insufficient stock for ${product.name}`,
      });
      return;
    }
    totalPrice += product.price * item.quantity;
  }

  const order = await Order.create({
    customerName,
    email,
    phone,
    address,
    city,
    governorate,
    postalCode: postalCode || "",
    products,
    totalPrice,
    shippingPrice,
    paymentMethod: paymentMethod || "cash_on_delivery",
    notes: notes || "",
    status: "pending",
  });

  // Update stock
  for (const item of products) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: -item.quantity },
    });
  }

  // Send confirmation email
  try {
    await sendOrderConfirmationEmail(email, {
      orderNumber: order.orderNumber,
      customerName,
      products: products.map((item: { name: string; quantity: number; size: string; price: number }) => ({
        name: item.name,
        quantity: item.quantity,
        size: item.size,
        price: item.price,
      })),
      totalPrice,
      shippingPrice,
      address,
      city,
    });
  } catch (err) {
    console.error("Failed to send order confirmation email:", err);
    // Don't fail the order if email fails
  }

  res.status(201).json({
    success: true,
    message: "Order placed successfully!",
    order,
  });
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const { status, page = 1, limit = 20 } = req.query;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};
  if (status) query.status = status;

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    totalPages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    orders,
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private/Admin
export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404).json({ success: false, message: "Order not found" });
    return;
  }

  res.status(200).json({ success: true, order });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!order) {
    res.status(404).json({ success: false, message: "Order not found" });
    return;
  }

  res.status(200).json({ success: true, order });
});

// @desc    Get order stats
// @route   GET /api/orders/stats
// @access  Private/Admin
export const getOrderStats = asyncHandler(async (req: Request, res: Response) => {
  const totalOrders = await Order.countDocuments();
  const pendingOrders = await Order.countDocuments({ status: "pending" });
  const deliveredOrders = await Order.countDocuments({ status: "delivered" });

  const revenueData = await Order.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } },
  ]);

  const totalRevenue = revenueData[0]?.totalRevenue || 0;

  res.status(200).json({
    success: true,
    stats: {
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalRevenue,
    },
  });
});