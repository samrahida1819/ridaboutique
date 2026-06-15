"use client";

import { useState } from "react";
import {
  Bell,
  CreditCard,
  Headphones,
  Heart,
  KeyRound,
  LogOut,
  MapPin,
  Package,
  Pencil,
  RefreshCcw,
  ShieldCheck,
  Trash2,
  Truck,
  UserRound
} from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AuthLoading, LoginRequired, useAuth } from "@/components/providers/auth-provider";
import { useShop } from "@/components/providers/shop-provider";
import { useToast } from "@/components/providers/toast-provider";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { SavedAddress } from "@/types/commerce";

type AccountSection =
  | "Your Orders"
  | "Login & Security"
  | "Your Addresses"
  | "Payment Options"
  | "Wishlist"
  | "Returns & Refunds"
  | "Notifications"
  | "Customer Support"
  | "Logout";

type AddressForm = Omit<SavedAddress, "id" | "isDefault"> & {
  makeDefault: boolean;
};

const sections: Array<{
  label: AccountSection;
  description: string;
  icon: typeof Package;
}> = [
  { label: "Your Orders", description: "Track, view, and reorder purchases.", icon: Package },
  { label: "Login & Security", description: "Name, WhatsApp number, and session.", icon: KeyRound },
  { label: "Your Addresses", description: "Save addresses for faster checkout.", icon: MapPin },
  { label: "Payment Options", description: "UPI, cards, wallets, and net banking.", icon: CreditCard },
  { label: "Wishlist", description: "Saved products and stock alerts.", icon: Heart },
  { label: "Returns & Refunds", description: "Return rules and refund support.", icon: RefreshCcw },
  { label: "Notifications", description: "Order, offer, and account updates.", icon: Bell },
  { label: "Customer Support", description: "Contact help for orders and delivery.", icon: Headphones },
  { label: "Logout", description: "Sign out only when you choose.", icon: LogOut }
];

const districts = [
  "Srinagar",
  "Budgam",
  "Baramulla",
  "Anantnag",
  "Pulwama",
  "Ganderbal",
  "Kupwara",
  "Shopian",
  "Kulgam"
];

const initialAddressForm: AddressForm = {
  label: "Home",
  fullName: "",
  phone: "",
  address: "",
  district: "Srinagar",
  pincode: "",
  landmark: "",
  makeDefault: true
};

export function AccountClient() {
  const [active, setActive] = useState<AccountSection>("Your Orders");
  const { authReady, isAuthenticated, signOut, user } = useAuth();
  const { orders, savedAddresses, wishlistCount } = useShop();
  const { toast } = useToast();
  const defaultAddress = savedAddresses.find((address) => address.isDefault) || savedAddresses[0];

  async function handleSignOut() {
    await signOut();
    toast({
      kind: "info",
      title: "Signed out",
      description: "Your saved login was cleared on this device."
    });
  }

  if (!authReady) {
    return <AuthLoading title="Checking your account" />;
  }

  if (!isAuthenticated) {
    return (
      <LoginRequired
        description="Sign in to manage orders, saved addresses, wishlist, returns, and support."
        title="Sign in to view your account"
      />
    );
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-brand-green/10 bg-white p-4 shadow-luxury sm:p-5">
        <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
          <div className="flex min-w-0 gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-green text-brand-gold">
              <UserRound className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
                Profile
              </p>
              <h2 className="mt-1 truncate font-serif text-3xl text-brand-green">
                {user?.name || "Customer"}
              </h2>
              <p className="mt-1 text-sm text-brand-charcoal/62">
                WhatsApp: {user?.phone || "Signed in account"}
              </p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-4 xl:w-[560px]">
            {[
              ["Orders", String(orders.length)],
              ["Addresses", String(savedAddresses.length)],
              ["Wishlist", String(wishlistCount)]
            ].map(([label, value]) => (
              <div className="rounded-xl bg-brand-cream px-3 py-2 text-sm text-brand-green" key={label}>
                <p className="text-lg font-semibold">{value}</p>
                <p className="text-xs text-brand-charcoal/55">{label}</p>
              </div>
            ))}
            <Button className="w-full rounded-xl" onClick={() => void handleSignOut()} variant="secondary">
              <LogOut className="size-4" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-brand-cream px-4 py-3 text-sm text-brand-charcoal/68">
          {defaultAddress ? (
            <p>
              <span className="font-semibold text-brand-green">Default delivery:</span>{" "}
              {defaultAddress.address}, {defaultAddress.district} - {defaultAddress.pincode}
            </p>
          ) : (
            <p>
              <span className="font-semibold text-brand-green">Default delivery:</span> No saved
              address yet.
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map((section) => {
          const Icon = section.icon;
          const selected = active === section.label;

          return (
            <button
              aria-pressed={selected}
              className={
                selected
                  ? "min-h-24 rounded-xl border border-brand-gold bg-brand-green p-3 text-left text-brand-ivory shadow-luxury"
                  : "min-h-24 rounded-xl border border-brand-green/10 bg-white p-3 text-left text-brand-green shadow-[0_1px_0_rgba(6,40,31,0.08)] transition hover:border-brand-gold hover:shadow-luxury"
              }
              key={section.label}
              onClick={() => setActive(section.label)}
              type="button"
            >
              <Icon className="size-4 text-brand-gold" />
              <p className="mt-3 text-sm font-bold leading-tight">{section.label}</p>
              <p className={selected ? "mt-2 text-xs leading-5 text-brand-ivory/68" : "mt-2 text-xs leading-5 text-brand-charcoal/55"}>
                {section.description}
              </p>
            </button>
          );
        })}
      </section>

      <section className="rounded-2xl border border-brand-green/10 bg-white p-4 shadow-luxury sm:rounded-[1.75rem] sm:p-6">
        {active === "Your Orders" ? <OrdersPanel /> : null}
        {active === "Login & Security" ? <SecurityPanel /> : null}
        {active === "Your Addresses" ? <AddressPanel /> : null}
        {active === "Payment Options" ? <PaymentPanel /> : null}
        {active === "Wishlist" ? <WishlistPanel /> : null}
        {active === "Returns & Refunds" ? <ReturnsPanel /> : null}
        {active === "Notifications" ? <NotificationsPanel /> : null}
        {active === "Customer Support" ? <SupportPanel /> : null}
        {active === "Logout" ? <LogoutPanel /> : null}
      </section>
    </div>
  );
}

function PanelTitle({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
        {eyebrow}
      </p>
      <h3 className="mt-2 font-serif text-3xl text-brand-green sm:text-4xl">{title}</h3>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-brand-charcoal/62">{description}</p>
    </div>
  );
}

function OrdersPanel() {
  const { orders } = useShop();

  return (
    <div>
      <PanelTitle
        description="Recent purchases, delivery status, tracking IDs, and support actions."
        eyebrow="Orders"
        title="Your orders"
      />

      {orders.length ? (
        <div className="mt-6 grid gap-4">
          {orders.map((order) => (
            <article className="rounded-2xl bg-brand-cream p-4 sm:p-5" key={order.id}>
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <p className="font-serif text-3xl text-brand-green">{order.id}</p>
                  <p className="mt-1 text-sm text-brand-charcoal/60">
                    {formatDate(order.date)} | {order.status} | {formatCurrency(order.total)}
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-green/55">
                    Tracking: {order.trackingId}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ButtonLink href="/orders" variant="secondary">
                    View Details
                  </ButtonLink>
                  <ButtonLink href="/shop" variant="outline">
                    Buy Again
                  </ButtonLink>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-brand-green/20 bg-brand-cream p-6 text-center">
          <Package className="mx-auto size-8 text-brand-gold" />
          <p className="mt-3 font-serif text-2xl text-brand-green">No orders yet.</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-brand-charcoal/60">
            Orders placed from checkout will appear here for tracking and support.
          </p>
          <ButtonLink className="mt-5" href="/shop">
            Start Shopping
          </ButtonLink>
        </div>
      )}
    </div>
  );
}

function SecurityPanel() {
  const { signOut, user } = useAuth();
  const items = [
    ["Name", user?.name || "Customer"],
    ["WhatsApp number", user?.phone || "Signed in account"],
    ["Password", "Not used. Login happens with WhatsApp OTP."],
    ["Session", "Sign out when this is not your personal device."]
  ];

  return (
    <div>
      <PanelTitle
        description="Keep contact details accurate so checkout, delivery, and support can use the right information."
        eyebrow="Profile"
        title="Login & security"
      />
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {items.map(([title, text]) => (
          <article className="rounded-2xl bg-brand-cream p-4" key={title}>
            <p className="font-semibold text-brand-green">{title}</p>
            <p className="mt-2 text-sm leading-6 text-brand-charcoal/60">{text}</p>
          </article>
        ))}
      </div>
      <Button className="mt-5" onClick={() => void signOut()} variant="secondary">
        <LogOut className="size-4" />
        Sign Out
      </Button>
    </div>
  );
}

function LogoutPanel() {
  const { signOut } = useAuth();
  const { toast } = useToast();

  async function handleSignOut() {
    await signOut();
    toast({
      kind: "info",
      title: "Signed out",
      description: "Your session cookie was removed from this device."
    });
  }

  return (
    <div>
      <PanelTitle
        description="You stay signed in after closing Chrome or the app. Use this option only when you want to remove the login from this device."
        eyebrow="Session"
        title="Logout"
      />
      <div className="mt-6 rounded-2xl bg-brand-cream p-4 sm:p-5">
        <p className="font-semibold text-brand-green">Browser close will not sign you out.</p>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-charcoal/62">
          Your WhatsApp login is saved securely in a 30 day browser cookie. Press Sign Out to clear it.
        </p>
        <Button className="mt-5" onClick={() => void handleSignOut()} variant="secondary">
          <LogOut className="size-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

function AddressPanel() {
  const {
    addSavedAddress,
    removeSavedAddress,
    savedAddresses,
    setDefaultAddress,
    updateSavedAddress
  } = useShop();
  const { toast } = useToast();
  const [form, setForm] = useState<AddressForm>(initialAddressForm);
  const [errors, setErrors] = useState<Partial<Record<keyof AddressForm, string>>>({});
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  function update<K extends keyof AddressForm>(key: K, value: AddressForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function resetAddressForm() {
    setEditingAddressId(null);
    setErrors({});
    setForm({ ...initialAddressForm, makeDefault: savedAddresses.length === 0 });
  }

  function editAddress(address: SavedAddress) {
    setEditingAddressId(address.id);
    setErrors({});
    setForm({
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      district: address.district,
      pincode: address.pincode,
      landmark: address.landmark || "",
      makeDefault: address.isDefault
    });
  }

  function validateAddress() {
    const nextErrors: Partial<Record<keyof AddressForm, string>> = {};

    if (!form.label.trim()) nextErrors.label = "Address label is required.";
    if (!form.fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!/^[0-9+\-\s]{7,}$/.test(form.phone)) nextErrors.phone = "Enter a valid phone number.";
    if (!form.address.trim()) nextErrors.address = "Full address is required.";
    if (!/^[0-9]{6}$/.test(form.pincode)) nextErrors.pincode = "Enter a 6 digit PIN code.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function saveAddress(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateAddress()) {
      toast({ kind: "info", title: "Address needs a few details", description: "Please review highlighted fields." });
      return;
    }

    const payload = {
      label: form.label.trim(),
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      district: form.district,
      pincode: form.pincode.trim(),
      landmark: form.landmark?.trim(),
      isDefault: form.makeDefault || (!editingAddressId && savedAddresses.length === 0)
    };

    const saved = editingAddressId
      ? await updateSavedAddress(editingAddressId, payload)
      : await addSavedAddress(payload);

    if (!saved) {
      return;
    }

    resetAddressForm();
    toast({
      title: editingAddressId ? "Address updated" : "Address saved",
      description: "You can select it during checkout."
    });
  }

  return (
    <div>
      <PanelTitle
        description="Save delivery addresses once, choose a default, and reuse them at checkout."
        eyebrow="Addresses"
        title="Your addresses"
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <form className="rounded-2xl bg-brand-cream p-4 sm:p-5" onSubmit={saveAddress}>
          <p className="font-serif text-2xl text-brand-green">
            {editingAddressId ? "Edit address" : "Add a new address"}
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field error={errors.label} label="Address Label">
              <Input placeholder="Home, Work, Parents" value={form.label} onChange={(event) => update("label", event.target.value)} />
            </Field>
            <Field error={errors.fullName} label="Full Name">
              <Input value={form.fullName} onChange={(event) => update("fullName", event.target.value)} />
            </Field>
            <Field error={errors.phone} label="Phone Number">
              <Input inputMode="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} />
            </Field>
            <Field label="District">
              <Select value={form.district} onChange={(event) => update("district", event.target.value)}>
                {districts.map((district) => (
                  <option key={district}>{district}</option>
                ))}
              </Select>
            </Field>
            <div className="sm:col-span-2">
              <Field error={errors.address} label="Complete Address">
                <Input placeholder="House no, street, area" value={form.address} onChange={(event) => update("address", event.target.value)} />
              </Field>
            </div>
            <Field label="Landmark">
              <Input value={form.landmark} onChange={(event) => update("landmark", event.target.value)} />
            </Field>
            <Field error={errors.pincode} label="PIN Code">
              <Input inputMode="numeric" value={form.pincode} onChange={(event) => update("pincode", event.target.value)} />
            </Field>
          </div>
          <label className="mt-5 flex items-center gap-3 text-sm font-semibold text-brand-green">
            <input
              checked={form.makeDefault}
              className="size-4 accent-brand-green"
              onChange={(event) => update("makeDefault", event.target.checked)}
              type="checkbox"
            />
            Make this my default address
          </label>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button className="w-full sm:w-auto" type="submit">
              {editingAddressId ? "Update Address" : "Save Address"}
            </Button>
            {editingAddressId ? (
              <Button className="w-full sm:w-auto" onClick={resetAddressForm} type="button" variant="secondary">
                Cancel Edit
              </Button>
            ) : null}
          </div>
        </form>

        <div className="grid content-start gap-3">
          {savedAddresses.length ? (
            savedAddresses.map((address) => (
              <article className="rounded-2xl border border-brand-green/10 bg-white p-4 shadow-[0_1px_0_rgba(6,40,31,0.08)]" key={address.id}>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-serif text-2xl text-brand-green">{address.label}</p>
                      {address.isDefault ? (
                        <span className="rounded-full bg-brand-gold px-3 py-1 text-[11px] font-bold uppercase text-brand-green">
                          Default
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm font-semibold text-brand-green">{address.fullName}</p>
                    <p className="mt-1 text-sm leading-6 text-brand-charcoal/62">
                      {address.address}
                      {address.landmark ? `, ${address.landmark}` : ""}, {address.district} - {address.pincode}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-green/55">
                      Phone: {address.phone}
                    </p>
                  </div>
                  <Truck className="size-5 shrink-0 text-brand-gold" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    disabled={address.isDefault}
                    onClick={async () => {
                      if (await setDefaultAddress(address.id)) {
                        toast({ title: "Default address updated" });
                      }
                    }}
                    size="sm"
                    variant="secondary"
                  >
                    Use as Default
                  </Button>
                  <ButtonLink href="/checkout" size="sm" variant="outline">
                    Use at Checkout
                  </ButtonLink>
                  <Button
                    onClick={() => editAddress(address)}
                    size="sm"
                    variant="secondary"
                  >
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                  <Button
                    onClick={async () => {
                      if (await removeSavedAddress(address.id)) {
                        if (editingAddressId === address.id) {
                          resetAddressForm();
                        }
                        toast({ kind: "info", title: "Address removed" });
                      }
                    }}
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-brand-green/20 bg-white p-6 text-center">
              <MapPin className="mx-auto size-8 text-brand-gold" />
              <p className="mt-3 font-serif text-2xl text-brand-green">No saved addresses yet.</p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-brand-charcoal/60">
                Add your first address here, then checkout can fill delivery details automatically.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PaymentPanel() {
  return (
    <div>
      <PanelTitle
        description="Payment methods are selected at checkout. Saved payment tokens can be wired when live auth is enabled."
        eyebrow="Payments"
        title="Payment options"
      />
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {["UPI", "Credit / Debit Card", "Net Banking & Wallets"].map((item) => (
          <article className="rounded-2xl bg-brand-cream p-4" key={item}>
            <CreditCard className="size-5 text-brand-gold" />
            <p className="mt-4 font-semibold text-brand-green">{item}</p>
            <p className="mt-2 text-sm leading-6 text-brand-charcoal/60">Available during secure checkout.</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function WishlistPanel() {
  return (
    <div>
      <PanelTitle
        description="Open saved products, move items to cart, and manage stock notifications."
        eyebrow="Wishlist"
        title="Saved for later"
      />
      <div className="mt-6">
        <ButtonLink href="/wishlist">Open Wishlist</ButtonLink>
      </div>
    </div>
  );
}

function ReturnsPanel() {
  return (
    <div>
      <PanelTitle
        description="Check return eligibility before opening a support request."
        eyebrow="Returns"
        title="Returns & refunds"
      />
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {[
          "Standard unused products can be return eligible.",
          "Custom and personalized products are checked under custom-order rules."
        ].map((item) => (
          <p className="flex gap-3 rounded-2xl bg-brand-cream p-4 text-sm leading-6 text-brand-charcoal/65" key={item}>
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand-gold" />
            {item}
          </p>
        ))}
      </div>
      <ButtonLink className="mt-5" href="/returns-refunds" variant="secondary">
        View Return Policy
      </ButtonLink>
    </div>
  );
}

function NotificationsPanel() {
  const notifications = [
    "Custom order CO-1044 approved for payment.",
    "Pearl Line Earrings stock alert enabled.",
    "Festival campaign coupon RIDA10 available."
  ];

  return (
    <div>
      <PanelTitle
        description="Account alerts, order updates, wishlist reminders, and offers."
        eyebrow="Notifications"
        title="Recent updates"
      />
      <div className="mt-6 grid gap-3">
        {notifications.map((item) => (
          <div className="rounded-2xl bg-brand-cream p-4 text-sm text-brand-charcoal/70" key={item}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function SupportPanel() {
  return (
    <div>
      <PanelTitle
        description="Get help with orders, delivery, payments, custom requests, or account access."
        eyebrow="Support"
        title="Customer support"
      />
      <div className="mt-6 flex flex-wrap gap-3">
        <ButtonLink href="/contact">Contact Support</ButtonLink>
        <ButtonLink href="/orders" variant="secondary">
          Track Orders
        </ButtonLink>
      </div>
    </div>
  );
}
