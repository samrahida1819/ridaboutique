"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ComponentType, FormEvent } from "react";
import {
  ArrowRight,
  Bell,
  Edit3,
  Heart,
  HelpCircle,
  Home,
  LogOut,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  Plus,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
  Truck,
  UserRound
} from "lucide-react";
import { LoginRequired, useAuth } from "@/components/providers/auth-provider";
import { useShop } from "@/components/providers/shop-provider";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order, SavedAddress } from "@/types/commerce";

type AccountPanel = "overview" | "profile" | "addresses" | "orders" | "custom" | "essentials";

type CustomOrderRow = {
  reference: string;
  productType: string;
  quantity: number;
  status: string;
  quotedPrice: number | null;
  adminNote: string;
  deliveryDate: string;
  date: string;
};

const customStatusStyles: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800",
  Approved: "bg-emerald-100 text-emerald-800",
  Rejected: "bg-red-100 text-red-700",
  Converted: "bg-brand-green text-brand-ivory"
};

type AddressForm = Omit<SavedAddress, "id">;

const emptyAddressForm: AddressForm = {
  label: "Home",
  fullName: "",
  phone: "",
  address: "",
  district: "",
  pincode: "",
  landmark: "",
  isDefault: false
};

function compactAddressLine(address: Pick<SavedAddress, "district" | "pincode" | "landmark">) {
  return [address.landmark, address.district, address.pincode]
    .map((item) => item?.trim())
    .filter(Boolean)
    .join(", ");
}

function mapSupabaseOrder(order: Record<string, unknown>): Order {
  return {
    id: String(order.order_number || order.id || "Order"),
    date: String(order.created_at || new Date().toISOString()),
    total: Number(order.total || 0),
    status: String(order.status || "Pending") as Order["status"],
    customerName: typeof order.full_name === "string" ? order.full_name : undefined,
    email: typeof order.email === "string" ? order.email : undefined,
    phone: typeof order.phone === "string" ? order.phone : undefined,
    address: typeof order.address === "string" ? order.address : undefined,
    city: typeof order.city === "string" ? order.city : undefined,
    state: typeof order.state === "string" ? order.state : undefined,
    pincode: typeof order.pincode === "string" ? order.pincode : undefined,
    paymentMethod: order.payment_method === "razorpay" ? "razorpay" : "cod",
    items: Array.isArray(order.order_items)
      ? order.order_items.map((item) => {
          const orderItem = item as Record<string, unknown>;

          return {
            productId: typeof orderItem.product_id === "string" ? orderItem.product_id : undefined,
            name: typeof orderItem.product_name === "string" ? orderItem.product_name : "Product",
            quantity: Number(orderItem.quantity || 1),
            price: Number(orderItem.unit_price || 0)
          };
        })
      : []
  };
}

export function AccountClient() {
  const { authReady, isAuthenticated, signOut, updateProfile, user } = useAuth();
  const {
    addSavedAddress,
    cartCount,
    orders: localOrders,
    removeSavedAddress,
    savedAddresses,
    setDefaultAddress,
    subtotal,
    updateSavedAddress,
    wishlistCount
  } = useShop();
  const [activePanel, setActivePanel] = useState<AccountPanel>("overview");
  const [fullName, setFullName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [profileMessage, setProfileMessage] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<AddressForm>(emptyAddressForm);
  const [addressMessage, setAddressMessage] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);
  const [accountOrders, setAccountOrders] = useState<Order[]>(localOrders);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [customOrders, setCustomOrders] = useState<CustomOrderRow[]>([]);
  const [customLoading, setCustomLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }

    setFullName(user.name || "");
    setPhone(user.phone || "");
    setAddress(user.address || "");
    setAddressForm((current) => ({
      ...current,
      fullName: current.fullName || user.name || "",
      phone: current.phone || user.phone || ""
    }));
  }, [user]);

  useEffect(() => {
    let active = true;

    async function loadAccountOrders() {
      if (!user || !hasSupabaseConfig() || user.id.startsWith("testing-")) {
        setAccountOrders(localOrders);
        setOrdersLoading(false);
        return;
      }

      try {
        const { data } = await getSupabaseBrowserClient()
          .from("orders")
          .select("*, order_items(*)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (!active) {
          return;
        }

        setAccountOrders(data?.map((order) => mapSupabaseOrder(order as Record<string, unknown>)) || localOrders);
      } catch {
        if (active) {
          setAccountOrders(localOrders);
        }
      } finally {
        if (active) {
          setOrdersLoading(false);
        }
      }
    }

    setOrdersLoading(true);
    void loadAccountOrders();

    return () => {
      active = false;
    };
  }, [localOrders, user]);

  useEffect(() => {
    let active = true;

    async function loadCustomOrders() {
      if (!user || !hasSupabaseConfig() || user.id.startsWith("testing-")) {
        setCustomOrders([]);
        setCustomLoading(false);
        return;
      }

      try {
        const { data } = await getSupabaseBrowserClient()
          .from("custom_orders")
          .select("reference, product_type, quantity, status, quoted_price, admin_note, delivery_date, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (!active) {
          return;
        }

        setCustomOrders(
          (data || []).map((row) => ({
            reference: String(row.reference || "-"),
            productType: String(row.product_type || "Custom"),
            quantity: Number(row.quantity || 1),
            status: String(row.status || "Pending"),
            quotedPrice: row.quoted_price === null || row.quoted_price === undefined ? null : Number(row.quoted_price),
            adminNote: typeof row.admin_note === "string" ? row.admin_note : "",
            deliveryDate: typeof row.delivery_date === "string" ? row.delivery_date : "",
            date: String(row.created_at || new Date().toISOString())
          }))
        );
      } catch {
        if (active) {
          setCustomOrders([]);
        }
      } finally {
        if (active) {
          setCustomLoading(false);
        }
      }
    }

    setCustomLoading(true);
    void loadCustomOrders();

    return () => {
      active = false;
    };
  }, [user]);

  const defaultAddress = useMemo(
    () => savedAddresses.find((item) => item.isDefault) || savedAddresses[0],
    [savedAddresses]
  );
  const recentOrders = accountOrders.slice(0, 3);

  if (!authReady) {
    return <div className="app-container pb-12 pt-28 sm:pt-32 md:pt-40">Loading account...</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="app-container pb-12 pt-28 sm:pt-32 md:pt-40">
        <LoginRequired description="Sign in to manage your profile, orders, wishlist, cart, and saved addresses." title="My Account" />
      </div>
    );
  }

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileMessage("");
    setSavingProfile(true);
    const result = await updateProfile({ fullName, phone, address });
    setProfileMessage(result.error || "Profile details saved.");
    setSavingProfile(false);
  }

  function updateAddressField(field: keyof AddressForm, value: string | boolean) {
    setAddressForm((current) => ({ ...current, [field]: value }));
  }

  function editAddress(nextAddress: SavedAddress) {
    setEditingAddressId(nextAddress.id);
    setAddressForm({
      label: nextAddress.label,
      fullName: nextAddress.fullName,
      phone: nextAddress.phone,
      address: nextAddress.address,
      district: nextAddress.district,
      pincode: nextAddress.pincode,
      landmark: nextAddress.landmark || "",
      isDefault: nextAddress.isDefault
    });
    setActivePanel("addresses");
    setAddressMessage("");
  }

  function resetAddressForm() {
    setEditingAddressId(null);
    setAddressForm({
      ...emptyAddressForm,
      fullName: user?.name || "",
      phone: user?.phone || "",
      isDefault: savedAddresses.length === 0
    });
  }

  async function submitAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAddressMessage("");
    setSavingAddress(true);

    const landmark = addressForm.landmark?.trim() || undefined;
    const payload = {
      ...addressForm,
      label: addressForm.label.trim() || "Address",
      address: compactAddressLine({ ...addressForm, landmark }),
      landmark,
      isDefault: addressForm.isDefault || savedAddresses.length === 0
    };
    const result = editingAddressId
      ? await updateSavedAddress(editingAddressId, payload)
      : await addSavedAddress(payload);

    setSavingAddress(false);
    if (!result) {
      setAddressMessage("Unable to save address.");
      return;
    }

    setAddressMessage(editingAddressId ? "Address updated." : "Address saved.");
    resetAddressForm();
  }

  const accountTiles = [
    {
      id: "overview" as const,
      title: "Overview",
      value: "Home",
      detail: "Account overview",
      icon: Home
    },
    {
      id: "profile" as const,
      title: "Profile",
      value: user.name,
      detail: user.phone || "Add phone",
      icon: UserRound
    },
    {
      id: "orders" as const,
      title: "Orders",
      value: String(accountOrders.length),
      detail: ordersLoading ? "Loading recent orders" : recentOrders[0]?.status || "No active orders",
      icon: PackageCheck
    },
    {
      id: "custom" as const,
      title: "Custom Orders",
      value: customLoading ? "..." : String(customOrders.length),
      detail: customLoading ? "Loading requests" : customOrders[0]?.status || "No requests yet",
      icon: Sparkles
    },
    {
      id: "addresses" as const,
      title: "Addresses",
      value: String(savedAddresses.length),
      detail: defaultAddress?.label || "Add delivery address",
      icon: MapPin
    },
    {
      id: "essentials" as const,
      title: "Essentials",
      value: `${cartCount}/${wishlistCount}`,
      detail: "Cart and wishlist",
      icon: Settings
    }
  ];

  return (
    <section className="app-container bg-brand-ivory pb-12 pt-28 sm:pt-32 md:pt-40">
      <div className="rounded-xl bg-brand-green p-4 text-brand-ivory shadow-luxury sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">My account</p>
            <h1 className="mt-3 font-serif text-3xl leading-tight sm:text-5xl">{user.name}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-ivory/72">
              Manage profile details, orders, addresses, wishlist, cart, and account essentials.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.id.startsWith("testing-") ? (
              <span className="rounded-full border border-brand-gold/35 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold">
                Testing
              </span>
            ) : null}
            <Button className="text-brand-ivory ring-1 ring-brand-gold/30 hover:text-brand-gold" onClick={signOut} variant="ghost">
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {accountTiles.map((tile) => {
          const Icon = tile.icon;

          return (
            <button
              aria-pressed={activePanel === tile.id}
              className={`rounded-xl border p-4 text-left shadow-[0_1px_0_rgba(6,40,31,0.08)] transition ${
                activePanel === tile.id
                  ? "border-brand-gold bg-brand-green text-brand-ivory"
                  : "border-brand-green/10 bg-white text-brand-green hover:border-brand-gold"
              }`}
              key={tile.id}
              onClick={() => setActivePanel(tile.id)}
              type="button"
            >
              <span className={`grid size-9 place-items-center rounded-full ${activePanel === tile.id ? "bg-brand-gold text-brand-green" : "bg-brand-cream text-brand-gold"}`}>
                <Icon className="size-4" />
              </span>
              <span className="mt-4 block text-xs font-semibold uppercase tracking-[0.16em] opacity-70">{tile.title}</span>
              <span className="mt-1 block truncate font-serif text-2xl leading-tight">{tile.value}</span>
              <span className="mt-1 block truncate text-xs opacity-70">{tile.detail}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <aside className="grid gap-3 rounded-xl border border-brand-green/10 bg-white p-4 shadow-luxury">
          <ProfileLine icon={Mail} label="Email" value={user.email} />
          <ProfileLine icon={Phone} label="Phone" value={user.phone || "Not added"} />
          <ProfileLine icon={Home} label="Default address" value={defaultAddress ? compactAddressLine(defaultAddress) : user.address || "Not added"} />
          <ProfileLine icon={ShieldCheck} label="Role" value={user.role} />
        </aside>

        <div className="min-w-0">
          {activePanel === "overview" ? (
            <OverviewPanel
              cartCount={cartCount}
              defaultAddress={defaultAddress}
              orders={accountOrders.length}
              subtotal={subtotal}
              wishlistCount={wishlistCount}
              onPanelChange={setActivePanel}
            />
          ) : null}

          {activePanel === "profile" ? (
            <form className="rounded-xl border border-brand-green/10 bg-white p-4 shadow-luxury sm:p-5" onSubmit={submitProfile}>
              <PanelHeading icon={Edit3} title="Editable profile details" text="Keep order-ready name, phone, and default delivery note updated." />
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Full name">
                  <Input value={fullName} onChange={(event) => setFullName(event.target.value)} />
                </Field>
                <Field label="Phone">
                  <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Default address note">
                  <Textarea value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Short default delivery note" />
                </Field>
              </div>
              {profileMessage ? <p className="mt-4 text-sm font-semibold text-brand-green">{profileMessage}</p> : null}
              <Button className="mt-5 w-full sm:w-auto" disabled={savingProfile} type="submit">
                {savingProfile ? "Saving..." : "Save profile"}
              </Button>
            </form>
          ) : null}

          {activePanel === "addresses" ? (
            <div className="grid gap-4">
              <form className="rounded-xl border border-brand-green/10 bg-white p-4 shadow-luxury sm:p-5" onSubmit={submitAddress}>
              <PanelHeading icon={MapPin} title={editingAddressId ? "Edit address" : "Add delivery address"} text="Save delivery addresses for faster orders." />
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field label="Label">
                    <Input value={addressForm.label} onChange={(event) => updateAddressField("label", event.target.value)} placeholder="Home, Work, Gift" />
                  </Field>
                  <Field label="Full name">
                    <Input required value={addressForm.fullName} onChange={(event) => updateAddressField("fullName", event.target.value)} />
                  </Field>
                  <Field label="Phone">
                    <Input required value={addressForm.phone} onChange={(event) => updateAddressField("phone", event.target.value)} />
                  </Field>
                  <Field label="District">
                    <Input required value={addressForm.district} onChange={(event) => updateAddressField("district", event.target.value)} />
                  </Field>
                  <Field label="Pincode">
                    <Input inputMode="numeric" required value={addressForm.pincode} onChange={(event) => updateAddressField("pincode", event.target.value)} />
                  </Field>
                  <Field label="Landmark">
                    <Input value={addressForm.landmark || ""} onChange={(event) => updateAddressField("landmark", event.target.value)} />
                  </Field>
                </div>
                <label className="mt-4 flex items-center gap-3 rounded-xl bg-brand-cream px-4 py-3 text-sm font-semibold text-brand-green">
                  <input
                    checked={addressForm.isDefault}
                    className="size-4 accent-brand-green"
                    onChange={(event) => updateAddressField("isDefault", event.target.checked)}
                    type="checkbox"
                  />
                  Make default address
                </label>
                {addressMessage ? <p className="mt-4 text-sm font-semibold text-brand-green">{addressMessage}</p> : null}
                <div className="mt-5 grid gap-2 sm:flex">
                  <Button disabled={savingAddress} type="submit">
                    <Plus className="size-4" />
                    {savingAddress ? "Saving..." : editingAddressId ? "Update address" : "Save address"}
                  </Button>
                  {editingAddressId ? (
                    <Button onClick={resetAddressForm} type="button" variant="secondary">
                      Cancel edit
                    </Button>
                  ) : null}
                </div>
              </form>

              <div className="grid gap-3 sm:grid-cols-2">
                {savedAddresses.length ? (
                  savedAddresses.map((item) => (
                    <article className="rounded-xl border border-brand-green/10 bg-white p-4 shadow-[0_1px_0_rgba(6,40,31,0.08)]" key={item.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-serif text-2xl text-brand-green">{item.label}</p>
                          <p className="mt-1 text-sm font-semibold text-brand-charcoal">{item.fullName}</p>
                        </div>
                        {item.isDefault ? (
                          <span className="rounded-full bg-brand-gold px-2 py-1 text-[10px] font-bold uppercase text-brand-green">Default</span>
                        ) : null}
                      </div>
                      <div className="mt-3 grid gap-1 text-sm leading-6 text-brand-charcoal/65">
                        <span>{item.phone}</span>
                        <span>{compactAddressLine(item)}</span>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <Button className="h-10 text-xs" onClick={() => editAddress(item)} variant="secondary">
                          Edit
                        </Button>
                        <Button className="h-10 text-xs" onClick={() => removeSavedAddress(item.id)} variant="secondary">
                          <Trash2 className="size-4" />
                          Remove
                        </Button>
                        {!item.isDefault ? (
                          <Button className="col-span-2 h-10 text-xs" onClick={() => setDefaultAddress(item.id)}>
                            Set default
                          </Button>
                        ) : null}
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-xl border border-brand-green/10 bg-white p-6 text-center shadow-luxury sm:col-span-2">
                    <MapPin className="mx-auto size-8 text-brand-gold" />
                    <p className="mt-3 font-serif text-2xl text-brand-green">No saved addresses</p>
                    <p className="mt-2 text-sm leading-6 text-brand-charcoal/62">Add your first delivery tile above.</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {activePanel === "orders" ? (
            <div className="rounded-xl border border-brand-green/10 bg-white p-4 shadow-luxury sm:p-5">
              <PanelHeading icon={PackageCheck} title="Orders" text="Recent orders and tracking essentials." />
              <div className="mt-5 grid gap-3">
                {ordersLoading ? (
                  <div className="rounded-xl bg-brand-ivory p-6 text-center">
                    <PackageCheck className="mx-auto size-8 animate-pulse text-brand-gold" />
                    <p className="mt-3 font-serif text-2xl text-brand-green">Loading recent orders</p>
                  </div>
                ) : recentOrders.length ? (
                  recentOrders.map((order) => (
                    <article className="rounded-xl border border-brand-green/10 bg-brand-ivory p-4" key={order.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-brand-green">{order.id}</p>
                          <p className="mt-1 text-xs text-brand-charcoal/55">{formatDate(order.date)}</p>
                        </div>
                        <span className="rounded-full bg-brand-green px-3 py-1 text-xs font-semibold text-brand-ivory">{order.status}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="text-brand-charcoal/62">{order.items.length} item{order.items.length === 1 ? "" : "s"}</span>
                        <span className="font-bold text-brand-charcoal">{formatCurrency(order.total)}</span>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-xl bg-brand-ivory p-6 text-center">
                    <PackageCheck className="mx-auto size-8 text-brand-gold" />
                    <p className="mt-3 font-serif text-2xl text-brand-green">No orders yet</p>
                    <p className="mt-2 text-sm leading-6 text-brand-charcoal/62">Placed orders will show here.</p>
                  </div>
                )}
              </div>
              <ButtonLink className="mt-5 w-full sm:w-auto" href="/orders">
                View full orders
                <ArrowRight className="size-4" />
              </ButtonLink>
            </div>
          ) : null}

          {activePanel === "custom" ? (
            <div className="rounded-xl border border-brand-green/10 bg-white p-4 shadow-luxury sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <PanelHeading icon={Sparkles} title="Custom orders" text="Track the status of your custom requests and quotes." />
                <ButtonLink className="w-full shrink-0 sm:w-auto" href="/custom-orders" variant="secondary">
                  <Plus className="size-4" />
                  New request
                </ButtonLink>
              </div>
              <div className="mt-5 grid gap-3">
                {customLoading ? (
                  <div className="rounded-xl bg-brand-ivory p-6 text-center">
                    <Sparkles className="mx-auto size-8 animate-pulse text-brand-gold" />
                    <p className="mt-3 font-serif text-2xl text-brand-green">Loading requests</p>
                  </div>
                ) : customOrders.length ? (
                  customOrders.map((order) => (
                    <article className="rounded-xl border border-brand-green/10 bg-brand-ivory p-4" key={order.reference}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-brand-green">{order.productType} <span className="text-brand-charcoal/45">x{order.quantity}</span></p>
                          <p className="mt-1 text-xs text-brand-charcoal/55">{order.reference} - {formatDate(order.date)}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${customStatusStyles[order.status] || "bg-brand-cream text-brand-green"}`}>
                          {order.status}
                        </span>
                      </div>
                      {order.quotedPrice !== null ? (
                        <p className="mt-3 text-sm">
                          <span className="text-brand-charcoal/55">Quoted price: </span>
                          <span className="font-bold text-brand-charcoal">{formatCurrency(order.quotedPrice)}</span>
                        </p>
                      ) : null}
                      {order.adminNote ? (
                        <p className="mt-2 rounded-lg bg-white p-3 text-sm leading-6 text-brand-charcoal/70">
                          <span className="font-semibold text-brand-green">Note from team: </span>
                          {order.adminNote}
                        </p>
                      ) : null}
                      {order.status === "Approved" && order.quotedPrice !== null ? (
                        <p className="mt-2 text-xs font-semibold text-emerald-700">Approved - our team will reach out to finalise and collect payment.</p>
                      ) : null}
                    </article>
                  ))
                ) : (
                  <div className="rounded-xl bg-brand-ivory p-6 text-center">
                    <Sparkles className="mx-auto size-8 text-brand-gold" />
                    <p className="mt-3 font-serif text-2xl text-brand-green">No custom requests yet</p>
                    <p className="mt-2 text-sm leading-6 text-brand-charcoal/62">Send a custom order request and track its status here.</p>
                    <ButtonLink className="mt-4" href="/custom-orders">Create custom order</ButtonLink>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {activePanel === "essentials" ? <EssentialsPanel /> : null}
        </div>
      </div>
    </section>
  );
}

function OverviewPanel({
  cartCount,
  defaultAddress,
  orders,
  subtotal,
  wishlistCount,
  onPanelChange
}: {
  cartCount: number;
  defaultAddress?: SavedAddress;
  orders: number;
  subtotal: number;
  wishlistCount: number;
  onPanelChange: (panel: AccountPanel) => void;
}) {
  const overviewTiles = [
    { label: "Cart", value: String(cartCount), detail: formatCurrency(subtotal), href: "/cart", icon: ShoppingBag },
    { label: "Wishlist", value: String(wishlistCount), detail: "Saved pieces", href: "/wishlist", icon: Heart },
    { label: "Orders", value: String(orders), detail: "Track status", panel: "orders" as AccountPanel, icon: PackageCheck },
    { label: "Default address", value: defaultAddress?.label || "None", detail: defaultAddress?.district || "Add one", panel: "addresses" as AccountPanel, icon: MapPin }
  ];

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {overviewTiles.map((tile) => {
          const Icon = tile.icon;
          const content = (
            <>
              <span className="grid size-10 place-items-center rounded-full bg-brand-cream text-brand-gold">
                <Icon className="size-5" />
              </span>
              <span className="mt-4 block text-xs font-semibold uppercase tracking-[0.18em] text-brand-green/62">{tile.label}</span>
              <span className="mt-1 block truncate font-serif text-3xl text-brand-green">{tile.value}</span>
              <span className="mt-1 block truncate text-sm text-brand-charcoal/55">{tile.detail}</span>
            </>
          );

          if (tile.href) {
            return (
              <Link className="rounded-xl border border-brand-green/10 bg-white p-4 shadow-[0_1px_0_rgba(6,40,31,0.08)] transition hover:border-brand-gold" href={tile.href} key={tile.label}>
                {content}
              </Link>
            );
          }

          return (
            <button className="rounded-xl border border-brand-green/10 bg-white p-4 text-left shadow-[0_1px_0_rgba(6,40,31,0.08)] transition hover:border-brand-gold" key={tile.label} onClick={() => tile.panel && onPanelChange(tile.panel)} type="button">
              {content}
            </button>
          );
        })}
      </div>
      <div className="rounded-xl border border-brand-green/10 bg-white p-4 shadow-[0_1px_0_rgba(6,40,31,0.08)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-green/55">Essentials</p>
            <p className="mt-2 font-serif text-2xl text-brand-green">Need more account tools?</p>
            <p className="mt-1 text-sm leading-6 text-brand-charcoal/60">
              Open addresses, policies, support, and extra account actions from one place.
            </p>
          </div>
          <Button className="w-full sm:w-auto" onClick={() => onPanelChange("essentials")}>
            Open essentials
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function EssentialsPanel({ compact = false }: { compact?: boolean }) {
  const links = [
    { label: "Shop products", href: "/products", icon: ShoppingBag },
    { label: "Custom orders", href: "/custom-orders", icon: Star },
    { label: "Order history", href: "/orders", icon: PackageCheck },
    { label: "Wishlist", href: "/wishlist", icon: Heart },
    { label: "Shipping policy", href: "/shipping-policy", icon: Truck },
    { label: "Returns", href: "/return-policy", icon: ArrowRight },
    { label: "FAQ", href: "/faq", icon: HelpCircle },
    { label: "Contact support", href: "/contact", icon: Bell }
  ];

  return (
    <div className={compact ? "" : "rounded-xl border border-brand-green/10 bg-white p-4 shadow-luxury sm:p-5"}>
      {!compact ? <PanelHeading icon={Settings} title="Account essentials" text="Fast access to the things customers usually need." /> : null}
      <div className={`grid gap-3 ${compact ? "sm:grid-cols-2" : "mt-5 sm:grid-cols-2"}`}>
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <Link className="flex min-h-20 items-center justify-between gap-3 rounded-xl border border-brand-green/10 bg-white p-4 text-brand-green shadow-[0_1px_0_rgba(6,40,31,0.08)] transition hover:border-brand-gold hover:bg-brand-cream" href={link.href} key={link.href}>
              <span className="flex min-w-0 items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-cream text-brand-gold">
                  <Icon className="size-5" />
                </span>
                <span className="truncate text-sm font-semibold">{link.label}</span>
              </span>
              <ArrowRight className="size-4 shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function PanelHeading({
  icon: Icon,
  text,
  title
}: {
  icon: ComponentType<{ className?: string }>;
  text: string;
  title: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-green text-brand-ivory">
        <Icon className="size-5" />
      </span>
      <div>
        <h2 className="font-serif text-3xl leading-tight text-brand-green">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-brand-charcoal/62">{text}</p>
      </div>
    </div>
  );
}

function ProfileLine({
  icon: Icon,
  label,
  value
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-brand-ivory p-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-brand-gold" />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-green/55">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-brand-green">{value}</p>
      </div>
    </div>
  );
}
