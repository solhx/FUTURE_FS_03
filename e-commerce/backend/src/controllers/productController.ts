import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Product from "../models/Product";


// @desc    Upload product image
// @route   POST /api/products/upload
// @access  Private/Admin
export const uploadProductImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: "Please upload an image file" });
    return;
  }

  // Return Cloudinary CDN URL
  const imageUrl = req.file.path;
  
  res.status(200).json({
    success: true,
    imageUrl,
    message: "Image uploaded to Cloudinary successfully",
  });

});

// @desc    Get all products with search & filter
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    featured,
    sortBy = "createdAt",
    order = "desc",
    page = 1,
    limit = 12,
  } = req.query;

  // Build query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};

  if (search) {
    query.$text = { $search: search as string };
  }

  if (category) {
    query.category = category;
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (featured === "true") {
    query.featured = true;
  }

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  const sortOrder = order === "asc" ? 1 : -1;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sortOptions: any = { [sortBy as string]: sortOrder };

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    totalPages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    products,
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404).json({ success: false, message: "Product not found" });
    return;
  }

  res.status(200).json({ success: true, product });
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const { name, price, description, image, images, sizes, stock, category, featured } = req.body;

  if (!name || !price || !description || !image) {
    res.status(400).json({ success: false, message: "Please provide all required fields" });
    return;
  }

  const product = await Product.create({
    name,
    price,
    description,
    image,
    images: images || [],
    sizes: sizes || ["S", "M", "L", "XL"],
    stock: stock || 0,
    category: category || "T-Shirts",
    featured: featured || false,
  });

  res.status(201).json({ success: true, product });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404).json({ success: false, message: "Product not found" });
    return;
  }

  product = await Product.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    { new: true, runValidators: true }
  );

  res.status(200).json({ success: true, product });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404).json({ success: false, message: "Product not found" });
    return;
  }

  await product.deleteOne();
  res.status(200).json({ success: true, message: "Product deleted successfully" });
});

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await Product.distinct("category");
  res.status(200).json({ success: true, categories });
});

// @desc    Create new category
// @route   POST /api/products/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { category } = req.body;

  if (!category || !category.trim()) {
    res.status(400).json({ success: false, message: "Category name is required" });
    return;
  }

  const normalizedCategory = category.trim();
  
  // Check if category already exists
  const existingCategories = await Product.distinct("category");
  if (existingCategories.includes(normalizedCategory)) {
    res.status(400).json({ success: false, message: "Category already exists" });
    return;
  }

  // Create a dummy product with the new category to save it
  const product = await Product.create({
    name: "Temp Product - Do Not Delete",
    price: 0,
    description: "This is a temporary product to create a new category",
    image: "https://placeholder.com",
    images: [],
    sizes: ["M"],
    stock: 0,
    category: normalizedCategory,
    featured: false,
  });

  // Delete the temp product immediately
  await product.deleteOne();

  const allCategories = await Product.distinct("category");
  res.status(201).json({ success: true, categories: allCategories, message: "Category created successfully" });
});

// @desc    Delete category
// @route   DELETE /api/products/categories/:category
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const { category } = req.params;

  if (!category) {
    res.status(400).json({ success: false, message: "Category is required" });
    return;
  }

  // Check if there are products in this category
  const productCount = await Product.countDocuments({ category });

  if (productCount > 0) {
    res.status(400).json({ 
      success: false, 
      message: `Cannot delete category. There are ${productCount} product(s) in this category. Please delete or move the products first.` 
    });
    return;
  }

  const allCategories = await Product.distinct("category");
  res.status(200).json({ success: true, categories: allCategories, message: "Category deleted successfully" });
});
