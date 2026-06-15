"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ComponentPropsWithoutRef, type ReactNode } from "react";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  CheckCircle2,
  ClipboardCopy,
  Download,
  Eye,
  FileText,
  Filter,
  Gift,
  Globe2,
  Inbox,
  Mail,
  Package,
  PackageCheck,
  Pencil,
  Phone,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Send,
  Settings as SettingsIcon,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Tag,
  Trash2,
  Truck,
  Undo2,
  UploadCloud,
  Users,
  Warehouse,
  XCircle,
  type LucideIcon
} from "lucide-react";
import {
  AdminSidebar,
  adminModules,
  type AdminModuleLabel
} from "@/components/admin/admin-sidebar";
import { CatalogManager } from "@/components/admin/catalog-manager";
import { usePersistentState } from "@/components/admin/use-persistent-state";
import { useToast } from "@/components/providers/toast-provider";
import { customRequests, products, sampleOrders } from "@/data/store";
import {
  ADMIN_CUSTOM_ORDERS_KEY,
  ADMIN_MESSAGES_KEY,
  ADMIN_REVIEWS_KEY,
  ADMIN_SETTINGS_KEY
} from "@/lib/admin-store";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { CustomOrderRequest, Order } from "@/types/commerce";

type ManagedOrder = Order & {
  customer: string;
  phone: string;
  payment: "Paid" | "COD" | "Pending";
  channel: "Website" | "WhatsApp" | "Manual";
  address: string;
  notes: string;
};

type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  image: string;
  category: string;
  stock: number;
  reserved: number;
  reorderAt: number;
  status: string;
  location: string;
};

type CustomerGroup = "Regular" | "VIP" | "Wholesale" | "New";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  group: CustomerGroup;
  orders: number;
  totalSpend: number;
  lastOrder: string;
  notes: string;
};

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
  status: "New" | "Replied" | "Closed";
  date: string;
  replyNote: string;
};

type Coupon = {
  id: string;
  code: string;
  title: string;
  kind: "Percent" | "Fixed" | "Free shipping";
  value: number;
  minOrder: number;
  usage: number;
  limit: number;
  status: "Active" | "Paused" | "Scheduled" | "Expired";
  endsAt: string;
};

type ReviewStatus = "Pending" | "Approved" | "Rejected";

type CustomOrderStage =
  | "Request"
  | "Review"
  | "Quote"
  | "Payment"
  | "Making"
  | "Dispatch"
  | "Completed";

type AdminCustomOrderRequest = CustomOrderRequest & {
  phone?: string;
  email?: string;
  quantity?: number;
  description?: string;
  referenceImage?: string;
  referenceLinks?: string;
  stage: CustomOrderStage;
  quotedPrice: number;
  advancePaid: number;
  paymentStatus: "Unpaid" | "Advance paid" | "Paid";
};

type ReviewItem = {
  id: string;
  product: string;
  productId?: string;
  customer: string;
  rating: number;
  text: string;
  status: ReviewStatus;
  date: string;
};

type ReturnStatus = "Requested" | "Need photos" | "Approved" | "Rejected" | "Refunded";

type ReturnRequest = {
  id: string;
  orderId: string;
  customer: string;
  item: string;
  reason: string;
  amount: number;
  status: ReturnStatus;
};

type ContentBlock = {
  id: string;
  area: string;
  title: string;
  status: "Live" | "Draft";
  priority: number;
  lastEdited: string;
};

type StoreSettings = {
  storeName: string;
  supportPhone: string;
  supportEmail: string;
  whatsappNumber: string;
  supportAddress: string;
  contactIntro: string;
  deliveryFee: number;
  freeShippingAt: number;
  codEnabled: boolean;
  whatsappAlerts: boolean;
  lowStockEmail: boolean;
  maintenanceMode: boolean;
};

const inputClass =
  "h-9 w-full rounded border border-[#8c8f94] bg-white px-3 text-sm text-[#1d2327] outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]";
const textareaClass =
  "min-h-20 w-full rounded border border-[#8c8f94] bg-white px-3 py-2 text-sm text-[#1d2327] outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]";

const orderStatuses: Order["status"][] = [
  "Confirmed",
  "Preparing",
  "Dispatched",
  "Delivered",
  "Return requested"
];

const initialOrders: ManagedOrder[] = [
  {
    ...sampleOrders[0],
    customer: "Ifra Jan",
    phone: "+91 70060 11492",
    payment: "Paid",
    channel: "Website",
    address: "Srinagar, Kashmir",
    notes: "Gift wrap requested."
  },
  {
    ...sampleOrders[1],
    customer: "Mariya",
    phone: "+91 78898 44031",
    payment: "Paid",
    channel: "WhatsApp",
    address: "Budgam, Kashmir",
    notes: "Call before dispatch."
  },
  {
    id: "RB-24021",
    date: "2026-06-12",
    total: 5000,
    status: "Preparing",
    trackingId: "KMR-XP-9128",
    items: [{ name: "Signature Cash Bouquet", quantity: 1 }],
    customer: "Sana",
    phone: "+91 99065 22811",
    payment: "Pending",
    channel: "Manual",
    address: "Anantnag, Kashmir",
    notes: "Converted from custom request CO-1039."
  },
  {
    id: "RB-24025",
    date: "2026-06-14",
    total: 10450,
    status: "Confirmed",
    trackingId: "Not assigned",
    items: [
      { name: "Editorial Black Dress", quantity: 1 },
      { name: "Pearl Line Earrings", quantity: 1 }
    ],
    customer: "Aaliya",
    phone: "+91 95961 74502",
    payment: "COD",
    channel: "Website",
    address: "Baramulla, Kashmir",
    notes: "COD confirmation pending."
  }
];

const initialInventory: InventoryItem[] = products.map((product, index) => ({
  id: product.id,
  sku: `RIDA-${String(index + 1).padStart(3, "0")}`,
  name: product.name,
  image: product.image,
  category: product.category.replaceAll("-", " "),
  stock: product.stock,
  reserved: index % 3,
  reorderAt: product.stock <= 5 ? 8 : 5,
  status: product.stockStatus,
  location: index % 2 === 0 ? "Srinagar shelf A" : "Srinagar shelf B"
}));

const initialCustomOrderRows: AdminCustomOrderRequest[] = customRequests.map((request, index) => ({
  ...request,
  phone: ["+91 70060 11992", "+91 78898 55021", "+91 99065 33012"][index],
  email: ["ifra@example.com", "mariya@example.com", "sana@example.com"][index],
  quantity: 1,
  description: request.internalNote || "Admin seeded custom order request.",
  referenceImage: "",
  referenceLinks: "",
  stage: request.status === "Converted" ? "Completed" : request.status === "Approved" ? "Quote" : "Review",
  quotedPrice: index === 0 ? 8000 : index === 1 ? 3500 : 5000,
  advancePaid: index === 2 ? 5000 : 0,
  paymentStatus: index === 2 ? "Paid" : index === 1 ? "Advance paid" : "Unpaid"
}));

const customOrderStages: CustomOrderStage[] = [
  "Request",
  "Review",
  "Quote",
  "Payment",
  "Making",
  "Dispatch",
  "Completed"
];

const initialCustomers: Customer[] = [
  {
    id: "CUS-1001",
    name: "Ifra Jan",
    phone: "+91 70060 11492",
    email: "ifra@example.com",
    group: "VIP",
    orders: 8,
    totalSpend: 42000,
    lastOrder: "2026-06-14",
    notes: "Prefers ivory and gold packing."
  },
  {
    id: "CUS-1002",
    name: "Mariya",
    phone: "+91 78898 44031",
    email: "mariya@example.com",
    group: "Regular",
    orders: 4,
    totalSpend: 18500,
    lastOrder: "2026-06-11",
    notes: "Usually orders custom frames."
  },
  {
    id: "CUS-1003",
    name: "Sana",
    phone: "+91 99065 22811",
    email: "sana@example.com",
    group: "New",
    orders: 1,
    totalSpend: 5000,
    lastOrder: "2026-06-12",
    notes: "Converted from custom order."
  },
  {
    id: "CUS-1004",
    name: "Aaliya",
    phone: "+91 95961 74502",
    email: "aaliya@example.com",
    group: "Wholesale",
    orders: 12,
    totalSpend: 112000,
    lastOrder: "2026-06-03",
    notes: "Bulk gift hamper buyer."
  }
];

const initialMessages: ContactMessage[] = [
  {
    id: "MSG-1001",
    name: "Hiba",
    email: "hiba@example.com",
    phone: "+91 70060 77881",
    topic: "Order Support",
    message: "Please confirm delivery timing for RB-24018.",
    status: "New",
    date: "2026-06-14",
    replyNote: ""
  },
  {
    id: "MSG-1002",
    name: "Zoya",
    email: "zoya@example.com",
    phone: "+91 99065 44120",
    topic: "Custom Order",
    message: "Can I send a reference image for a cash bouquet?",
    status: "Replied",
    date: "2026-06-13",
    replyNote: "Asked customer to share references on WhatsApp."
  }
];


const emptyCoupon: Coupon = {
  id: "",
  code: "",
  title: "",
  kind: "Percent",
  value: 10,
  minOrder: 0,
  usage: 0,
  limit: 100,
  status: "Active",
  endsAt: "2026-07-15"
};

const initialCoupons: Coupon[] = [
  {
    id: "CPN-1",
    code: "RIDA10",
    title: "10% first order discount",
    kind: "Percent",
    value: 10,
    minOrder: 1200,
    usage: 18,
    limit: 100,
    status: "Active",
    endsAt: "2026-07-15"
  },
  {
    id: "CPN-2",
    code: "FREEKMR",
    title: "Free delivery over Rs 4,999",
    kind: "Free shipping",
    value: 0,
    minOrder: 4999,
    usage: 41,
    limit: 500,
    status: "Active",
    endsAt: "2026-08-01"
  },
  {
    id: "CPN-3",
    code: "FESTIVE500",
    title: "Festival campaign discount",
    kind: "Fixed",
    value: 500,
    minOrder: 3999,
    usage: 0,
    limit: 150,
    status: "Scheduled",
    endsAt: "2026-08-25"
  }
];

const initialReviews: ReviewItem[] = [
  {
    id: "REV-1001",
    product: "Noor Emerald Evening Suit",
    customer: "Hiba",
    rating: 5,
    text: "Premium stitching and fast delivery.",
    status: "Pending",
    date: "2026-06-13"
  },
  {
    id: "REV-1002",
    product: "Aurelia Gold Custom Earrings",
    customer: "Zoya",
    rating: 4,
    text: "Good finish, packaging was lovely.",
    status: "Approved",
    date: "2026-06-08"
  },
  {
    id: "REV-1003",
    product: "Signature Cash Bouquet",
    customer: "Aaliya",
    rating: 5,
    text: "Exactly like the proof shared on WhatsApp.",
    status: "Pending",
    date: "2026-06-14"
  }
];

const initialReturns: ReturnRequest[] = [
  {
    id: "RET-501",
    orderId: "RB-24018",
    customer: "Ifra Jan",
    item: "Noor Emerald Evening Suit",
    reason: "Size exchange",
    amount: 7800,
    status: "Need photos"
  },
  {
    id: "RET-502",
    orderId: "RB-24011",
    customer: "Mariya",
    item: "Personalized Gift Box",
    reason: "Custom item policy check",
    amount: 4100,
    status: "Requested"
  }
];

const initialContentBlocks: ContentBlock[] = [
  { id: "CNT-1", area: "Homepage hero", title: "Crafted for Elegance", status: "Live", priority: 1, lastEdited: "2026-06-14" },
  { id: "CNT-2", area: "Announcement bar", title: "Kashmir-wide delivery available", status: "Live", priority: 2, lastEdited: "2026-06-12" },
  { id: "CNT-3", area: "Featured collections", title: "New arrivals and custom gifts", status: "Live", priority: 3, lastEdited: "2026-06-11" },
  { id: "CNT-4", area: "Footer policy", title: "Returns and refunds policy", status: "Draft", priority: 8, lastEdited: "2026-06-10" }
];

const initialSettings: StoreSettings = {
  storeName: "Rida Boutique",
  supportPhone: "+91 70060 11492",
  supportEmail: "support@ridaboutique.in",
  whatsappNumber: "+91 70060 11492",
  supportAddress: "Delivery across Kashmir",
  contactIntro: "Order support, custom order help, returns, collaborations, and WhatsApp assistance.",
  deliveryFee: 120,
  freeShippingAt: 4999,
  codEnabled: true,
  whatsappAlerts: true,
  lowStockEmail: true,
  maintenanceMode: false
};

const initialActivity = [
  "RB-24025 received from website checkout",
  "CO-1049 custom bouquet request needs pricing",
  "RIDA10 coupon redeemed 18 times",
  "Editorial Black Dress moved to low stock",
  "Homepage announcement updated"
];

const quickActions: Array<{
  label: string;
  target: AdminModuleLabel;
  icon: LucideIcon;
  description: string;
}> = [
  { label: "Add product", target: "Products", icon: Plus, description: "Create or edit catalog items" },
  { label: "Process orders", target: "Orders", icon: PackageCheck, description: "Update status and tracking" },
  { label: "Approve custom", target: "Custom Orders", icon: Gift, description: "Price and convert custom work" },
  { label: "Stock check", target: "Inventory", icon: Warehouse, description: "Adjust quantity and reorder levels" },
  { label: "Coupon builder", target: "Coupons", icon: Tag, description: "Create discounts and campaigns" },
  { label: "Support inbox", target: "Messages", icon: Inbox, description: "Reply to contact messages" },
  { label: "Review queue", target: "Reviews", icon: ShieldCheck, description: "Approve customer reviews" },
  { label: "Media library", target: "Media", icon: UploadCloud, description: "Check product images and URLs" },
  { label: "Homepage content", target: "Content", icon: FileText, description: "Edit banners and site copy" },
  { label: "Store settings", target: "Settings", icon: SettingsIcon, description: "Payments, shipping, alerts" }
];

export function AdminDashboard() {
  const [active, setActive] = useState<AdminModuleLabel>("Dashboard");
  const [command, setCommand] = useState("");
  const [orders, setOrders] = usePersistentState("rida-admin-orders", initialOrders);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderQuery, setOrderQuery] = useState("");
  const [bulkOrderStatus, setBulkOrderStatus] = useState<Order["status"]>("Preparing");
  const [inventoryItems, setInventoryItems] = usePersistentState(
    "rida-admin-inventory",
    initialInventory
  );
  const [inventoryQuery, setInventoryQuery] = useState("");
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState("all");
  const [selectedInventoryIds, setSelectedInventoryIds] = useState<string[]>([]);
  const [customOrderRows, setCustomOrderRows] = usePersistentState(
    ADMIN_CUSTOM_ORDERS_KEY,
    initialCustomOrderRows
  );
  const [customStatusFilter, setCustomStatusFilter] = useState("all");
  const [customers, setCustomers] = usePersistentState("rida-admin-customers", initialCustomers);
  const [messages, setMessages] = usePersistentState(ADMIN_MESSAGES_KEY, initialMessages);
  const [messageFilter, setMessageFilter] = useState("all");
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerGroupFilter, setCustomerGroupFilter] = useState("all");
  const [coupons, setCoupons] = usePersistentState("rida-admin-coupons", initialCoupons);
  const [couponDraft, setCouponDraft] = useState(emptyCoupon);
  const [couponFilter, setCouponFilter] = useState("all");
  const [reviews, setReviews] = usePersistentState(ADMIN_REVIEWS_KEY, initialReviews);
  const [reviewFilter, setReviewFilter] = useState("all");
  const [returns, setReturns] = usePersistentState("rida-admin-returns", initialReturns);
  const [contentBlocks, setContentBlocks] = usePersistentState(
    "rida-admin-content",
    initialContentBlocks
  );
  const [settings, setSettings] = usePersistentState(ADMIN_SETTINGS_KEY, initialSettings);
  const [activityFeed, setActivityFeed] = usePersistentState(
    "rida-admin-activity",
    initialActivity
  );
  const [quickDraft, setQuickDraft] = useState({ title: "", note: "" });
  const [reportRange, setReportRange] = useState("7 days");
  const [importJson, setImportJson] = useState("");
  const { toast } = useToast();
  const storeSettings = { ...initialSettings, ...settings };

  const lowStockItems = useMemo(
    () => inventoryItems.filter((item) => item.stock <= item.reorderAt),
    [inventoryItems]
  );

  const filteredOrders = useMemo(() => {
    const query = orderQuery.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus = orderStatusFilter === "all" || order.status === orderStatusFilter;
      const matchesQuery =
        !query ||
        order.id.toLowerCase().includes(query) ||
        order.customer.toLowerCase().includes(query) ||
        order.phone.toLowerCase().includes(query) ||
        order.trackingId.toLowerCase().includes(query);

      return matchesStatus && matchesQuery;
    });
  }, [orderQuery, orderStatusFilter, orders]);

  const filteredInventory = useMemo(() => {
    const query = inventoryQuery.trim().toLowerCase();

    return inventoryItems.filter((item) => {
      const matchesQuery =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);
      const matchesStatus =
        inventoryStatusFilter === "all" ||
        (inventoryStatusFilter === "low" && item.stock <= item.reorderAt) ||
        item.status === inventoryStatusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [inventoryItems, inventoryQuery, inventoryStatusFilter]);

  const filteredCustomOrders = useMemo(
    () =>
      customOrderRows.filter(
        (request) => customStatusFilter === "all" || request.status === customStatusFilter
      ),
    [customOrderRows, customStatusFilter]
  );

  const filteredMessages = useMemo(
    () => messages.filter((message) => messageFilter === "all" || message.status === messageFilter),
    [messageFilter, messages]
  );

  const filteredCustomers = useMemo(() => {
    const query = customerQuery.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesQuery =
        !query ||
        customer.name.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query);
      const matchesGroup = customerGroupFilter === "all" || customer.group === customerGroupFilter;

      return matchesQuery && matchesGroup;
    });
  }, [customerGroupFilter, customerQuery, customers]);

  const filteredCoupons = useMemo(
    () => coupons.filter((coupon) => couponFilter === "all" || coupon.status === couponFilter),
    [couponFilter, coupons]
  );

  const filteredReviews = useMemo(
    () => reviews.filter((review) => reviewFilter === "all" || review.status === reviewFilter),
    [reviewFilter, reviews]
  );

  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingReviews = reviews.filter((review) => review.status === "Pending").length;
  const pendingCustom = customOrderRows.filter((request) => request.status === "Pending").length;
  const selectedVisibleOrders = filteredOrders.filter((order) => selectedOrderIds.includes(order.id));
  const selectedVisibleInventory = filteredInventory.filter((item) => selectedInventoryIds.includes(item.id));
  const commandText = command.trim().toLowerCase();
  const commandActions = quickActions.filter(
    (action) =>
      !commandText ||
      action.label.toLowerCase().includes(commandText) ||
      action.description.toLowerCase().includes(commandText) ||
      action.target.toLowerCase().includes(commandText)
  );
  const moduleMatches = adminModules.filter(
    (module) => commandText && module.label.toLowerCase().includes(commandText)
  );

  function recordActivity(message: string) {
    setActivityFeed((current) => [message, ...current].slice(0, 8));
  }

  function updateOrder(orderId: string, patch: Partial<ManagedOrder>) {
    setOrders((current) =>
      current.map((order) => (order.id === orderId ? { ...order, ...patch } : order))
    );
  }

  function applyOrderBulk() {
    if (!selectedOrderIds.length) {
      toast({ kind: "info", title: "Select orders first" });
      return;
    }

    setOrders((current) =>
      current.map((order) =>
        selectedOrderIds.includes(order.id) ? { ...order, status: bulkOrderStatus } : order
      )
    );
    recordActivity(`${selectedOrderIds.length} orders moved to ${bulkOrderStatus}`);
    toast({ title: "Orders updated", description: `${selectedOrderIds.length} selected orders changed.` });
  }

  function updateInventory(itemId: string, patch: Partial<InventoryItem>) {
    setInventoryItems((current) =>
      current.map((item) => (item.id === itemId ? { ...item, ...patch } : item))
    );
  }

  function adjustSelectedInventory(amount: number) {
    if (!selectedInventoryIds.length) {
      toast({ kind: "info", title: "Select inventory rows first" });
      return;
    }

    setInventoryItems((current) =>
      current.map((item) =>
        selectedInventoryIds.includes(item.id)
          ? { ...item, stock: Math.max(0, item.stock + amount) }
          : item
      )
    );
    recordActivity(`Inventory adjusted for ${selectedInventoryIds.length} items`);
    toast({ title: "Inventory adjusted", description: `${amount > 0 ? "+" : ""}${amount} stock applied.` });
  }

  function updateCustomRequest(requestId: string, patch: Partial<AdminCustomOrderRequest>) {
    setCustomOrderRows((current) =>
      current.map((request) => (request.id === requestId ? { ...request, ...patch } : request))
    );
  }

  function updateCustomer(customerId: string, patch: Partial<Customer>) {
    setCustomers((current) =>
      current.map((customer) => (customer.id === customerId ? { ...customer, ...patch } : customer))
    );
  }

  function updateMessage(messageId: string, patch: Partial<ContactMessage>) {
    setMessages((current) =>
      current.map((message) => (message.id === messageId ? { ...message, ...patch } : message))
    );
  }

  function updateCouponDraft<K extends keyof Coupon>(key: K, value: Coupon[K]) {
    setCouponDraft((current) => ({ ...current, [key]: value }));
  }

  function saveCoupon() {
    if (!couponDraft.code.trim() || !couponDraft.title.trim()) {
      toast({ kind: "info", title: "Coupon code and title required" });
      return;
    }

    const nextCoupon = {
      ...couponDraft,
      id: couponDraft.id || `CPN-${Date.now()}`
    };

    setCoupons((current) =>
      couponDraft.id
        ? current.map((coupon) => (coupon.id === couponDraft.id ? nextCoupon : coupon))
        : [nextCoupon, ...current]
    );
    setCouponDraft(emptyCoupon);
    recordActivity(`${nextCoupon.code} coupon saved`);
    toast({ title: "Coupon saved", description: nextCoupon.code });
  }

  function updateReview(reviewId: string, status: ReviewStatus) {
    setReviews((current) =>
      current.map((review) => (review.id === reviewId ? { ...review, status } : review))
    );
    recordActivity(`Review ${reviewId} marked ${status}`);
    toast({ title: `Review ${status.toLowerCase()}` });
  }

  function updateReturn(returnId: string, patch: Partial<ReturnRequest>) {
    setReturns((current) =>
      current.map((request) => (request.id === returnId ? { ...request, ...patch } : request))
    );
  }

  function updateContentBlock(blockId: string, patch: Partial<ContentBlock>) {
    setContentBlocks((current) =>
      current.map((block) => (block.id === blockId ? { ...block, ...patch } : block))
    );
  }

  function updateSetting<K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function copyText(label: string, value: string) {
    if (!navigator.clipboard) {
      toast({ kind: "info", title: "Clipboard not available" });
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      toast({ title: `${label} copied` });
    } catch {
      toast({ kind: "info", title: "Copy blocked by browser" });
    }
  }

  function readStoredJson<T>(key: string, fallback: T): T {
    try {
      const storedValue = window.localStorage.getItem(key);
      return storedValue ? (JSON.parse(storedValue) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  function exportAdminData() {
    void copyText(
      "Admin data",
      JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          version: 1,
          products: readStoredJson("rida-admin-products", []),
          categories: readStoredJson("rida-admin-categories", []),
          orders,
          inventoryItems,
          customOrderRows,
          customers,
          messages,
          coupons,
          reviews,
          returns,
          contentBlocks,
          settings: storeSettings,
          activityFeed
        },
        null,
        2
      )
    );
  }

  function importAdminData() {
    try {
      const parsed = JSON.parse(importJson) as Partial<{
        products: unknown[];
        categories: unknown[];
        orders: ManagedOrder[];
        inventoryItems: InventoryItem[];
        customOrderRows: AdminCustomOrderRequest[];
        customers: Customer[];
        messages: ContactMessage[];
        coupons: Coupon[];
        reviews: ReviewItem[];
        returns: ReturnRequest[];
        contentBlocks: ContentBlock[];
        settings: StoreSettings;
        activityFeed: string[];
      }>;

      if (Array.isArray(parsed.products)) {
        window.localStorage.setItem("rida-admin-products", JSON.stringify(parsed.products));
      }

      if (Array.isArray(parsed.categories)) {
        window.localStorage.setItem("rida-admin-categories", JSON.stringify(parsed.categories));
      }

      if (Array.isArray(parsed.orders)) setOrders(parsed.orders);
      if (Array.isArray(parsed.inventoryItems)) setInventoryItems(parsed.inventoryItems);
      if (Array.isArray(parsed.customOrderRows)) setCustomOrderRows(parsed.customOrderRows);
      if (Array.isArray(parsed.customers)) setCustomers(parsed.customers);
      if (Array.isArray(parsed.messages)) setMessages(parsed.messages);
      if (Array.isArray(parsed.coupons)) setCoupons(parsed.coupons);
      if (Array.isArray(parsed.reviews)) setReviews(parsed.reviews);
      if (Array.isArray(parsed.returns)) setReturns(parsed.returns);
      if (Array.isArray(parsed.contentBlocks)) setContentBlocks(parsed.contentBlocks);
      if (parsed.settings) setSettings(parsed.settings);
      if (Array.isArray(parsed.activityFeed)) setActivityFeed(parsed.activityFeed);

      setImportJson("");
      recordActivity("Admin data imported");
      toast({ title: "Admin data imported", description: "Products refresh when you reopen Products." });
    } catch {
      toast({ kind: "info", title: "Invalid JSON", description: "Paste a valid admin export file." });
    }
  }

  function resetAdminData() {
    window.localStorage.removeItem("rida-admin-products");
    window.localStorage.removeItem("rida-admin-categories");
    setOrders(initialOrders);
    setInventoryItems(initialInventory);
    setCustomOrderRows(initialCustomOrderRows);
    setCustomers(initialCustomers);
    setMessages(initialMessages);
    setCoupons(initialCoupons);
    setReviews(initialReviews);
    setReturns(initialReturns);
    setContentBlocks(initialContentBlocks);
    setSettings(initialSettings);
    setActivityFeed(initialActivity);
    setImportJson("");
    toast({ title: "Admin data reset", description: "Catalog defaults reload when Products opens again." });
  }

  function saveQuickDraft() {
    if (!quickDraft.title.trim()) {
      toast({ kind: "info", title: "Draft title required" });
      return;
    }

    recordActivity(`Draft saved: ${quickDraft.title}`);
    setQuickDraft({ title: "", note: "" });
    toast({ title: "Draft saved" });
  }

  function renderDashboard() {
    const metrics = [
      { label: "Revenue", value: formatCurrency(revenue), helper: "from current order queue", icon: BarChart3 },
      { label: "Orders", value: String(orders.length), helper: `${selectedOrderIds.length} selected`, icon: ShoppingBag },
      { label: "Low stock", value: String(lowStockItems.length), helper: "items at reorder level", icon: AlertTriangle },
      { label: "Custom", value: String(pendingCustom), helper: "pending approvals", icon: Gift }
    ];

    return (
      <div className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <MetricBox helper={metric.helper} key={metric.label} label={metric.label} value={metric.value}>
                <Icon className="size-5" />
              </MetricBox>
            );
          })}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <Panel title="At a glance">
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                ["Inventory products", inventoryItems.length],
                ["Active coupons", coupons.filter((coupon) => coupon.status === "Active").length],
                ["Pending reviews", pendingReviews],
                ["Return requests", returns.filter((request) => request.status === "Requested").length],
                ["New messages", messages.filter((message) => message.status === "New").length],
                ["Customers", customers.length],
                ["Content blocks", contentBlocks.length]
              ].map(([label, value]) => (
                <div className="rounded border border-[#dcdcde] bg-[#f6f7f7] px-3 py-3" key={String(label)}>
                  <p className="text-xs text-[#646970]">{label}</p>
                  <p className="mt-1 text-xl font-semibold text-[#1d2327]">{value}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Quick draft">
            <div className="grid gap-2">
              <input
                className={inputClass}
                onChange={(event) => setQuickDraft((current) => ({ ...current, title: event.target.value }))}
                placeholder="Title"
                value={quickDraft.title}
              />
              <textarea
                className={textareaClass}
                onChange={(event) => setQuickDraft((current) => ({ ...current, note: event.target.value }))}
                placeholder="Note, task, product idea"
                value={quickDraft.note}
              />
              <AdminButton onClick={saveQuickDraft}>
                <Save className="size-4" />
                Save draft
              </AdminButton>
            </div>
          </Panel>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <Panel title="Recent orders">
            <SimpleTable>
              <thead>
                <tr>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 4).map((order) => (
                  <tr key={order.id}>
                    <TableCell>
                      <button
                        className="font-semibold text-[#2271b1] hover:underline"
                        onClick={() => setActive("Orders")}
                        type="button"
                      >
                        {order.id}
                      </button>
                      <p className="text-xs text-[#646970]">{order.customer}</p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>{formatCurrency(order.total)}</TableCell>
                  </tr>
                ))}
              </tbody>
            </SimpleTable>
          </Panel>

          <Panel title="Store health">
            <div className="grid gap-2 text-sm">
              <HealthRow icon={CheckCircle2} label="Checkout" value="Razorpay ready" />
              <HealthRow icon={Truck} label="Delivery" value="Kashmir courier active" />
              <HealthRow icon={Bell} label="Alerts" value={storeSettings.lowStockEmail ? "Low stock alerts on" : "Low stock alerts off"} />
              <HealthRow icon={ShieldCheck} label="Reviews" value={`${pendingReviews} pending moderation`} />
            </div>
          </Panel>

          <Panel title="Activity">
            <div className="grid gap-2">
              {activityFeed.map((item) => (
                <div className="border-b border-[#dcdcde] pb-2 text-sm text-[#1d2327]" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    );
  }

  function renderOrders() {
    const allVisibleSelected =
      filteredOrders.length > 0 && filteredOrders.every((order) => selectedOrderIds.includes(order.id));

    return (
      <Panel
        action={
          <AdminButton onClick={() => toast({ title: "Manual order screen ready" })}>
            <Plus className="size-4" />
            New order
          </AdminButton>
        }
        title="Orders"
      >
        <div className="mb-3 grid gap-2 xl:grid-cols-[1fr_auto]">
          <SearchInput
            onChange={setOrderQuery}
            placeholder="Search order, customer, phone, tracking"
            value={orderQuery}
          />
          <div className="flex flex-wrap gap-2">
            <select
              className={inputClass}
              onChange={(event) => setOrderStatusFilter(event.target.value)}
              value={orderStatusFilter}
            >
              <option value="all">All statuses</option>
              {orderStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <select
              className={inputClass}
              onChange={(event) => setBulkOrderStatus(event.target.value as Order["status"])}
              value={bulkOrderStatus}
            >
              {orderStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <AdminButton onClick={applyOrderBulk} variant="secondary">
              <RefreshCcw className="size-4" />
              Apply
            </AdminButton>
          </div>
        </div>

        <BulkLine count={selectedVisibleOrders.length} label="orders selected" />

        <SimpleTable minWidth="1120px">
          <thead>
            <tr>
              <TableHead className="w-10">
                <input
                  checked={allVisibleSelected}
                  onChange={(event) =>
                    setSelectedOrderIds(event.target.checked ? filteredOrders.map((order) => order.id) : [])
                  }
                  type="checkbox"
                />
              </TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Tracking</TableHead>
              <TableHead>Notes</TableHead>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <TableCell>
                  <input
                    checked={selectedOrderIds.includes(order.id)}
                    onChange={() => setSelectedOrderIds((current) => toggleId(current, order.id))}
                    type="checkbox"
                  />
                </TableCell>
                <TableCell>
                  <p className="font-semibold text-[#2271b1]">{order.id}</p>
                  <p className="text-xs text-[#646970]">{formatDate(order.date)} | {order.channel}</p>
                </TableCell>
                <TableCell>
                  <p>{order.customer}</p>
                  <p className="text-xs text-[#646970]">{order.phone}</p>
                </TableCell>
                <TableCell>
                  <select
                    className={inputClass}
                    onChange={(event) => {
                      updateOrder(order.id, { status: event.target.value as Order["status"] });
                      recordActivity(`${order.id} moved to ${event.target.value}`);
                    }}
                    value={order.status}
                  >
                    {orderStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </TableCell>
                <TableCell>{formatCurrency(order.total)}</TableCell>
                <TableCell>
                  <StatusBadge status={order.payment} />
                </TableCell>
                <TableCell>
                  <input
                    className={inputClass}
                    onChange={(event) => updateOrder(order.id, { trackingId: event.target.value })}
                    value={order.trackingId}
                  />
                </TableCell>
                <TableCell>
                  <input
                    className={inputClass}
                    onChange={(event) => updateOrder(order.id, { notes: event.target.value })}
                    value={order.notes}
                  />
                </TableCell>
              </tr>
            ))}
          </tbody>
        </SimpleTable>
      </Panel>
    );
  }

  function renderInventory(onlyLowStock = false) {
    const rows = onlyLowStock ? filteredInventory.filter((item) => item.stock <= item.reorderAt) : filteredInventory;
    const allVisibleSelected =
      rows.length > 0 && rows.every((item) => selectedInventoryIds.includes(item.id));

    return (
      <Panel
        action={
          <AdminButton onClick={() => copyText("Inventory", JSON.stringify(inventoryItems, null, 2))} variant="secondary">
            <Download className="size-4" />
            Export
          </AdminButton>
        }
        title={onlyLowStock ? "Low Stock" : "Inventory"}
      >
        <div className="mb-3 grid gap-2 xl:grid-cols-[1fr_auto]">
          <SearchInput
            onChange={setInventoryQuery}
            placeholder="Search product, SKU, category"
            value={inventoryQuery}
          />
          <div className="flex flex-wrap gap-2">
            <select
              className={inputClass}
              onChange={(event) => setInventoryStatusFilter(event.target.value)}
              value={inventoryStatusFilter}
            >
              <option value="all">All inventory</option>
              <option value="low">Low stock</option>
              <option value="In stock">In stock</option>
              <option value="Low stock">Low stock status</option>
              <option value="Made to order">Made to order</option>
              <option value="Sold out">Sold out</option>
            </select>
            <AdminButton onClick={() => adjustSelectedInventory(5)} variant="secondary">
              <Plus className="size-4" />
              Add 5
            </AdminButton>
            <AdminButton onClick={() => adjustSelectedInventory(-1)} variant="secondary">
              <Undo2 className="size-4" />
              Remove 1
            </AdminButton>
          </div>
        </div>

        <BulkLine count={selectedVisibleInventory.length} label="inventory rows selected" />

        <SimpleTable minWidth="980px">
          <thead>
            <tr>
              <TableHead className="w-10">
                <input
                  checked={allVisibleSelected}
                  onChange={(event) =>
                    setSelectedInventoryIds(event.target.checked ? rows.map((item) => item.id) : [])
                  }
                  type="checkbox"
                />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Reserved</TableHead>
              <TableHead>Reorder at</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id}>
                <TableCell>
                  <input
                    checked={selectedInventoryIds.includes(item.id)}
                    onChange={() => setSelectedInventoryIds((current) => toggleId(current, item.id))}
                    type="checkbox"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <AdminThumbnail name={item.name} src={item.image} />
                    <div className="min-w-0">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs capitalize text-[#646970]">{item.category}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{item.sku}</TableCell>
                <TableCell>
                  <input
                    className={cn(inputClass, item.stock <= item.reorderAt && "border-[#b32d2e] text-[#b32d2e]")}
                    min={0}
                    onChange={(event) => updateInventory(item.id, { stock: Number(event.target.value) || 0 })}
                    type="number"
                    value={item.stock}
                  />
                </TableCell>
                <TableCell>{item.reserved}</TableCell>
                <TableCell>
                  <input
                    className={inputClass}
                    min={0}
                    onChange={(event) => updateInventory(item.id, { reorderAt: Number(event.target.value) || 0 })}
                    type="number"
                    value={item.reorderAt}
                  />
                </TableCell>
                <TableCell>
                  <select
                    className={inputClass}
                    onChange={(event) => updateInventory(item.id, { status: event.target.value })}
                    value={item.status}
                  >
                    <option>In stock</option>
                    <option>Low stock</option>
                    <option>Made to order</option>
                    <option>Sold out</option>
                  </select>
                </TableCell>
                <TableCell>
                  <input
                    className={inputClass}
                    onChange={(event) => updateInventory(item.id, { location: event.target.value })}
                    value={item.location}
                  />
                </TableCell>
              </tr>
            ))}
          </tbody>
        </SimpleTable>
      </Panel>
    );
  }

  function renderCustomOrders() {
    return (
      <Panel title="Custom Orders">
        <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="grid gap-2 sm:grid-cols-4 xl:grid-cols-7">
            {customOrderStages.map((stage) => (
              <div className="rounded border border-[#dcdcde] bg-[#f6f7f7] px-3 py-2" key={stage}>
                <p className="text-xs text-[#646970]">{stage}</p>
                <p className="text-lg font-semibold">
                  {customOrderRows.filter((request) => (request.stage || "Request") === stage).length}
                </p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="size-4 text-[#646970]" />
            <select
              className={inputClass}
              onChange={(event) => setCustomStatusFilter(event.target.value)}
              value={customStatusFilter}
            >
              <option value="all">All requests</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
              <option>Converted</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredCustomOrders.map((request) => {
            const stage = customOrderStages.includes(request.stage) ? request.stage : "Request";
            const stageIndex = Math.max(0, customOrderStages.indexOf(stage));
            const progress = ((stageIndex + 1) / customOrderStages.length) * 100;
            const paymentStatus = request.paymentStatus || "Unpaid";
            const quotedPrice = Number(request.quotedPrice) || 0;
            const advancePaid = Number(request.advancePaid) || 0;

            return (
              <article className="rounded border border-[#c3c4c7] bg-white p-4" key={request.id}>
                <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
                  <div className="min-w-0">
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                      <div>
                        <p className="text-xs font-semibold uppercase text-[#646970]">{request.id}</p>
                        <h3 className="mt-1 text-lg font-semibold text-[#1d2327]">
                          {request.customer} | {request.type}
                        </h3>
                        <p className="mt-1 text-sm text-[#646970]">
                          Due {formatDate(request.requestedFor)} | Budget {request.budget}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge status={request.status} />
                        <StatusBadge status={paymentStatus} />
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between text-xs text-[#646970]">
                        <span>Process</span>
                        <span>{stage}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded bg-[#dcdcde]">
                        <div className="h-full bg-[#2271b1]" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="mt-2 grid grid-cols-4 gap-1 text-[11px] text-[#646970] md:grid-cols-7">
                        {customOrderStages.map((stage) => (
                          <span
                            className={cn(stageIndex >= customOrderStages.indexOf(stage) && "font-semibold text-[#2271b1]")}
                            key={stage}
                          >
                            {stage}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <Field label="Stage">
                        <select
                          className={inputClass}
                          onChange={(event) =>
                            updateCustomRequest(request.id, {
                              stage: event.target.value as CustomOrderStage
                            })
                          }
                          value={stage}
                        >
                          {customOrderStages.map((stage) => (
                            <option key={stage}>{stage}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Status">
                        <select
                          className={inputClass}
                          onChange={(event) =>
                            updateCustomRequest(request.id, {
                              status: event.target.value as CustomOrderRequest["status"]
                            })
                          }
                          value={request.status}
                        >
                          <option>Pending</option>
                          <option>Approved</option>
                          <option>Rejected</option>
                          <option>Converted</option>
                        </select>
                      </Field>
                      <Field label="Payment">
                        <select
                          className={inputClass}
                          onChange={(event) =>
                            updateCustomRequest(request.id, {
                              paymentStatus: event.target.value as AdminCustomOrderRequest["paymentStatus"]
                            })
                          }
                          value={paymentStatus}
                        >
                          <option>Unpaid</option>
                          <option>Advance paid</option>
                          <option>Paid</option>
                        </select>
                      </Field>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <Field label="Quote price">
                        <input
                          className={inputClass}
                          min={0}
                          onChange={(event) => updateCustomRequest(request.id, { quotedPrice: Number(event.target.value) || 0 })}
                          type="number"
                          value={quotedPrice}
                        />
                      </Field>
                      <Field label="Advance paid">
                        <input
                          className={inputClass}
                          min={0}
                          onChange={(event) => updateCustomRequest(request.id, { advancePaid: Number(event.target.value) || 0 })}
                          type="number"
                          value={advancePaid}
                        />
                      </Field>
                      <Field label="Balance">
                        <input
                          className={inputClass}
                          readOnly
                          value={formatCurrency(Math.max(0, quotedPrice - advancePaid))}
                        />
                      </Field>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="rounded border border-[#dcdcde] bg-[#f6f7f7] p-3 text-sm">
                      <p className="font-semibold text-[#1d2327]">Customer brief</p>
                      <p className="mt-2 text-[#646970]">{request.description || request.internalNote}</p>
                      <p className="mt-2 text-xs text-[#646970]">
                        {request.phone || "No phone"} | {request.email || "No email"}
                      </p>
                    </div>
                    <Field label="Internal note">
                      <textarea
                        className={textareaClass}
                        onChange={(event) => updateCustomRequest(request.id, { internalNote: event.target.value })}
                        value={request.internalNote || ""}
                      />
                    </Field>
                    <div className="flex flex-wrap gap-1">
                      <AdminButton
                        onClick={() => {
                          updateCustomRequest(request.id, {
                            status: "Approved",
                            stage: "Quote"
                          });
                          recordActivity(`${request.id} approved and moved to quote`);
                        }}
                        variant="secondary"
                      >
                        <CheckCircle2 className="size-4" />
                        Approve
                      </AdminButton>
                      <AdminButton
                        onClick={() => {
                          updateCustomRequest(request.id, {
                            status: "Converted",
                            stage: "Completed",
                            paymentStatus: "Paid"
                          });
                          recordActivity(`${request.id} completed`);
                        }}
                      >
                        <PackageCheck className="size-4" />
                        Complete
                      </AdminButton>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Panel>
    );
  }

  function renderMessages() {
    return (
      <Panel title="Messages">
        <div className="mb-3 flex flex-wrap gap-2">
          <select
            className={inputClass}
            onChange={(event) => setMessageFilter(event.target.value)}
            value={messageFilter}
          >
            <option value="all">All messages</option>
            <option>New</option>
            <option>Replied</option>
            <option>Closed</option>
          </select>
        </div>
        <SimpleTable minWidth="980px">
          <thead>
            <tr>
              <TableHead>Customer</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reply note</TableHead>
              <TableHead>Actions</TableHead>
            </tr>
          </thead>
          <tbody>
            {filteredMessages.map((message) => (
              <tr key={message.id}>
                <TableCell>
                  <p className="font-semibold text-[#2271b1]">{message.name}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-[#646970]">
                    <Mail className="size-3" />
                    {message.email}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-[#646970]">
                    <Phone className="size-3" />
                    {message.phone || "No phone"}
                  </p>
                </TableCell>
                <TableCell>
                  <p>{message.topic}</p>
                  <p className="mt-1 text-xs text-[#646970]">{formatDate(message.date)}</p>
                </TableCell>
                <TableCell>
                  <p className="max-w-sm text-sm leading-6">{message.message}</p>
                </TableCell>
                <TableCell>
                  <select
                    className={inputClass}
                    onChange={(event) =>
                      updateMessage(message.id, { status: event.target.value as ContactMessage["status"] })
                    }
                    value={message.status}
                  >
                    <option>New</option>
                    <option>Replied</option>
                    <option>Closed</option>
                  </select>
                </TableCell>
                <TableCell>
                  <textarea
                    className={textareaClass}
                    onChange={(event) => updateMessage(message.id, { replyNote: event.target.value })}
                    placeholder="Internal reply note"
                    value={message.replyNote}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <AdminButton
                      onClick={() => {
                        updateMessage(message.id, { status: "Replied" });
                        recordActivity(`${message.id} marked replied`);
                      }}
                      variant="secondary"
                    >
                      <Send className="size-4" />
                      Replied
                    </AdminButton>
                    <AdminButton
                      onClick={() =>
                        setMessages((current) => current.filter((item) => item.id !== message.id))
                      }
                      variant="danger"
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </AdminButton>
                  </div>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </SimpleTable>
      </Panel>
    );
  }

  function renderCustomers() {
    return (
      <Panel
        action={
          <AdminButton onClick={() => copyText("Customers", JSON.stringify(customers, null, 2))} variant="secondary">
            <Download className="size-4" />
            Export
          </AdminButton>
        }
        title="Customers"
      >
        <div className="mb-3 grid gap-2 xl:grid-cols-[1fr_auto]">
          <SearchInput onChange={setCustomerQuery} placeholder="Search customers" value={customerQuery} />
          <select
            className={inputClass}
            onChange={(event) => setCustomerGroupFilter(event.target.value)}
            value={customerGroupFilter}
          >
            <option value="all">All groups</option>
            <option>VIP</option>
            <option>Regular</option>
            <option>Wholesale</option>
            <option>New</option>
          </select>
        </div>

        <div className="mb-4 grid gap-2 sm:grid-cols-4">
          {(["VIP", "Regular", "Wholesale", "New"] as CustomerGroup[]).map((group) => (
            <div className="rounded border border-[#dcdcde] bg-[#f6f7f7] px-3 py-2" key={group}>
              <p className="text-xs text-[#646970]">{group}</p>
              <p className="text-lg font-semibold">
                {customers.filter((customer) => customer.group === group).length}
              </p>
            </div>
          ))}
        </div>

        <SimpleTable minWidth="980px">
          <thead>
            <tr>
              <TableHead>Customer</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total spend</TableHead>
              <TableHead>Last order</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Actions</TableHead>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer.id}>
                <TableCell>
                  <p className="font-semibold text-[#2271b1]">{customer.name}</p>
                  <p className="text-xs text-[#646970]">{customer.phone} | {customer.email}</p>
                </TableCell>
                <TableCell>
                  <select
                    className={inputClass}
                    onChange={(event) => updateCustomer(customer.id, { group: event.target.value as CustomerGroup })}
                    value={customer.group}
                  >
                    <option>VIP</option>
                    <option>Regular</option>
                    <option>Wholesale</option>
                    <option>New</option>
                  </select>
                </TableCell>
                <TableCell>{customer.orders}</TableCell>
                <TableCell>{formatCurrency(customer.totalSpend)}</TableCell>
                <TableCell>{formatDate(customer.lastOrder)}</TableCell>
                <TableCell>
                  <input
                    className={inputClass}
                    onChange={(event) => updateCustomer(customer.id, { notes: event.target.value })}
                    value={customer.notes}
                  />
                </TableCell>
                <TableCell>
                  <AdminButton
                    onClick={() => toast({ title: "Order draft opened", description: customer.name })}
                    variant="secondary"
                  >
                    <Plus className="size-4" />
                    Order
                  </AdminButton>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </SimpleTable>
      </Panel>
    );
  }

  function renderCoupons() {
    return (
      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <Panel title={couponDraft.id ? "Edit coupon" : "Add coupon"}>
          <div className="grid gap-3">
            <Field label="Code">
              <input
                className={inputClass}
                onChange={(event) => updateCouponDraft("code", event.target.value.toUpperCase())}
                value={couponDraft.code}
              />
            </Field>
            <Field label="Title">
              <input
                className={inputClass}
                onChange={(event) => updateCouponDraft("title", event.target.value)}
                value={couponDraft.title}
              />
            </Field>
            <div className="grid gap-2 sm:grid-cols-2">
              <Field label="Type">
                <select
                  className={inputClass}
                  onChange={(event) => updateCouponDraft("kind", event.target.value as Coupon["kind"])}
                  value={couponDraft.kind}
                >
                  <option>Percent</option>
                  <option>Fixed</option>
                  <option>Free shipping</option>
                </select>
              </Field>
              <Field label="Value">
                <input
                  className={inputClass}
                  min={0}
                  onChange={(event) => updateCouponDraft("value", Number(event.target.value) || 0)}
                  type="number"
                  value={couponDraft.value}
                />
              </Field>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Field label="Min order">
                <input
                  className={inputClass}
                  min={0}
                  onChange={(event) => updateCouponDraft("minOrder", Number(event.target.value) || 0)}
                  type="number"
                  value={couponDraft.minOrder}
                />
              </Field>
              <Field label="Usage limit">
                <input
                  className={inputClass}
                  min={1}
                  onChange={(event) => updateCouponDraft("limit", Number(event.target.value) || 1)}
                  type="number"
                  value={couponDraft.limit}
                />
              </Field>
            </div>
            <Field label="Status">
              <select
                className={inputClass}
                onChange={(event) => updateCouponDraft("status", event.target.value as Coupon["status"])}
                value={couponDraft.status}
              >
                <option>Active</option>
                <option>Paused</option>
                <option>Scheduled</option>
                <option>Expired</option>
              </select>
            </Field>
            <Field label="Ends at">
              <input
                className={inputClass}
                onChange={(event) => updateCouponDraft("endsAt", event.target.value)}
                type="date"
                value={couponDraft.endsAt}
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              <AdminButton onClick={saveCoupon}>
                <Save className="size-4" />
                Save
              </AdminButton>
              {couponDraft.id ? (
                <AdminButton onClick={() => setCouponDraft(emptyCoupon)} variant="secondary">
                  <XCircle className="size-4" />
                  Cancel
                </AdminButton>
              ) : null}
            </div>
          </div>
        </Panel>

        <Panel title="Coupons">
          <div className="mb-3 flex flex-wrap gap-2">
            <select
              className={inputClass}
              onChange={(event) => setCouponFilter(event.target.value)}
              value={couponFilter}
            >
              <option value="all">All coupons</option>
              <option>Active</option>
              <option>Paused</option>
              <option>Scheduled</option>
              <option>Expired</option>
            </select>
          </div>
          <SimpleTable minWidth="860px">
            <thead>
              <tr>
                <TableHead>Code</TableHead>
                <TableHead>Offer</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Minimum</TableHead>
                <TableHead>Ends</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Controls</TableHead>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.map((coupon) => (
                <tr key={coupon.id}>
                  <TableCell className="font-semibold text-[#2271b1]">{coupon.code}</TableCell>
                  <TableCell>
                    <p>{coupon.title}</p>
                    <p className="text-xs text-[#646970]">
                      {coupon.kind} {coupon.value ? coupon.value : ""}
                    </p>
                  </TableCell>
                  <TableCell>{coupon.usage} / {coupon.limit}</TableCell>
                  <TableCell>{coupon.minOrder ? formatCurrency(coupon.minOrder) : "None"}</TableCell>
                  <TableCell>{formatDate(coupon.endsAt)}</TableCell>
                  <TableCell>
                    <StatusBadge status={coupon.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <AdminButton onClick={() => setCouponDraft(coupon)} variant="secondary">
                        <Pencil className="size-4" />
                        Edit
                      </AdminButton>
                      <AdminButton
                        onClick={() =>
                          setCoupons((current) =>
                            current.map((item) =>
                              item.id === coupon.id
                                ? { ...item, status: item.status === "Active" ? "Paused" : "Active" }
                                : item
                            )
                          )
                        }
                        variant="secondary"
                      >
                        <RefreshCcw className="size-4" />
                        Toggle
                      </AdminButton>
                      <IconButton
                        label="Delete"
                        onClick={() => setCoupons((current) => current.filter((item) => item.id !== coupon.id))}
                        variant="danger"
                      >
                        <Trash2 className="size-4" />
                      </IconButton>
                    </div>
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </SimpleTable>
        </Panel>
      </div>
    );
  }

  function renderReviews() {
    const approvedReviews = reviews.filter((review) => review.status === "Approved");
    const reviewAverage = approvedReviews.length
      ? approvedReviews.reduce((sum, review) => sum + review.rating, 0) / approvedReviews.length
      : 0;
    const ratingCounts = [5, 4, 3, 2, 1].map((ratingValue) => ({
      rating: ratingValue,
      count: approvedReviews.filter((review) => review.rating === ratingValue).length
    }));
    const maxRatingCount = Math.max(1, ...ratingCounts.map((item) => item.count));

    return (
      <div className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricBox helper="approved reviews only" label="Average rating" value={reviewAverage.toFixed(1)}>
            <Star className="size-5" />
          </MetricBox>
          <MetricBox helper="waiting for approval" label="Pending" value={String(pendingReviews)}>
            <ShieldCheck className="size-5" />
          </MetricBox>
          <MetricBox helper="visible on product pages" label="Published" value={String(approvedReviews.length)}>
            <CheckCircle2 className="size-5" />
          </MetricBox>
          <MetricBox helper="all submitted reviews" label="Total" value={String(reviews.length)}>
            <Inbox className="size-5" />
          </MetricBox>
        </div>

        <Panel title="Reviews">
          <div className="mb-3 flex flex-wrap gap-2">
            <select
              className={inputClass}
              onChange={(event) => setReviewFilter(event.target.value)}
              value={reviewFilter}
            >
              <option value="all">All reviews</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_280px]">
            <SimpleTable minWidth="900px">
              <thead>
                <tr>
                  <TableHead>Review</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Controls</TableHead>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((review) => (
                  <tr key={review.id}>
                    <TableCell>
                      <p className="font-semibold">{review.customer}</p>
                      <p className="text-xs text-[#646970]">{review.text}</p>
                    </TableCell>
                    <TableCell>{review.product}</TableCell>
                    <TableCell>
                      <div className="flex gap-0.5 text-[#dba617]">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            className={cn("size-4", index < review.rating && "fill-current")}
                            key={`${review.id}-${index}`}
                          />
                        ))}
                      </div>
                      <p className="mt-1 text-xs text-[#646970]">{review.rating}/5</p>
                    </TableCell>
                    <TableCell>{formatDate(review.date)}</TableCell>
                    <TableCell>
                      <StatusBadge status={review.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <AdminButton onClick={() => updateReview(review.id, "Approved")} variant="secondary">
                          <CheckCircle2 className="size-4" />
                          Approve
                        </AdminButton>
                        <AdminButton onClick={() => updateReview(review.id, "Rejected")} variant="danger">
                          <XCircle className="size-4" />
                          Reject
                        </AdminButton>
                        <IconButton
                          label="Delete review"
                          onClick={() => setReviews((current) => current.filter((item) => item.id !== review.id))}
                          variant="danger"
                        >
                          <Trash2 className="size-4" />
                        </IconButton>
                      </div>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </SimpleTable>

            <div className="rounded border border-[#dcdcde] bg-[#f6f7f7] p-3">
              <p className="text-sm font-semibold text-[#1d2327]">Rating split</p>
              <div className="mt-3 grid gap-2">
                {ratingCounts.map((item) => (
                  <div className="grid grid-cols-[42px_1fr_32px] items-center gap-2 text-xs" key={item.rating}>
                    <span className="font-semibold text-[#1d2327]">{item.rating} star</span>
                    <span className="h-2 overflow-hidden rounded bg-white">
                      <span
                        className="block h-full bg-[#dba617]"
                        style={{ width: `${(item.count / maxRatingCount) * 100}%` }}
                      />
                    </span>
                    <span className="text-right text-[#646970]">{item.count}</span>
                  </div>
                ))}
              </div>
              <InlineNotice>
                Only Approved reviews are counted in public product ratings.
              </InlineNotice>
            </div>
          </div>
        </Panel>
      </div>
    );
  }

  function renderReturns() {
    return (
      <Panel title="Returns">
        <InlineNotice>
          Custom earrings, custom frames, personalized gifts, and cash bouquets are marked no-return by policy.
        </InlineNotice>
        <SimpleTable minWidth="920px">
          <thead>
            <tr>
              <TableHead>Request</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </tr>
          </thead>
          <tbody>
            {returns.map((request) => (
              <tr key={request.id}>
                <TableCell className="font-semibold text-[#2271b1]">{request.id}</TableCell>
                <TableCell>{request.orderId}</TableCell>
                <TableCell>{request.customer}</TableCell>
                <TableCell>{request.item}</TableCell>
                <TableCell>{request.reason}</TableCell>
                <TableCell>{formatCurrency(request.amount)}</TableCell>
                <TableCell>
                  <select
                    className={inputClass}
                    onChange={(event) => {
                      updateReturn(request.id, { status: event.target.value as ReturnStatus });
                      recordActivity(`${request.id} moved to ${event.target.value}`);
                    }}
                    value={request.status}
                  >
                    <option>Requested</option>
                    <option>Need photos</option>
                    <option>Approved</option>
                    <option>Rejected</option>
                    <option>Refunded</option>
                  </select>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </SimpleTable>
      </Panel>
    );
  }

  function renderAnalytics() {
    const chartValues = [18, 24, 21, 32, 28, 36, 42];
    const categoryRows = Object.entries(
      inventoryItems.reduce<Record<string, number>>((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.stock;
        return acc;
      }, {})
    );

    return (
      <div className="grid gap-4">
        <Panel
          action={
            <div className="flex flex-wrap gap-2">
              <select
                className={inputClass}
                onChange={(event) => setReportRange(event.target.value)}
                value={reportRange}
              >
                <option>7 days</option>
                <option>30 days</option>
                <option>90 days</option>
              </select>
              <AdminButton
                onClick={() =>
                  copyText(
                    "Report",
                    JSON.stringify({ reportRange, revenue, orders: orders.length, lowStock: lowStockItems.length }, null, 2)
                  )
                }
                variant="secondary"
              >
                <Download className="size-4" />
                Export
              </AdminButton>
            </div>
          }
          title="Analytics"
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <TinyChart label={`Orders over ${reportRange}`} values={chartValues} />
            <div className="grid gap-2">
              <MetricBox helper="current queue" label="Revenue" value={formatCurrency(revenue)}>
                <BarChart3 className="size-5" />
              </MetricBox>
              <MetricBox helper="average order value" label="AOV" value={formatCurrency(Math.round(revenue / orders.length))}>
                <ShoppingBag className="size-5" />
              </MetricBox>
            </div>
          </div>
        </Panel>

        <Panel title="Stock by category">
          <SimpleTable>
            <thead>
              <tr>
                <TableHead>Category</TableHead>
                <TableHead>Stock units</TableHead>
              </tr>
            </thead>
            <tbody>
              {categoryRows.map(([category, count]) => (
                <tr key={category}>
                  <TableCell className="capitalize">{category}</TableCell>
                  <TableCell>{count}</TableCell>
                </tr>
              ))}
            </tbody>
          </SimpleTable>
        </Panel>
      </div>
    );
  }

  function renderMedia() {
    const mediaItems = inventoryItems.filter((item) => item.image);

    return (
      <Panel
        action={
          <AdminButton
            onClick={() => toast({ kind: "info", title: "Upload hook ready", description: "Connect Cloudinary signed upload API here." })}
            variant="secondary"
          >
            <UploadCloud className="size-4" />
            Upload
          </AdminButton>
        }
        title="Media Library"
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {mediaItems.map((item) => (
            <article className="min-w-0 rounded border border-[#c3c4c7] bg-white p-3" key={item.id}>
              <div className="flex items-start gap-3">
                <AdminThumbnail name={item.name} src={item.image} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#1d2327]">{item.name}</p>
                  <p className="mt-1 text-xs text-[#646970]">{item.sku}</p>
                </div>
              </div>
              <div className="mt-3 rounded border border-[#dcdcde] bg-[#f6f7f7] px-2 py-2">
                <p className="line-clamp-2 break-all text-xs text-[#646970]">{item.image}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <AdminButton onClick={() => copyText("Image URL", item.image)} variant="secondary">
                  <ClipboardCopy className="size-4" />
                  Copy URL
                </AdminButton>
                <AdminButton onClick={() => setActive("Products")} variant="secondary">
                  <Pencil className="size-4" />
                  Edit product
                </AdminButton>
              </div>
            </article>
          ))}
        </div>
      </Panel>
    );
  }

  function renderContent() {
    return (
      <Panel
        action={
          <AdminButton
            onClick={() => {
              recordActivity("Content settings saved");
              toast({ title: "Content saved" });
            }}
          >
            <Save className="size-4" />
            Save content
          </AdminButton>
        }
        title="Content"
      >
        <SimpleTable minWidth="840px">
          <thead>
            <tr>
              <TableHead>Area</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last edited</TableHead>
            </tr>
          </thead>
          <tbody>
            {contentBlocks.map((block) => (
              <tr key={block.id}>
                <TableCell className="font-semibold">{block.area}</TableCell>
                <TableCell>
                  <input
                    className={inputClass}
                    onChange={(event) => updateContentBlock(block.id, { title: event.target.value })}
                    value={block.title}
                  />
                </TableCell>
                <TableCell>
                  <input
                    className={inputClass}
                    min={1}
                    onChange={(event) => updateContentBlock(block.id, { priority: Number(event.target.value) || 1 })}
                    type="number"
                    value={block.priority}
                  />
                </TableCell>
                <TableCell>
                  <select
                    className={inputClass}
                    onChange={(event) => updateContentBlock(block.id, { status: event.target.value as ContentBlock["status"] })}
                    value={block.status}
                  >
                    <option>Live</option>
                    <option>Draft</option>
                  </select>
                </TableCell>
                <TableCell>{formatDate(block.lastEdited)}</TableCell>
              </tr>
            ))}
          </tbody>
        </SimpleTable>
      </Panel>
    );
  }

  function renderSettings() {
    return (
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title="Store settings">
          <div className="grid gap-3">
            <Field label="Store name">
              <input
                className={inputClass}
                onChange={(event) => updateSetting("storeName", event.target.value)}
                value={storeSettings.storeName}
              />
            </Field>
            <Field label="Support phone">
              <input
                className={inputClass}
                onChange={(event) => updateSetting("supportPhone", event.target.value)}
                value={storeSettings.supportPhone}
              />
            </Field>
            <Field label="Support email">
              <input
                className={inputClass}
                onChange={(event) => updateSetting("supportEmail", event.target.value)}
                value={storeSettings.supportEmail}
              />
            </Field>
            <Field label="WhatsApp number">
              <input
                className={inputClass}
                onChange={(event) => updateSetting("whatsappNumber", event.target.value)}
                value={storeSettings.whatsappNumber}
              />
            </Field>
            <Field label="Support address">
              <input
                className={inputClass}
                onChange={(event) => updateSetting("supportAddress", event.target.value)}
                value={storeSettings.supportAddress}
              />
            </Field>
            <Field label="Contact page intro">
              <textarea
                className={textareaClass}
                onChange={(event) => updateSetting("contactIntro", event.target.value)}
                value={storeSettings.contactIntro}
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Delivery fee">
                <input
                  className={inputClass}
                  onChange={(event) => updateSetting("deliveryFee", Number(event.target.value) || 0)}
                  type="number"
                  value={storeSettings.deliveryFee}
                />
              </Field>
              <Field label="Free shipping at">
                <input
                  className={inputClass}
                  onChange={(event) => updateSetting("freeShippingAt", Number(event.target.value) || 0)}
                  type="number"
                  value={storeSettings.freeShippingAt}
                />
              </Field>
            </div>
            <AdminButton
              onClick={() => {
                recordActivity("Store settings saved");
                toast({ title: "Settings saved" });
              }}
            >
              <Save className="size-4" />
              Save settings
            </AdminButton>
          </div>
        </Panel>

        <Panel title="Operations">
          <div className="grid gap-3">
            <CheckField
              checked={storeSettings.codEnabled}
              label="Cash on delivery enabled"
              onChange={(checked) => updateSetting("codEnabled", checked)}
            />
            <CheckField
              checked={storeSettings.whatsappAlerts}
              label="WhatsApp order alerts"
              onChange={(checked) => updateSetting("whatsappAlerts", checked)}
            />
            <CheckField
              checked={storeSettings.lowStockEmail}
              label="Low stock email alerts"
              onChange={(checked) => updateSetting("lowStockEmail", checked)}
            />
            <CheckField
              checked={storeSettings.maintenanceMode}
              label="Maintenance mode"
              onChange={(checked) => updateSetting("maintenanceMode", checked)}
            />
            <InlineNotice>
              Production wiring should save these values to a protected server route with admin-only checks.
            </InlineNotice>
          </div>
        </Panel>

        <Panel title="Backup & restore">
          <div className="grid gap-3">
            <AdminButton onClick={exportAdminData} variant="secondary">
              <Download className="size-4" />
              Export admin JSON
            </AdminButton>
            <Field label="Import JSON">
              <textarea
                className={textareaClass}
                onChange={(event) => setImportJson(event.target.value)}
                placeholder="Paste exported admin JSON"
                value={importJson}
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              <AdminButton disabled={!importJson.trim()} onClick={importAdminData}>
                <UploadCloud className="size-4" />
                Import
              </AdminButton>
              <AdminButton onClick={resetAdminData} variant="danger">
                <Trash2 className="size-4" />
                Reset
              </AdminButton>
            </div>
            <InlineNotice>
              This admin panel now saves changes in browser storage. For multi-device admin, connect these modules to Supabase tables and protected API routes.
            </InlineNotice>
          </div>
        </Panel>
      </div>
    );
  }

  function renderActiveModule() {
    switch (active) {
      case "Dashboard":
        return renderDashboard();
      case "Orders":
        return renderOrders();
      case "Products":
        return <CatalogManager mode="products" />;
      case "Categories":
        return <CatalogManager mode="categories" />;
      case "Inventory":
        return renderInventory();
      case "Low Stock":
        return renderInventory(true);
      case "Custom Orders":
        return renderCustomOrders();
      case "Messages":
        return renderMessages();
      case "Customers":
        return renderCustomers();
      case "Coupons":
        return renderCoupons();
      case "Reviews":
        return renderReviews();
      case "Returns":
        return renderReturns();
      case "Analytics":
        return renderAnalytics();
      case "Media":
        return renderMedia();
      case "Content":
        return renderContent();
      case "Settings":
        return renderSettings();
      default:
        return renderDashboard();
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1520px] px-3 pb-10 text-[#1d2327] sm:px-4">
      <div className="mb-4 rounded border border-[#c3c4c7] bg-[#1d2327] px-3 py-2 text-sm text-[#f0f0f1] shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold">Rida Admin</span>
            <span className="text-[#a7aaad]">Today: June 15, 2026</span>
            <StatusBadge status={storeSettings.maintenanceMode ? "Maintenance" : "Store live"} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className="inline-flex h-8 items-center gap-2 rounded border border-white/20 px-3 text-xs font-medium hover:bg-white/10"
              href="/"
              target="_blank"
            >
              <Globe2 className="size-4" />
              View store
            </Link>
            <button
              className="inline-flex h-8 items-center gap-2 rounded border border-white/20 px-3 text-xs font-medium hover:bg-white/10"
              onClick={() => copyText("Admin summary", `${orders.length} orders, ${lowStockItems.length} low stock items`)}
              type="button"
            >
              <ClipboardCopy className="size-4" />
              Copy summary
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <AdminSidebar active={active} onChange={setActive} />

        <main className="min-w-0">
          <section className="mb-4 rounded border border-[#c3c4c7] bg-white shadow-sm">
            <div className="border-b border-[#dcdcde] px-4 py-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-[#646970]">Admin portal</p>
                  <h1 className="mt-1 text-2xl font-semibold text-[#1d2327]">{active}</h1>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row xl:w-[620px]">
                  <SearchInput
                    onChange={setCommand}
                    placeholder="Search admin actions..."
                    value={command}
                  />
                  <AdminButton onClick={() => setActive("Products")}>
                    <Plus className="size-4" />
                    Add product
                  </AdminButton>
                </div>
              </div>
            </div>

            <div className="grid gap-2 px-4 py-3 md:grid-cols-2 xl:grid-cols-4">
              {(commandText ? commandActions : quickActions.slice(0, 4)).map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    className="flex items-start gap-3 rounded border border-[#dcdcde] bg-[#f6f7f7] px-3 py-3 text-left hover:border-[#2271b1] hover:bg-[#f0f6fc]"
                    key={action.label}
                    onClick={() => {
                      setActive(action.target);
                      setCommand("");
                    }}
                    type="button"
                  >
                    <Icon className="mt-0.5 size-4 shrink-0 text-[#2271b1]" />
                    <span>
                      <span className="block text-sm font-semibold text-[#1d2327]">{action.label}</span>
                      <span className="mt-1 block text-xs text-[#646970]">{action.description}</span>
                    </span>
                  </button>
                );
              })}
              {moduleMatches.map((module) => {
                const Icon = module.icon;
                return (
                  <button
                    className="flex items-start gap-3 rounded border border-[#dcdcde] bg-white px-3 py-3 text-left hover:border-[#2271b1]"
                    key={module.label}
                    onClick={() => {
                      setActive(module.label);
                      setCommand("");
                    }}
                    type="button"
                  >
                    <Icon className="mt-0.5 size-4 shrink-0 text-[#2271b1]" />
                    <span className="text-sm font-semibold">{module.label}</span>
                  </button>
                );
              })}
              {commandText && !commandActions.length && !moduleMatches.length ? (
                <div className="rounded border border-[#dcdcde] bg-[#f6f7f7] px-3 py-3 text-sm text-[#646970]">
                  No matching admin action.
                </div>
              ) : null}
            </div>
          </section>

          {renderActiveModule()}
        </main>
      </div>
    </div>
  );
}

function toggleId(current: string[], id: string) {
  return current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
}

function Panel({
  title,
  action,
  children
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded border border-[#c3c4c7] bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-2 border-b border-[#dcdcde] px-4 py-3 sm:flex-row sm:items-center">
        <h2 className="text-base font-semibold text-[#1d2327]">{title}</h2>
        {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
      </div>
      <div className="p-3 sm:p-4">{children}</div>
    </section>
  );
}

function MetricBox({
  label,
  value,
  helper,
  children
}: {
  label: string;
  value: string;
  helper: string;
  children: ReactNode;
}) {
  return (
    <article className="rounded border border-[#c3c4c7] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-[#646970]">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-[#1d2327]">{value}</p>
          <p className="mt-1 text-xs text-[#646970]">{helper}</p>
        </div>
        <span className="grid size-9 place-items-center rounded border border-[#dcdcde] bg-[#f6f7f7] text-[#2271b1]">
          {children}
        </span>
      </div>
    </article>
  );
}

function SearchInput({
  value,
  onChange,
  placeholder
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#646970]" />
      <input
        className={cn(inputClass, "pl-9")}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </div>
  );
}

function SimpleTable({
  children,
  minWidth = "720px"
}: {
  children: ReactNode;
  minWidth?: string;
}) {
  return (
    <div className="max-w-full overflow-x-auto border border-[#c3c4c7] bg-white">
      <table className="w-full border-collapse text-left text-sm" style={{ minWidth }}>
        {children}
      </table>
    </div>
  );
}

function AdminThumbnail({ name, src }: { name: string; src: string }) {
  const [failed, setFailed] = useState(!src);

  return (
    <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded border border-[#c3c4c7] bg-[#f6f7f7] text-[10px] font-semibold uppercase text-[#646970]">
      {!failed && src ? (
        <Image
          alt={name}
          className="h-full w-full object-cover"
          height={48}
          onError={() => setFailed(true)}
          src={src}
          unoptimized
          width={48}
        />
      ) : (
        <span>{name.slice(0, 2) || "PR"}</span>
      )}
    </div>
  );
}

function TableHead({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th className={cn("border-b border-[#c3c4c7] bg-[#f6f7f7] px-3 py-2 font-semibold", className)}>
      {children}
    </th>
  );
}

function TableCell({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return <td className={cn("border-b border-[#dcdcde] px-3 py-3 align-top", className)}>{children}</td>;
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    {
      Active: "border-[#00a32a]/30 bg-[#edfaef] text-[#008a20]",
      Approved: "border-[#00a32a]/30 bg-[#edfaef] text-[#008a20]",
      Delivered: "border-[#00a32a]/30 bg-[#edfaef] text-[#008a20]",
      Paid: "border-[#00a32a]/30 bg-[#edfaef] text-[#008a20]",
      "Store live": "border-[#00a32a]/30 bg-[#edfaef] text-[#008a20]",
      Pending: "border-[#dba617]/40 bg-[#fcf9e8] text-[#8a6d00]",
      Preparing: "border-[#dba617]/40 bg-[#fcf9e8] text-[#8a6d00]",
      Scheduled: "border-[#dba617]/40 bg-[#fcf9e8] text-[#8a6d00]",
      COD: "border-[#dba617]/40 bg-[#fcf9e8] text-[#8a6d00]",
      Confirmed: "border-[#2271b1]/30 bg-[#f0f6fc] text-[#135e96]",
      Dispatched: "border-[#2271b1]/30 bg-[#f0f6fc] text-[#135e96]",
      Converted: "border-[#2271b1]/30 bg-[#f0f6fc] text-[#135e96]",
      "Return requested": "border-[#b32d2e]/30 bg-[#fcf0f1] text-[#b32d2e]",
      Rejected: "border-[#b32d2e]/30 bg-[#fcf0f1] text-[#b32d2e]",
      Expired: "border-[#b32d2e]/30 bg-[#fcf0f1] text-[#b32d2e]",
      Maintenance: "border-[#b32d2e]/30 bg-[#fcf0f1] text-[#b32d2e]",
      Paused: "border-[#c3c4c7] bg-[#f6f7f7] text-[#50575e]",
      Draft: "border-[#c3c4c7] bg-[#f6f7f7] text-[#50575e]"
    }[status] || "border-[#c3c4c7] bg-[#f6f7f7] text-[#50575e]";

  return <span className={cn("inline-flex rounded border px-2 py-0.5 text-xs font-semibold", tone)}>{status}</span>;
}

function BulkLine({ count, label }: { count: number; label: string }) {
  return <p className="mb-3 text-xs text-[#646970]">{count} {label}</p>;
}

function HealthRow({
  icon: Icon,
  label,
  value
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded border border-[#dcdcde] bg-[#f6f7f7] px-3 py-2">
      <Icon className="size-4 text-[#2271b1]" />
      <span className="min-w-0">
        <span className="block font-semibold">{label}</span>
        <span className="block text-xs text-[#646970]">{value}</span>
      </span>
    </div>
  );
}

function TinyChart({ values, label }: { values: number[]; label: string }) {
  const max = Math.max(...values);

  return (
    <div>
      <div className="flex h-56 items-end gap-2 rounded border border-[#dcdcde] bg-[#f6f7f7] p-3">
        {values.map((value, index) => (
          <div className="flex flex-1 flex-col items-center gap-2" key={`${label}-${index}`}>
            <div
              className="w-full rounded-t bg-[#2271b1]"
              style={{ height: `${Math.max(10, (value / max) * 100)}%` }}
            />
            <span className="text-[11px] text-[#646970]">{index + 1}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-sm font-semibold text-[#1d2327]">{label}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-[#1d2327]">{label}</span>
      {children}
    </label>
  );
}

function CheckField({
  checked,
  label,
  onChange
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded border border-[#dcdcde] bg-[#f6f7f7] px-3 py-2 text-sm">
      <input checked={checked} onChange={(event) => onChange(event.target.checked)} type="checkbox" />
      <span>{label}</span>
    </label>
  );
}

function InlineNotice({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 flex items-start gap-2 rounded border border-[#dba617]/50 bg-[#fcf9e8] px-3 py-2 text-sm text-[#1d2327]">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#8a6d00]" />
      <span>{children}</span>
    </div>
  );
}

function AdminButton({
  className,
  variant = "primary",
  ...props
}: ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary" | "danger";
}) {
  return (
    <button
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded border px-3 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-60",
        variant === "primary" && "border-[#135e96] bg-[#2271b1] text-white hover:bg-[#135e96]",
        variant === "secondary" && "border-[#2271b1] bg-white text-[#2271b1] hover:bg-[#f0f6fc]",
        variant === "danger" && "border-[#b32d2e] bg-white text-[#b32d2e] hover:bg-[#fcf0f1]",
        className
      )}
      type="button"
      {...props}
    />
  );
}

function IconButton({
  children,
  label,
  variant = "secondary",
  ...props
}: ComponentPropsWithoutRef<"button"> & {
  label: string;
  variant?: "secondary" | "danger";
}) {
  return (
    <button
      aria-label={label}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded border transition",
        variant === "secondary" && "border-[#c3c4c7] bg-white text-[#2271b1] hover:bg-[#f0f6fc]",
        variant === "danger" && "border-[#b32d2e]/40 bg-white text-[#b32d2e] hover:bg-[#fcf0f1]"
      )}
      title={label}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
