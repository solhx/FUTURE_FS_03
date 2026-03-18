import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";

declare module "multer-storage-cloudinary" {
  interface Params {
    folder?: string;
  }
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// File filter - only allow images
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

// Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "urban-nile/products",
    format: async (req: any, file: any) => {
      const ext = path.extname(file.originalname).slice(1).toLowerCase();
      return ext === 'jpg' ? 'jpeg' : ext; // Cloudinary prefers jpeg
    },
    filename: (req: any, file: any) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      return `product-${uniqueSuffix}${ext}`;
    },
    transformation: [
      { width: 1200, height: 1200, crop: "limit" }, // Smart resize
      { quality: "auto" }, // Auto optimize
    ],
  } as any,
});

// Create multer upload instance
const upload = multer({ 
  storage, 
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter,
});

export default upload;
