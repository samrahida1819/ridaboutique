export type ProductCategory =
  | string
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
  categoryId?: string;
  categoryName?: string;
  collection: string;
  price: number;
  originalPrice?: number;
  salePrice?: number | null;
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
  isActive?: boolean;
  returnEligible: boolean;
  variants?: ProductVariant[];
  createdAt?: string;
  updatedAt?: string;
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

export type Banner = {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  active?: boolean;
  sortOrder?: number;
};

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Packed"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export type Order = {
  id: string;
  date: string;
  total: number;
  status: OrderStatus;
  trackingId?: string;
  customerName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  paymentMethod?: "cod" | "razorpay";
  items: Array<{
    productId?: string;
    name: string;
    quantity: number;
    price?: number;
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

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  active?: boolean;
};

export type ProfileRole = "admin" | "customer";

export type Profile = {
  id: string;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  role: ProfileRole;
  createdAt?: string;
};

export type ContactDetails = {
  storeName: string;
  email: string;
  primaryPhone: string;
  secondaryPhone: string;
  whatsappNumber: string;
  businessAddress: string;
  googleMapsLink: string;
  workingHours: string;
  instagramLink: string;
  facebookLink: string;
  youtubeLink: string;
};

export type StoreSettings = {
  storeName: string;
  logoUrl: string;
  deliveryCharges: number;
  defaultTheme: "light" | "dark";
  instagramLink: string;
  facebookLink: string;
  youtubeLink: string;
};

export type WebsiteContentKey =
  | "about"
  | "faq"
  | "privacy"
  | "terms"
  | "shipping"
  | "returns";

export type WebsiteContent = Record<WebsiteContentKey, string>;
