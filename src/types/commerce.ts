export type ProductCategory =
  | "womens-fashion"
  | "custom-earrings"
  | "custom-frames"
  | "cash-bouquets"
  | "custom-gifts"
  | "hijabs"
  | "accessories";

export type StockStatus = "In stock" | "Low stock" | "Made to order" | "Sold out";

export type ProductVariant = {
  label: string;
  values: string[];
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  collection: string;
  price: number;
  originalPrice?: number;
  currency: "INR";
  image: string;
  hoverImage: string;
  images: string[];
  videoUrl?: string;
  description: string;
  details: string[];
  tags: string[];
  rating: number;
  reviewCount: number;
  stockStatus: StockStatus;
  stock: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  returnEligible: boolean;
  variants?: ProductVariant[];
};

export type Collection = {
  id: string;
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  image: string;
  productCount: number;
  featured?: boolean;
};

export type CartItem = {
  product: Product;
  quantity: number;
  variant?: string;
};

export type SavedAddress = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  district: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
};

export type Testimonial = {
  name: string;
  location: string;
  quote: string;
  rating: number;
};

export type OrderStatus =
  | "Confirmed"
  | "Preparing"
  | "Dispatched"
  | "Delivered"
  | "Return requested";

export type Order = {
  id: string;
  date: string;
  total: number;
  status: OrderStatus;
  trackingId: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
};

export type CustomOrderRequest = {
  id: string;
  customer: string;
  type: string;
  budget: string;
  status: "Pending" | "Approved" | "Rejected" | "Converted";
  requestedFor: string;
  internalNote?: string;
};

export type AdminMetric = {
  label: string;
  value: string;
  delta: string;
};
