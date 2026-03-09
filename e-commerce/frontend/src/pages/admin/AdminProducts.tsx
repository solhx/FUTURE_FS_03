import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Package,
  ChevronRight,
  Search,
  AlertTriangle,
  FolderPlus,
  Folder,
} from "lucide-react";
import { productService } from "../../services/productService";
import { Product, ProductFormData } from "../../types";
import LoadingSpinner from "../../components/LoadingSpinner";
import toast from "react-hot-toast";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const emptyForm: ProductFormData = {
  name: "",
  price: 0,
  description: "",
  image: "",
  images: [],
  sizes: ["S", "M", "L", "XL"],
  stock: 0,
  category: "T-Shirts",
  featured: false,
};

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["T-Shirts", "Hoodies", "Joggers", "Jackets", "Sets", "Accessories"]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<ProductFormData>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [additionalImageUrls, setAdditionalImageUrls] = useState<string[]>([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
  const [customSizeInput, setCustomSizeInput] = useState("");


  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts({
        search: search || undefined,
        limit: 50,
      });
      setProducts(data.products);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [search]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await productService.getCategories();
      if (data.success && data.categories.length > 0) {
        setCategories(data.categories);
      }
    } catch {
      // Keep default categories on error
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Category name is required");
      return;
    }
    setCategoryLoading(true);
    try {
      const result = await productService.createCategory(newCategoryName.trim());
      if (result.success) {
        setCategories(result.categories);
        toast.success(result.message);
        setNewCategoryName("");
        setShowCategoryModal(false);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to create category");
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (category: string) => {
    if (!confirm(`Are you sure you want to delete the category "${category}"?`)) {
      return;
    }
    setCategoryLoading(true);
    try {
      const result = await productService.deleteCategory(category);
      if (result.success) {
        setCategories(result.categories);
        // Update form category if the deleted one was selected
        if (form.category === category) {
          setForm((p) => ({ ...p, category: result.categories[0] || "" }));
        }
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setCategoryLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setFormErrors({});
    setPreviewUrl(null);
    setAdditionalImageUrls([]);
    setAdditionalImagePreviews([]);
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      price: product.price,
      description: product.description,
      image: product.image,
      images: product.images || [],
      sizes: product.sizes,
      stock: product.stock,
      category: product.category,
      featured: product.featured,
    });
    // Load existing additional images
    setAdditionalImageUrls(product.images || []);
    setAdditionalImagePreviews(product.images || []);
    setFormErrors({});
    setPreviewUrl(null);
    setShowModal(true);
  };

  const openDeleteModal = (product: Product) => {
    setDeletingProduct(product);
    setShowDeleteModal(true);
  };

  const validateForm = (): boolean => {
    const errors: Partial<ProductFormData> = {};
    if (!form.name.trim()) errors.name = "Name is required" as never;
    if (!form.price || form.price <= 0) errors.price = "Valid price required" as never;
    if (!form.description.trim()) errors.description = "Description is required" as never;
    if (!form.image.trim()) errors.image = "Image URL is required" as never;
    if (form.sizes.length === 0) errors.sizes = "Select at least one size" as never;
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    
    // Include additional images in form data
    const formData = {
      ...form,
      images: additionalImageUrls,
    };
    
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, formData);
        toast.success("Product updated successfully!");
      } else {
        await productService.createProduct(formData);
        toast.success("Product created successfully!");
      }
      setShowModal(false);
      fetchProducts();
    } catch {
      toast.error("Failed to save product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    setSaving(true);
    try {
      await productService.deleteProduct(deletingProduct._id);
      toast.success("Product deleted successfully!");
      setShowDeleteModal(false);
      setDeletingProduct(null);
      fetchProducts();
    } catch {
      toast.error("Failed to delete product.");
    } finally {
      setSaving(false);
    }
  };

  const toggleSize = (size: string) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleAddCustomSize = () => {
    const size = customSizeInput.trim();
    if (!size) {
      toast.error("Please enter a size number");
      return;
    }
    
    // Check if size already exists
    if (form.sizes.includes(size)) {
      toast.error("This size already exists");
      setCustomSizeInput("");
      return;
    }
    
    setForm((prev) => ({
      ...prev,
      sizes: [...prev.sizes, size],
    }));
    setCustomSizeInput("");
    toast.success(`Size ${size} added!`);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Create preview URL
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    setUploading(true);
    try {
      const result = await productService.uploadImage(file);
      if (result.success) {
        setForm((prev) => ({ ...prev, image: result.imageUrl }));
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(result.message || "Failed to upload image");
        setPreviewUrl(null);
      }
    } catch {
      toast.error("Failed to upload image. Please try again.");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Create preview URL
    const preview = URL.createObjectURL(file);
    
    setUploading(true);
    try {
      const result = await productService.uploadImage(file);
      if (result.success) {
        setAdditionalImageUrls((prev) => [...prev, result.imageUrl]);
        setAdditionalImagePreviews((prev) => [...prev, preview]);
        toast.success("Additional image uploaded successfully!");
      } else {
        toast.error(result.message || "Failed to upload image");
        URL.revokeObjectURL(preview);
      }
    } catch {
      toast.error("Failed to upload image. Please try again.");
      URL.revokeObjectURL(preview);
    } finally {
      setUploading(false);
      // Reset the input
      e.target.value = "";
    }
  };

  const handleRemoveAdditionalImage = (index: number) => {
    const urlToRemove = additionalImageUrls[index];
    const previewToRevoke = additionalImagePreviews[index];
    
    setAdditionalImageUrls((prev) => prev.filter((_, i) => i !== index));
    setAdditionalImagePreviews((prev) => prev.filter((_, i) => i !== index));
    
    // Revoke the preview URL to avoid memory leaks
    URL.revokeObjectURL(previewToRevoke);
    
    // Update form.images
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img !== urlToRemove),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-dark-400 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="flex flex-col leading-none">
              <span className="text-white font-bold text-lg tracking-[0.25em]">URBAN</span>
              <span className="text-primary-500 text-[9px] tracking-[0.5em] -mt-0.5">NILE</span>
            </Link>
            <div className="w-px h-6 bg-white/20" />
            <div className="flex items-center gap-1 text-gray-400 text-xs">
              <Link to="/admin" className="hover:text-white transition-colors">Dashboard</Link>
              <ChevronRight size={12} />
              <span className="text-white font-semibold">Products</span>
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-primary-500 text-dark-400 px-4 py-2 text-xs font-bold tracking-wider uppercase hover:bg-primary-400 transition-colors"
          >
            <Plus size={15} />
            Add Product
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-dark-400">Products</h1>
            <p className="text-gray-500 text-sm">{products.length} products total</p>
          </div>
          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="pl-9 pr-4 py-2.5 border-2 border-gray-200 text-sm focus:outline-none focus:border-dark-400 transition-colors w-full sm:w-64"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <LoadingSpinner size="md" />
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white border border-gray-100 py-20 text-center">
            <Package size={48} className="text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-dark-400 mb-2">No products found</h3>
            <p className="text-gray-500 text-sm mb-6">
              {search ? "Try a different search term" : "Start by adding your first product"}
            </p>
            {!search && (
              <button
                onClick={openCreateModal}
                className="bg-dark-400 text-white px-8 py-3 text-sm font-bold tracking-widest uppercase hover:bg-primary-500 transition-colors"
              >
                Add First Product
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["Product", "Category", "Price", "Stock", "Sizes", "Featured", "Actions"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-left text-xs font-bold text-gray-500 tracking-widest uppercase whitespace-nowrap"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-14 object-cover flex-shrink-0"
                          />
                          <div>
                            <p className="font-bold text-dark-400 text-xs leading-tight max-w-[160px] truncate">
                              {product.name}
                            </p>
                            <p className="text-gray-400 text-[11px] mt-0.5 max-w-[160px] truncate">
                              {product.description.substring(0, 50)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 font-medium">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-dark-400 text-xs">
                        EGP {product.price.toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs font-bold px-2 py-1 ${
                            product.stock === 0
                              ? "bg-red-100 text-red-600"
                              : product.stock < 10
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {product.stock === 0 ? "Out of Stock" : `${product.stock} left`}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1 flex-wrap max-w-[100px]">
                          {product.sizes.map((s) => (
                            <span
                              key={s}
                              className="text-[10px] border border-gray-200 px-1.5 py-0.5 text-gray-500"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-[11px] font-bold px-2 py-1 ${
                            product.featured
                              ? "bg-primary-100 text-primary-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {product.featured ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2 text-blue-500 hover:bg-blue-50 transition-colors rounded"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(product)}
                            className="p-2 text-red-400 hover:bg-red-50 transition-colors rounded"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Product Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl my-8 shadow-2xl animate-slide-up">
            {/* Modal Header */}
            <div className="bg-dark-400 px-6 py-4 flex items-center justify-between">
              <h2 className="text-white font-bold tracking-wider text-sm uppercase">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-dark-400 tracking-widest uppercase mb-2">
                  Product Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Pharaoh Street Tee"
                  className={`w-full border-2 px-4 py-3 text-sm focus:outline-none transition-colors ${
                    formErrors.name ? "border-red-400" : "border-gray-200 focus:border-dark-400"
                  }`}
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{String(formErrors.name)}</p>
                )}
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-dark-400 tracking-widest uppercase mb-2">
                    Price (EGP) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
                    min={0}
                    placeholder="349"
                    className={`w-full border-2 px-4 py-3 text-sm focus:outline-none transition-colors ${
                      formErrors.price ? "border-red-400" : "border-gray-200 focus:border-dark-400"
                    }`}
                  />
                  {formErrors.price && (
                    <p className="text-red-500 text-xs mt-1">{String(formErrors.price)}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-dark-400 tracking-widest uppercase mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm((p) => ({ ...p, stock: Number(e.target.value) }))}
                    min={0}
                    placeholder="50"
                    className="w-full border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-dark-400 transition-colors"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-dark-400 tracking-widest uppercase">
                    Category
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(true)}
                    className="text-xs text-primary-500 hover:text-primary-600 font-bold flex items-center gap-1"
                  >
                    <FolderPlus size={14} />
                    Manage Categories
                  </button>
                </div>
                <select
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-dark-400 transition-colors bg-white cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-dark-400 tracking-widest uppercase mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={4}
                  placeholder="A premium cotton oversized tee..."
                  className={`w-full border-2 px-4 py-3 text-sm focus:outline-none transition-colors resize-none ${
                    formErrors.description
                      ? "border-red-400"
                      : "border-gray-200 focus:border-dark-400"
                  }`}
                />
                {formErrors.description && (
                  <p className="text-red-500 text-xs mt-1">{String(formErrors.description)}</p>
                )}
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-bold text-dark-400 tracking-widest uppercase mb-2">
                  Product Image <span className="text-red-400">*</span>
                </label>
                <div className="space-y-3">
                  {/* URL Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.image}
                      onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
                      placeholder="https://images.unsplash.com/... or upload a file"
                      className={`flex-1 border-2 px-4 py-3 text-sm focus:outline-none transition-colors ${
                        formErrors.image ? "border-red-400" : "border-gray-200 focus:border-dark-400"
                      }`}
                    />
                    <label
                      className={`cursor-pointer bg-dark-400 text-white px-4 py-3 text-sm font-bold tracking-wider uppercase hover:bg-primary-500 transition-colors flex items-center gap-2 ${
                        uploading ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="product-image-upload"
                        disabled={uploading}
                      />
                      {uploading ? "Uploading..." : "Upload"}
                    </label>
                  </div>
                  {formErrors.image && (
                    <p className="text-red-500 text-xs">{String(formErrors.image)}</p>
                  )}
                  {/* Image Preview */}
                  {(form.image || previewUrl) && (
                    <div className="relative inline-block">
                      <img
                        src={previewUrl || form.image}
                        alt="Preview"
                        className="mt-2 h-24 w-24 object-cover border border-gray-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      {previewUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewUrl(null);
                            setForm((p) => ({ ...p, image: "" }));
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Images */}
              <div>
                <label className="block text-xs font-bold text-dark-400 tracking-widest uppercase mb-2">
                  Additional Images
                </label>
                <div className="space-y-3">
                  {/* Add More Images Button */}
                  <label
                    className={`cursor-pointer border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-bold tracking-wider uppercase hover:border-dark-400 hover:text-dark-400 transition-colors flex items-center gap-2 ${
                      uploading ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAdditionalImageUpload}
                      className="hidden"
                      id="additional-image-upload"
                      disabled={uploading}
                    />
                    <Plus size={16} />
                    {uploading ? "Uploading..." : "Add More Images"}
                  </label>

                  {/* Additional Images Preview Grid */}
                  {(additionalImageUrls.length > 0 || additionalImagePreviews.length > 0) && (
                    <div className="grid grid-cols-4 gap-3">
                      {additionalImageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={additionalImagePreviews[index] || url}
                            alt={`Additional ${index + 1}`}
                            className="h-20 w-full object-cover border border-gray-200 rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=No+Image";
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveAdditionalImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-xs font-bold text-dark-400 tracking-widest uppercase mb-2">
                  Available Sizes <span className="text-red-400">*</span>
                </label>
                
                {/* Standard Sizes */}
                <div className="flex gap-2 flex-wrap mb-3">
                  {ALL_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`w-12 h-10 border-2 text-xs font-bold transition-all ${
                        form.sizes.includes(size)
                          ? "border-dark-400 bg-dark-400 text-white"
                          : "border-gray-200 text-gray-500 hover:border-dark-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                
                {/* Custom Size Input */}
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    placeholder="Enter size (e.g., 40)"
                    className="flex-1 border-2 border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-dark-400 transition-colors"
                    onKeyDown={(e) => e.key === "Enter" && handleAddCustomSize()}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSize}
                    className="bg-primary-500 text-dark-400 px-4 py-2.5 text-sm font-bold tracking-wider uppercase hover:bg-primary-400 transition-colors flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add
                  </button>
                </div>
                
                {/* Show custom sizes that were added */}
                {form.sizes.filter(s => !ALL_SIZES.includes(s)).length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-3">
                    {form.sizes.filter(s => !ALL_SIZES.includes(s)).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className="w-12 h-10 border-2 border-dark-400 bg-dark-400 text-white text-xs font-bold transition-all hover:bg-red-500 hover:border-red-500"
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}
                
                {formErrors.sizes && (
                  <p className="text-red-500 text-xs mt-1">{String(formErrors.sizes)}</p>
                )}
              </div>

              {/* Featured */}
              <div className="flex items-center gap-3 p-4 border-2 border-gray-100 cursor-pointer hover:border-dark-400 transition-colors"
                onClick={() => setForm((p) => ({ ...p, featured: !p.featured }))}>
                <div
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    form.featured ? "bg-primary-500" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      form.featured ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-dark-400">Featured Product</p>
                  <p className="text-xs text-gray-500">Show on homepage featured section</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 border-2 border-gray-200 text-sm font-bold tracking-wider text-gray-600 hover:border-dark-400 hover:text-dark-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-2.5 bg-dark-400 text-white text-sm font-bold tracking-wider uppercase hover:bg-primary-500 transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                {saving ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Save size={15} />
                    {editingProduct ? "Save Changes" : "Create Product"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {showDeleteModal && deletingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md shadow-2xl animate-slide-up">
            <div className="bg-red-500 px-6 py-4 flex items-center gap-3">
              <AlertTriangle size={20} className="text-white" />
              <h2 className="text-white font-bold tracking-wider text-sm uppercase">
                Delete Product
              </h2>
            </div>
            <div className="p-6">
              <div className="flex gap-4 items-start mb-6">
                <img
                  src={deletingProduct.image}
                  alt={deletingProduct.name}
                  className="w-16 h-20 object-cover flex-shrink-0"
                />
                <div>
                  <p className="font-bold text-dark-400 mb-1">{deletingProduct.name}</p>
                  <p className="text-gray-500 text-sm">
                    EGP {deletingProduct.price.toLocaleString()}
                  </p>
                  <p className="text-red-500 text-xs mt-3 leading-relaxed">
                    ⚠️ This action cannot be undone. The product will be
                    permanently removed from your store.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingProduct(null);
                  }}
                  className="px-6 py-2.5 border-2 border-gray-200 text-sm font-bold text-gray-600 hover:border-dark-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                disabled={saving}
                className="px-8 py-2.5 bg-red-500 text-white text-sm font-bold tracking-wider uppercase hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                {saving ? <LoadingSpinner size="sm" /> : <><Trash2 size={15} /> Delete</>}
              </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Category Management Modal ── */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md shadow-2xl animate-slide-up">
            <div className="bg-dark-400 px-6 py-4 flex items-center justify-between">
              <h2 className="text-white font-bold tracking-wider text-sm uppercase flex items-center gap-2">
                <Folder size={18} />
                Manage Categories
              </h2>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Add New Category */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-dark-400 tracking-widest uppercase mb-2">
                  Add New Category
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name"
                    className="flex-1 border-2 border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-dark-400 transition-colors"
                    onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
                  />
                  <button
                    onClick={handleCreateCategory}
                    disabled={categoryLoading || !newCategoryName.trim()}
                    className="bg-primary-500 text-dark-400 px-4 py-2.5 text-sm font-bold tracking-wider uppercase hover:bg-primary-400 transition-colors disabled:opacity-60 flex items-center gap-2"
                  >
                    {categoryLoading ? <LoadingSpinner size="sm" /> : <><Plus size={16} /> Add</>}
                  </button>
                </div>
              </div>

              {/* Category List */}
              <div>
                <label className="block text-xs font-bold text-dark-400 tracking-widest uppercase mb-2">
                  Existing Categories ({categories.length})
                </label>
                <div className="border-2 border-gray-100 max-h-60 overflow-y-auto">
                  {categories.length === 0 ? (
                    <p className="p-4 text-center text-gray-500 text-sm">No categories found</p>
                  ) : (
                    categories.map((category) => (
                      <div
                        key={category}
                        className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-b-0 hover:bg-gray-50"
                      >
                        <span className="font-medium text-dark-400 text-sm">{category}</span>
                        <button
                          onClick={() => handleDeleteCategory(category)}
                          disabled={categoryLoading}
                          className="p-1.5 text-red-400 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                          title="Delete category"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-6 py-2.5 border-2 border-gray-200 text-sm font-bold tracking-wider text-gray-600 hover:border-dark-400 hover:text-dark-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
