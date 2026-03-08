import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db";
import Product from "../models/Product";
import User from "../models/User";

dotenv.config();

const sampleProducts = [
  {
    name: "Pharaoh Street Tee",
    price: 349,
    description:
      "A premium cotton oversized tee featuring original Pharaonic-inspired street art. Crafted from 100% Egyptian cotton for ultimate comfort and breathability. The perfect blend of ancient culture and modern streetwear.",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=600&q=80",
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 50,
    category: "T-Shirts",
    featured: true,
    rating: 4.8,
    reviewCount: 124,
  },
  {
    name: "Nile Wave Hoodie",
    price: 699,
    description:
      "Stay warm with our signature Nile Wave hoodie. Featuring a relaxed fit and embroidered Nile wave graphic on the chest. Made with a premium cotton-fleece blend for maximum comfort.",
    image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80",
    ],
    sizes: ["S", "M", "L", "XL"],
    stock: 30,
    category: "Hoodies",
    featured: true,
    rating: 4.9,
    reviewCount: 89,
  },
  {
    name: "Cairo Nights Joggers",
    price: 549,
    description:
      "Inspired by the vibrant streets of Cairo after dark. These joggers feature a tapered fit, ribbed cuffs, and side pockets. Perfect for lounging or light athletic activities.",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80",
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 40,
    category: "Joggers",
    featured: true,
    rating: 4.7,
    reviewCount: 67,
  },
  {
    name: "Desert Sand Windbreaker",
    price: 899,
    description:
      "A lightweight windbreaker in our signature sand beige colorway. Features a full-zip design with an adjustable hood and reflective Urban Nile logo. Perfect for Egypt's cool evenings.",
    image: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600&q=80",
    ],
    sizes: ["S", "M", "L", "XL"],
    stock: 20,
    category: "Jackets",
    featured: true,
    rating: 4.6,
    reviewCount: 45,
  },
  {
    name: "Sphinx Graphic Tee",
    price: 299,
    description:
      "Our best-selling graphic tee featuring a modern minimalist Sphinx design. Made from breathable Egyptian cotton with a slightly relaxed fit.",
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    stock: 75,
    category: "T-Shirts",
    featured: false,
    rating: 4.5,
    reviewCount: 203,
  },
  {
    name: "Luxor Tracksuit Set",
    price: 1199,
    description:
      "The complete Urban Nile matching set. Features our Luxor-inspired geometric pattern across both the jacket and joggers. A statement piece for those who command attention.",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
    ],
    sizes: ["S", "M", "L", "XL"],
    stock: 15,
    category: "Sets",
    featured: true,
    rating: 5.0,
    reviewCount: 28,
  },
  {
    name: "Nubian Heritage Cap",
    price: 199,
    description:
      "A structured six-panel cap with embroidered Urban Nile logo. Adjustable strap for a perfect fit. Inspired by the rich Nubian heritage of southern Egypt.",
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80",
    ],
    sizes: ["S", "M", "L"],
    stock: 60,
    category: "Accessories",
    featured: false,
    rating: 4.4,
    reviewCount: 91,
  },
  {
    name: "Alexandria Drop-Shoulder Hoodie",
    price: 749,
    description:
      "Our drop-shoulder hoodie inspired by the Mediterranean coastline of Alexandria. Features a relaxed silhouette, kangaroo pocket, and subtle wave embroidery on the sleeve.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80",
    ],
    sizes: ["S", "M", "L", "XL"],
    stock: 25,
    category: "Hoodies",
    featured: false,
    rating: 4.8,
    reviewCount: 52,
  },
];

const seedDB = async (): Promise<void> => {
  await connectDB();

  try {
    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});

    console.log("🗑️  Cleared existing data");

    // Seed products
    await Product.insertMany(sampleProducts);
    console.log(`✅ Seeded ${sampleProducts.length} products`);

    // Create admin user
    const admin = await User.create({
      name: "Urban Nile Admin",
      email: process.env.ADMIN_EMAIL || "admin@urbannile.com",
      password: process.env.ADMIN_PASSWORD || "Admin@123456",
      role: "admin",
      isVerified: true,
    });

    console.log(`✅ Admin user created: ${admin.email}`);
    console.log("🌱 Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedDB();