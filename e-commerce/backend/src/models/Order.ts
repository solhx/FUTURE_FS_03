import mongoose, { Document, Schema } from "mongoose";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  image: string;
  price: number;
  size: string;
  quantity: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  governorate: string;
  postalCode: string;
  products: IOrderItem[];
  totalPrice: number;
  shippingPrice: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: "cash_on_delivery" | "online";
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  size: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
    },
    governorate: {
      type: String,
      required: [true, "Governorate is required"],
    },
    postalCode: {
      type: String,
      default: "",
    },
    products: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: function (v: IOrderItem[]) {
          return v.length > 0;
        },
        message: "Order must have at least one product",
      },
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingPrice: {
      type: Number,
      default: 50,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash_on_delivery", "online"],
      default: "cash_on_delivery",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate order number
OrderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments();
    const timestamp = Date.now().toString().slice(-6);
    this.orderNumber = `UN-${timestamp}-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

export default mongoose.model<IOrder>("Order", OrderSchema);