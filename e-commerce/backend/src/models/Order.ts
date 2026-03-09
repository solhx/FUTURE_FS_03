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
  userId: mongoose.Types.ObjectId;
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
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  paymentMethod: "cash_on_delivery" | "online";
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name:      { type: String, required: true },
  image:     { type: String, required: true },
  price:     { type: Number, required: true },
  size:      { type: String, required: true },
  quantity:  { type: Number, required: true, min: 1 },
});

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, unique: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerName: { type: String, required: true, trim: true },
    email:        { type: String, required: true, lowercase: true },
    phone:        { type: String, required: true },
    address:      { type: String, required: true },
    city:         { type: String, required: true },
    governorate:  { type: String, required: true },
    postalCode:   { type: String, default: "" },
    products: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (v: IOrderItem[]) => v.length > 0,
        message: "Order must have at least one product",
      },
    },
    totalPrice:    { type: Number, required: true, min: 0 },
    shippingPrice: { type: Number, default: 50 },
    status: {
      type: String,
      enum: ["pending","confirmed","processing","shipped","delivered","cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash_on_delivery", "online"],
      default: "cash_on_delivery",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

OrderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments();
    const ts = Date.now().toString().slice(-6);
    this.orderNumber = `UN-${ts}-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

export default mongoose.model<IOrder>("Order", OrderSchema);