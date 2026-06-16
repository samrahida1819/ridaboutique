import type {
  AdminMetric,
  Banner,
  Category,
  Collection,
  ContactDetails,
  Order,
  Product,
  StoreSettings,
  Testimonial,
  WebsiteContent
} from "@/types/commerce";

export const fallbackCategories: Category[] = [
  { id: "cat-fashion", name: "Women's Fashion", slug: "womens-fashion", active: true },
  { id: "cat-hijabs", name: "Hijabs", slug: "hijabs", active: true },
  { id: "cat-earrings", name: "Custom Earrings", slug: "custom-earrings", active: true },
  { id: "cat-gifts", name: "Custom Gifts", slug: "custom-gifts", active: true },
  { id: "cat-accessories", name: "Accessories", slug: "accessories", active: true }
];

const image = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=86`;

export const fallbackBanners: Banner[] = [
  {
    id: "banner-occasion-edit",
    title: "Occasion gifts, made to feel personal.",
    subtitle:
      "Reserve custom frames, earrings, cash bouquets, and curated gift boxes with clear pricing before checkout.",
    imageUrl: image("photo-1519225421980-715cb0215aed"),
    linkUrl: "/custom-orders",
    active: true,
    sortOrder: 1
  }
];

export const products: Product[] = [
  {
    id: "prd-001",
    slug: "noor-emerald-evening-suit",
    name: "Noor Emerald Evening Suit",
    category: "womens-fashion",
    categoryId: "cat-fashion",
    categoryName: "Women's Fashion",
    collection: "new-arrivals",
    price: 7800,
    originalPrice: 9200,
    salePrice: 7800,
    currency: "INR",
    image: image("photo-1496747611176-843222e1e57c"),
    hoverImage: image("photo-1529139574466-a303027c1d8b"),
    images: [
      image("photo-1496747611176-843222e1e57c"),
      image("photo-1529139574466-a303027c1d8b"),
      image("photo-1483985988355-763728e1935b")
    ],
    description:
      "A refined evening suit with fluid tailoring, a composed silhouette, and a polished boutique finish.",
    details: ["Premium blended fabric", "Tailored silhouette", "Kashmir-wide delivery"],
    tags: ["Suits", "Evening", "Featured"],
    rating: 4.9,
    reviewCount: 42,
    stockStatus: "In stock",
    stock: 9,
    isNew: true,
    isFeatured: true,
    isActive: true,
    returnEligible: true,
    variants: [{ label: "Size", values: ["XS", "S", "M", "L", "XL"] }]
  },
  {
    id: "prd-002",
    slug: "aurelia-gold-custom-earrings",
    name: "Aurelia Gold Custom Earrings",
    category: "custom-earrings",
    categoryId: "cat-earrings",
    categoryName: "Custom Earrings",
    collection: "best-sellers",
    price: 2450,
    currency: "INR",
    image: image("photo-1515562141207-7a88fb7ce338"),
    hoverImage: image("photo-1601121141461-9d6647bca1ed"),
    images: [image("photo-1515562141207-7a88fb7ce338"), image("photo-1601121141461-9d6647bca1ed")],
    description: "Made-to-order earrings with a delicate finish and bespoke stone selection.",
    details: ["Custom finish options", "Gift-ready packaging", "Made to order"],
    tags: ["Custom Earrings", "Accessories", "Gift Ready"],
    rating: 4.8,
    reviewCount: 31,
    stockStatus: "Made to order",
    stock: 5,
    isBestSeller: true,
    isActive: true,
    returnEligible: false,
    variants: [{ label: "Finish", values: ["Gold", "Pearl", "Crystal"] }]
  },
  {
    id: "prd-003",
    slug: "serene-ivory-hijab",
    name: "Serene Ivory Hijab",
    category: "hijabs",
    categoryId: "cat-hijabs",
    categoryName: "Hijabs",
    collection: "editor-picks",
    price: 1350,
    currency: "INR",
    image: image("photo-1583391733956-6c78276477e2"),
    hoverImage: image("photo-1525507119028-ed4c629a60a3"),
    images: [image("photo-1583391733956-6c78276477e2"), image("photo-1525507119028-ed4c629a60a3")],
    description: "A soft ivory hijab designed for everyday polish and occasion-ready elegance.",
    details: ["Breathable soft weave", "Lightweight drape", "Return eligible when unused"],
    tags: ["Hijabs", "Essentials", "Ivory"],
    rating: 4.7,
    reviewCount: 26,
    stockStatus: "In stock",
    stock: 18,
    isFeatured: true,
    isActive: true,
    returnEligible: true,
    variants: [{ label: "Color", values: ["Ivory", "Sage", "Black", "Rose"] }]
  },
  {
    id: "prd-004",
    slug: "signature-cash-bouquet",
    name: "Signature Cash Bouquet",
    category: "custom-gifts",
    categoryId: "cat-gifts",
    categoryName: "Custom Gifts",
    collection: "custom-creations",
    price: 5000,
    currency: "INR",
    image: image("photo-1591886960571-74d43a9d4166"),
    hoverImage: image("photo-1519225421980-715cb0215aed"),
    images: [image("photo-1591886960571-74d43a9d4166"), image("photo-1519225421980-715cb0215aed")],
    description: "A premium cash bouquet arrangement for weddings, engagements, birthdays, and surprise gifting.",
    details: ["Budget-customizable", "Personal message card", "Made to order"],
    tags: ["Cash Bouquets", "Custom", "Gifting"],
    rating: 5,
    reviewCount: 18,
    stockStatus: "Made to order",
    stock: 6,
    isBestSeller: true,
    isActive: true,
    returnEligible: false
  },
  {
    id: "prd-005",
    slug: "editorial-black-dress",
    name: "Editorial Black Dress",
    category: "womens-fashion",
    categoryId: "cat-fashion",
    categoryName: "Women's Fashion",
    collection: "editor-picks",
    price: 6400,
    currency: "INR",
    image: image("photo-1515372039744-b8f02a3ae446"),
    hoverImage: image("photo-1509631179647-0177331693ae"),
    images: [image("photo-1515372039744-b8f02a3ae446"), image("photo-1509631179647-0177331693ae")],
    description: "A clean-lined statement dress with a composed silhouette and high-contrast finish.",
    details: ["Occasion silhouette", "Soft inner lining", "Return eligible"],
    tags: ["Dresses", "Occasion", "Editor's Pick"],
    rating: 4.8,
    reviewCount: 37,
    stockStatus: "Low stock",
    stock: 3,
    isFeatured: true,
    isActive: true,
    returnEligible: true,
    variants: [{ label: "Size", values: ["S", "M", "L"] }]
  },
  {
    id: "prd-006",
    slug: "personalized-gift-box",
    name: "Personalized Gift Box",
    category: "custom-gifts",
    categoryId: "cat-gifts",
    categoryName: "Custom Gifts",
    collection: "custom-creations",
    price: 4100,
    currency: "INR",
    image: image("photo-1512909006721-3d6018887383"),
    hoverImage: image("photo-1549465220-1a8b9238cd48"),
    images: [image("photo-1512909006721-3d6018887383"), image("photo-1549465220-1a8b9238cd48")],
    description: "A curated gift box with personalization, premium wrapping, and message card support.",
    details: ["Custom contents", "Name/message personalization", "Made to order"],
    tags: ["Custom Gifts", "Personalized", "Curated"],
    rating: 5,
    reviewCount: 15,
    stockStatus: "Made to order",
    stock: 7,
    isFeatured: true,
    isActive: true,
    returnEligible: false
  }
];

export const collections: Collection[] = [
  {
    id: "col-001",
    slug: "new-arrivals",
    title: "New Arrivals",
    eyebrow: "Fresh edit",
    description: "Elegant wardrobe and gifting pieces selected for the current season.",
    image: image("photo-1483985988355-763728e1935b"),
    productCount: 2,
    featured: true
  },
  {
    id: "col-002",
    slug: "best-sellers",
    title: "Best Sellers",
    eyebrow: "Client favourites",
    description: "The pieces most often chosen for polished occasions and memorable gifts.",
    image: image("photo-1607082349566-187342175e2f"),
    productCount: 2,
    featured: true
  },
  {
    id: "col-003",
    slug: "custom-creations",
    title: "Custom Creations",
    eyebrow: "Made for you",
    description: "Frames, bouquets, earrings, and personalized gifts shaped around your brief.",
    image: image("photo-1512909006721-3d6018887383"),
    productCount: 2,
    featured: true
  }
];

export const testimonials: Testimonial[] = [
  {
    name: "Aaliya",
    location: "Srinagar",
    quote: "The packaging, finishing, and delivery felt premium without being overdone.",
    rating: 5
  },
  {
    name: "Hiba",
    location: "Budgam",
    quote: "My custom frame was approved with a proof first, then delivered exactly as promised.",
    rating: 5
  },
  {
    name: "Zoya",
    location: "Anantnag",
    quote: "Clean ordering, calm support, and beautiful details. It has become my go-to for gifts.",
    rating: 5
  }
];

export const sampleOrders: Order[] = [
  {
    id: "RB-24018",
    date: "2026-06-03",
    total: 7800,
    status: "Shipped",
    trackingId: "KMR-XP-9012",
    paymentMethod: "cod",
    items: [{ name: "Noor Emerald Evening Suit", quantity: 1, price: 7800 }]
  },
  {
    id: "RB-24011",
    date: "2026-05-22",
    total: 6550,
    status: "Delivered",
    trackingId: "KMR-XP-8894",
    paymentMethod: "cod",
    items: [
      { name: "Aurelia Gold Custom Earrings", quantity: 1, price: 2450 },
      { name: "Personalized Gift Box", quantity: 1, price: 4100 }
    ]
  }
];

export const adminMetrics: AdminMetric[] = [
  { label: "Total Revenue", value: "Rs 8.42L", delta: "+18.4%" },
  { label: "Total Orders", value: "312", delta: "+11.2%" },
  { label: "Total Customers", value: "1,284", delta: "+24.1%" },
  { label: "Total Products", value: "86", delta: "+8 live" }
];

export const fallbackContactDetails: ContactDetails = {
  storeName: "Rida Boutique",
  email: "care@ridaboutique.in",
  primaryPhone: "+91 70000 00000",
  secondaryPhone: "+91 70000 00001",
  whatsappNumber: "+91 70000 00000",
  businessAddress: "Srinagar, Jammu and Kashmir, India",
  googleMapsLink: "https://maps.google.com",
  workingHours: "Monday to Saturday, 10:00 AM - 7:00 PM",
  instagramLink: "https://instagram.com",
  facebookLink: "https://facebook.com",
  youtubeLink: "https://youtube.com"
};

export const fallbackSettings: StoreSettings = {
  storeName: "Rida Boutique",
  logoUrl: "",
  deliveryCharges: 120,
  codEnabled: true,
  defaultTheme: "light",
  instagramLink: fallbackContactDetails.instagramLink,
  facebookLink: fallbackContactDetails.facebookLink,
  youtubeLink: fallbackContactDetails.youtubeLink
};

export const fallbackWebsiteContent: WebsiteContent = {
  about:
    "Rida Boutique is a premium boutique for elegant womenswear, hijabs, accessories, and thoughtful custom gifting with clear checkout and custom-order approval.",
  faq:
    "How do I place an order?\nAdd items to cart, choose Cash on Delivery, and place your order.\n\nCan I request custom products?\nYes. Contact us with your reference, budget, and date.\n\nHow long does delivery take?\nReady products usually ship within 2-4 business days.",
  privacy:
    "We collect only the information needed to create accounts, process orders, deliver products, and support customers. We do not sell customer data.",
  terms:
    "By using Rida Boutique, you agree to provide accurate account and delivery information, pay applicable charges, and follow the stated return and shipping policies.",
  shipping:
    "Orders are prepared after confirmation. Delivery charges are shown at checkout. Delivery timelines depend on product availability and destination.",
  returns:
    "Eligible unused products can be returned within the stated return window. Custom, personalized, and made-to-order products are not return eligible unless defective."
};

export const trendingSearches = ["hijab", "custom earrings", "cash bouquet", "evening suit", "gift box"];

export const megaMenu = [
  { title: "Shop", items: fallbackCategories.map((category) => category.name) },
  { title: "Support", items: ["Shipping", "Returns", "FAQ", "Contact"] }
];

export function normalizeProduct(row: Record<string, unknown>): Product {
  const imageUrls = Array.isArray(row.image_urls) ? (row.image_urls as string[]) : [];
  const category =
    typeof row.category_slug === "string"
      ? row.category_slug
      : typeof row.category === "string"
        ? row.category
        : "uncategorized";
  const price = Number(row.price || 0);
  const salePrice = row.sale_price === null || row.sale_price === undefined ? null : Number(row.sale_price);

  return {
    id: String(row.id),
    slug: String(row.slug || row.id),
    name: String(row.name || "Untitled product"),
    category,
    categoryId: typeof row.category_id === "string" ? row.category_id : undefined,
    categoryName: typeof row.category_name === "string" ? row.category_name : undefined,
    collection: "catalog",
    price,
    originalPrice: salePrice && salePrice < price ? price : undefined,
    salePrice,
    currency: "INR",
    image: imageUrls[0] || image("photo-1483985988355-763728e1935b"),
    hoverImage: imageUrls[1] || imageUrls[0] || image("photo-1529139574466-a303027c1d8b"),
    images: imageUrls.length ? imageUrls : [image("photo-1483985988355-763728e1935b")],
    description: String(row.description || ""),
    details: [],
    tags: [],
    rating: 0,
    reviewCount: 0,
    stockStatus: Number(row.stock || 0) > 0 ? "In stock" : "Sold out",
    stock: Number(row.stock || 0),
    isFeatured: Boolean(row.featured),
    isActive: row.active !== false,
    returnEligible: true,
    createdAt: typeof row.created_at === "string" ? row.created_at : undefined,
    updatedAt: typeof row.updated_at === "string" ? row.updated_at : undefined
  };
}

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getCollectionBySlug(slug: string) {
  return collections.find((collection) => collection.slug === slug);
}

export function getProductsByCollection(slug: string) {
  return products.filter((product) => product.collection === slug);
}

export function getRelatedProducts(product: Product) {
  return products.filter((candidate) => candidate.id !== product.id && candidate.category === product.category).slice(0, 4);
}
