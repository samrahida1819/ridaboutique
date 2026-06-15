import { cloudinaryFetch } from "@/lib/cloudinary";
import type {
  AdminMetric,
  Collection,
  CustomOrderRequest,
  Order,
  Product,
  Testimonial
} from "@/types/commerce";

const img = (url: string, width = 1400, height = 1800) =>
  cloudinaryFetch(url, { width, height, crop: "fill", gravity: "auto" });

export const heroImage = img(
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=90",
  1800,
  1200
);

export const products: Product[] = [
  {
    id: "prd-001",
    slug: "noor-emerald-evening-suit",
    name: "Noor Emerald Evening Suit",
    category: "womens-fashion",
    collection: "new-arrivals",
    price: 7800,
    originalPrice: 9200,
    currency: "INR",
    image: img("https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=90"),
    hoverImage: img("https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=90"),
    images: [
      img("https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=90"),
      img("https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=90"),
      img("https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=90")
    ],
    description: "A refined evening set with fluid tailoring, luminous accents, and a polished boutique finish.",
    details: ["Premium blended fabric", "Tailored silhouette", "Complimentary Kashmir-wide delivery"],
    tags: ["Suits", "Evening", "New Arrival"],
    rating: 4.9,
    reviewCount: 42,
    stockStatus: "In stock",
    stock: 9,
    isNew: true,
    isFeatured: true,
    returnEligible: true,
    variants: [
      { label: "Size", values: ["XS", "S", "M", "L", "XL"] },
      { label: "Color", values: ["Emerald", "Ivory", "Charcoal"] }
    ]
  },
  {
    id: "prd-002",
    slug: "aurelia-gold-custom-earrings",
    name: "Aurelia Gold Custom Earrings",
    category: "custom-earrings",
    collection: "best-sellers",
    price: 2450,
    currency: "INR",
    image: img("https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=90"),
    hoverImage: img("https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=90"),
    images: [
      img("https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=90"),
      img("https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=90")
    ],
    description: "Made-to-order earrings with a delicate gold finish and bespoke stone selection.",
    details: ["Custom stone options", "Hand-finished", "Custom product: not return eligible"],
    tags: ["Custom Earrings", "Accessories", "Gift Ready"],
    rating: 4.8,
    reviewCount: 31,
    stockStatus: "Made to order",
    stock: 5,
    isBestSeller: true,
    returnEligible: false,
    variants: [{ label: "Finish", values: ["Gold", "Pearl", "Crystal"] }]
  },
  {
    id: "prd-003",
    slug: "serene-ivory-hijab",
    name: "Serene Ivory Hijab",
    category: "hijabs",
    collection: "editor-picks",
    price: 1350,
    currency: "INR",
    image: img("https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&q=90"),
    hoverImage: img("https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&q=90"),
    images: [
      img("https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&q=90"),
      img("https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&q=90")
    ],
    description: "A soft ivory hijab designed for everyday polish and occasion-ready elegance.",
    details: ["Breathable soft weave", "Lightweight drape", "Return eligible when unused"],
    tags: ["Hijabs", "Essentials", "Ivory"],
    rating: 4.7,
    reviewCount: 26,
    stockStatus: "In stock",
    stock: 18,
    isFeatured: true,
    returnEligible: true,
    variants: [{ label: "Color", values: ["Ivory", "Sage", "Black", "Rose"] }]
  },
  {
    id: "prd-004",
    slug: "signature-cash-bouquet",
    name: "Signature Cash Bouquet",
    category: "cash-bouquets",
    collection: "custom-creations",
    price: 5000,
    currency: "INR",
    image: img("https://images.unsplash.com/photo-1591886960571-74d43a9d4166?auto=format&fit=crop&q=90"),
    hoverImage: img("https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=90"),
    images: [
      img("https://images.unsplash.com/photo-1591886960571-74d43a9d4166?auto=format&fit=crop&q=90"),
      img("https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=90")
    ],
    description: "A premium cash bouquet arrangement for weddings, engagements, birthdays, and surprise gifting.",
    details: ["Budget-customizable", "Personal message card", "Custom product: not return eligible"],
    tags: ["Cash Bouquets", "Custom", "Gifting"],
    rating: 5,
    reviewCount: 18,
    stockStatus: "Made to order",
    stock: 6,
    isBestSeller: true,
    returnEligible: false,
    variants: [{ label: "Style", values: ["Classic", "Ivory Wrap", "Emerald Wrap"] }]
  },
  {
    id: "prd-005",
    slug: "editorial-black-dress",
    name: "Editorial Black Dress",
    category: "womens-fashion",
    collection: "editor-picks",
    price: 6400,
    currency: "INR",
    image: img("https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=90"),
    hoverImage: img("https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=90"),
    images: [
      img("https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=90"),
      img("https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=90")
    ],
    description: "A clean-lined statement dress with a composed silhouette and high-contrast finish.",
    details: ["Occasion silhouette", "Soft inner lining", "Return eligible"],
    tags: ["Dresses", "Occasion", "Editor's Pick"],
    rating: 4.8,
    reviewCount: 37,
    stockStatus: "Low stock",
    stock: 3,
    isFeatured: true,
    returnEligible: true,
    variants: [{ label: "Size", values: ["S", "M", "L"] }]
  },
  {
    id: "prd-006",
    slug: "heirloom-memory-frame",
    name: "Heirloom Memory Frame",
    category: "custom-frames",
    collection: "custom-creations",
    price: 3200,
    currency: "INR",
    image: img("https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=90"),
    hoverImage: img("https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=90"),
    images: [
      img("https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=90"),
      img("https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=90")
    ],
    description: "A personalized frame crafted for portraits, wedding memories, milestone gifts, and keepsakes.",
    details: ["Layout proof before making", "Custom text support", "Custom product: not return eligible"],
    tags: ["Custom Frames", "Personalized", "Gifts"],
    rating: 4.9,
    reviewCount: 21,
    stockStatus: "Made to order",
    stock: 12,
    isNew: true,
    returnEligible: false,
    variants: [{ label: "Frame", values: ["Gold", "Black", "Walnut"] }]
  },
  {
    id: "prd-007",
    slug: "velvet-occasion-clutch",
    name: "Velvet Occasion Clutch",
    category: "accessories",
    collection: "best-sellers",
    price: 2150,
    currency: "INR",
    image: img("https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=90"),
    hoverImage: img("https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=90"),
    images: [
      img("https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=90"),
      img("https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=90")
    ],
    description: "A structured velvet clutch with a luminous clasp and refined evening scale.",
    details: ["Compact interior", "Detachable chain", "Return eligible"],
    tags: ["Accessories", "Clutch", "Best Seller"],
    rating: 4.6,
    reviewCount: 24,
    stockStatus: "In stock",
    stock: 10,
    isBestSeller: true,
    returnEligible: true
  },
  {
    id: "prd-008",
    slug: "personalized-gift-box",
    name: "Personalized Gift Box",
    category: "custom-gifts",
    collection: "custom-creations",
    price: 4100,
    currency: "INR",
    image: img("https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&q=90"),
    hoverImage: img("https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=90"),
    images: [
      img("https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&q=90"),
      img("https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=90")
    ],
    description: "A curated gift box with personalization, premium wrapping, and message card support.",
    details: ["Custom contents", "Name/message personalization", "Custom product: not return eligible"],
    tags: ["Custom Gifts", "Personalized", "Curated"],
    rating: 5,
    reviewCount: 15,
    stockStatus: "Made to order",
    stock: 7,
    isFeatured: true,
    returnEligible: false
  },
  {
    id: "prd-009",
    slug: "satin-sage-hijab-set",
    name: "Satin Sage Hijab Set",
    category: "hijabs",
    collection: "new-arrivals",
    price: 1900,
    currency: "INR",
    image: img("https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&q=90"),
    hoverImage: img("https://images.unsplash.com/photo-1583391733981-7f9f8a0f8253?auto=format&fit=crop&q=90"),
    images: [
      img("https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&q=90"),
      img("https://images.unsplash.com/photo-1583391733981-7f9f8a0f8253?auto=format&fit=crop&q=90")
    ],
    description: "A polished hijab set with a subtle sheen, designed for gifting or refined everyday wear.",
    details: ["Includes matching undercap", "Soft satin finish", "Return eligible when unused"],
    tags: ["Hijabs", "Sage", "New Arrival"],
    rating: 4.7,
    reviewCount: 19,
    stockStatus: "In stock",
    stock: 15,
    isNew: true,
    returnEligible: true
  },
  {
    id: "prd-010",
    slug: "pearl-line-earrings",
    name: "Pearl Line Earrings",
    category: "custom-earrings",
    collection: "editor-picks",
    price: 2800,
    currency: "INR",
    image: img("https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=90"),
    hoverImage: img("https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&q=90"),
    images: [
      img("https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=90"),
      img("https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&q=90")
    ],
    description: "Minimal pearl-line earrings that can be customized for bridal, gifting, or occasion styling.",
    details: ["Pearl and crystal options", "Gift-ready packaging", "Custom product: not return eligible"],
    tags: ["Pearl", "Custom Earrings", "Editor's Pick"],
    rating: 4.9,
    reviewCount: 28,
    stockStatus: "Made to order",
    stock: 8,
    returnEligible: false
  },
  {
    id: "prd-011",
    slug: "ivory-day-dress",
    name: "Ivory Day Dress",
    category: "womens-fashion",
    collection: "new-arrivals",
    price: 5400,
    currency: "INR",
    image: img("https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&q=90"),
    hoverImage: img("https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=90"),
    images: [
      img("https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&q=90"),
      img("https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=90")
    ],
    description: "A quiet luxury day dress with clean volume, easy movement, and elevated finishing.",
    details: ["Relaxed fit", "Lined body", "Return eligible"],
    tags: ["Dresses", "Ivory", "New Arrival"],
    rating: 4.8,
    reviewCount: 13,
    stockStatus: "In stock",
    stock: 11,
    isNew: true,
    returnEligible: true,
    variants: [{ label: "Size", values: ["XS", "S", "M", "L"] }]
  },
  {
    id: "prd-012",
    slug: "gold-ribbon-gift-hamper",
    name: "Gold Ribbon Gift Hamper",
    category: "custom-gifts",
    collection: "best-sellers",
    price: 3600,
    currency: "INR",
    image: img("https://images.unsplash.com/photo-1607344645866-009c320f1687?auto=format&fit=crop&q=90"),
    hoverImage: img("https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=90"),
    images: [
      img("https://images.unsplash.com/photo-1607344645866-009c320f1687?auto=format&fit=crop&q=90"),
      img("https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=90")
    ],
    description: "A refined ready-to-customize hamper for celebrations, corporate gifting, and family occasions.",
    details: ["Curated contents", "Personal card", "Custom product: not return eligible"],
    tags: ["Custom Gifts", "Best Seller", "Hamper"],
    rating: 4.9,
    reviewCount: 33,
    stockStatus: "Made to order",
    stock: 4,
    isBestSeller: true,
    returnEligible: false
  }
];

export const collections: Collection[] = [
  {
    id: "col-001",
    slug: "new-arrivals",
    title: "New Arrivals",
    eyebrow: "Fresh from the boutique",
    description: "Elegant wardrobe and gifting pieces selected for the current season.",
    image: img("https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=90", 1200, 900),
    productCount: 4,
    featured: true
  },
  {
    id: "col-002",
    slug: "best-sellers",
    title: "Best Sellers",
    eyebrow: "Client favourites",
    description: "The pieces most often chosen for polished occasions and memorable gifts.",
    image: img("https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&q=90", 1200, 900),
    productCount: 4,
    featured: true
  },
  {
    id: "col-003",
    slug: "editor-picks",
    title: "Editor's Picks",
    eyebrow: "Rida edit",
    description: "A quieter, more considered edit of refined boutique essentials.",
    image: img("https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=90", 1200, 900),
    productCount: 4,
    featured: true
  },
  {
    id: "col-004",
    slug: "custom-creations",
    title: "Custom Creations",
    eyebrow: "Made for you",
    description: "Frames, bouquets, earrings, and personalized gifts shaped around your brief.",
    image: img("https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&q=90", 1200, 900),
    productCount: 4,
    featured: true
  }
];

export const testimonials: Testimonial[] = [
  {
    name: "Aaliya",
    location: "Srinagar",
    quote: "The packaging, finishing, and delivery felt truly premium. It did not feel like a rushed online order.",
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
    quote: "Elegant, clean, and easy. Rida Boutique has become my go-to for gifts across Kashmir.",
    rating: 5
  }
];

export const sampleOrders: Order[] = [
  {
    id: "RB-24018",
    date: "2026-06-03",
    total: 7800,
    status: "Dispatched",
    trackingId: "KMR-XP-9012",
    items: [{ name: "Noor Emerald Evening Suit", quantity: 1 }]
  },
  {
    id: "RB-24011",
    date: "2026-05-22",
    total: 6350,
    status: "Delivered",
    trackingId: "KMR-XP-8894",
    items: [
      { name: "Aurelia Gold Custom Earrings", quantity: 1 },
      { name: "Personalized Gift Box", quantity: 1 }
    ]
  }
];

export const customRequests: CustomOrderRequest[] = [
  {
    id: "CO-1049",
    customer: "Ifra Jan",
    type: "Cash Bouquet",
    budget: "Rs 8,000",
    status: "Pending",
    requestedFor: "2026-06-20",
    internalNote: "Client prefers ivory wrap and gold ribbon."
  },
  {
    id: "CO-1044",
    customer: "Mariya",
    type: "Custom Frame",
    budget: "Rs 3,500",
    status: "Approved",
    requestedFor: "2026-06-18",
    internalNote: "Price approved, awaiting payment."
  },
  {
    id: "CO-1039",
    customer: "Sana",
    type: "Personalized Gift",
    budget: "Rs 5,000",
    status: "Converted",
    requestedFor: "2026-06-12",
    internalNote: "Converted to order RB-24021."
  }
];

export const adminMetrics: AdminMetric[] = [
  { label: "Total Revenue", value: "Rs 8.42L", delta: "+18.4%" },
  { label: "Total Orders", value: "312", delta: "+11.2%" },
  { label: "Customers", value: "1,284", delta: "+24.1%" },
  { label: "Products", value: "86", delta: "+8 live" }
];

export const trendingSearches = [
  "custom earrings",
  "cash bouquet",
  "emerald suit",
  "personalized gift",
  "ivory hijab"
];

export const megaMenu = [
  {
    title: "Fashion",
    items: ["Suits", "Dresses", "Hijabs"]
  },
  {
    title: "Accessories",
    items: ["Custom Earrings", "Gift Items"]
  },
  {
    title: "Custom Creations",
    items: ["Custom Frames", "Cash Bouquets", "Personalized Gifts"]
  },
  {
    title: "Featured",
    items: ["New Arrivals", "Best Sellers", "Editor's Picks"]
  }
];

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
  return products
    .filter((candidate) => candidate.id !== product.id && candidate.category === product.category)
    .slice(0, 4);
}
