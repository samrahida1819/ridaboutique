"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit, RefreshCcw, Save } from "lucide-react";
import {
  AdminCustomerRow,
  AdminNotice,
  customerDraftFromRow,
  CustomerDraft,
  PageHeader,
  selectClassName
} from "@/components/admin/shared";
import { Button } from "@/components/ui/button";
import { Field, Input, PasswordInput, Textarea } from "@/components/ui/input";
import { adminFetch } from "@/lib/admin-api-client";
import { formatDate } from "@/lib/utils";
import type { ProfileRole } from "@/types/commerce";

export function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomerRow[]>([]);
  const [draft, setDraft] = useState<CustomerDraft | null>(null);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | ProfileRole>("all");
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCustomers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return customers.filter((customer) => {
      const role = customer.role === "admin" ? "admin" : "customer";
      if (roleFilter !== "all" && role !== roleFilter) return false;
      if (!query) return true;

      return [customer.full_name, customer.email, customer.phone, customer.address]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [customers, roleFilter, searchQuery]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ customers: AdminCustomerRow[] }>("/api/admin/customers");
      setCustomers(data.customers || []);
      setMessage("");
    } catch (error) {
      setCustomers([]);
      setMessage(error instanceof Error ? error.message : "Customers load failed.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function editCustomer(customer: AdminCustomerRow) {
    setEditingId(customer.id);
    setDraft(customerDraftFromRow(customer));
    setMessage("");
  }

  function updateDraft(field: keyof CustomerDraft, value: string) {
    setDraft((current) => current ? { ...current, [field]: value } : current);
  }

  async function saveCustomer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingId || !draft) {
      return;
    }

    setSaving(true);

    try {
      await adminFetch(`/api/admin/customers/${editingId}`, {
        body: draft,
        method: "PATCH"
      });
      setMessage("Customer profile saved.");
      setEditingId("");
      setDraft(null);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Customer save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        action={<Button onClick={() => void load()} variant="outline"><RefreshCcw className="size-4" />Refresh</Button>}
        description="Edit customer profile data, contact details, and admin/customer role."
        title="Customers"
      />
      <AdminNotice message="Password changes work when SUPABASE_SERVICE_ROLE_KEY is configured. Leave the password field blank to keep it unchanged." />
      {message ? <AdminNotice message={message} /> : null}
      {draft ? (
        <form
          className="mb-5 grid gap-4 rounded-lg border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 md:grid-cols-2"
          onSubmit={saveCustomer}
        >
          <Field label="Full name">
            <Input value={draft.fullName} onChange={(event) => updateDraft("fullName", event.target.value)} />
          </Field>
          <Field label="Email">
            <Input inputMode="email" value={draft.email} onChange={(event) => updateDraft("email", event.target.value)} />
          </Field>
          <Field label="Phone">
            <Input value={draft.phone} onChange={(event) => updateDraft("phone", event.target.value)} />
          </Field>
          <Field label="Role">
            <select
              className={selectClassName}
              onChange={(event) => updateDraft("role", event.target.value as ProfileRole)}
              value={draft.role}
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </Field>
          <Field label="New password">
            <PasswordInput
              autoComplete="new-password"
              minLength={6}
              placeholder="Leave blank to keep existing password"
              value={draft.password}
              onChange={(event) => updateDraft("password", event.target.value)}
            />
          </Field>
          <Field label="Address">
            <Textarea value={draft.address} onChange={(event) => updateDraft("address", event.target.value)} />
          </Field>
          <div className="flex items-end gap-2">
            <Button disabled={saving} type="submit"><Save className="size-4" />{saving ? "Saving..." : "Save profile"}</Button>
            <Button
              onClick={() => {
                setDraft(null);
                setEditingId("");
              }}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          className="max-w-md"
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search customers by name, email, phone, or address"
          value={searchQuery}
        />
        <select className={selectClassName} onChange={(event) => setRoleFilter(event.target.value as "all" | ProfileRole)} value={roleFilter}>
          <option value="all">All roles</option>
          <option value="customer">Customers</option>
          <option value="admin">Admins</option>
        </select>
      </div>
      <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-stone-500">
            <tr>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Phone</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Address</th>
              <th className="p-4 font-medium">Joined</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr className="border-t border-stone-200 dark:border-neutral-800" key={customer.id}>
                <td className="p-4">{customer.full_name || "-"}</td>
                <td className="p-4">{customer.email || "-"}</td>
                <td className="p-4">{customer.phone || "-"}</td>
                <td className="p-4">
                  <span className="rounded-full border border-stone-200 px-2 py-1 text-xs capitalize dark:border-neutral-700">
                    {customer.role || "customer"}
                  </span>
                </td>
                <td className="max-w-[18rem] p-4">
                  <span className="line-clamp-2">{customer.address || "-"}</span>
                </td>
                <td className="p-4">{customer.created_at ? formatDate(String(customer.created_at)) : "-"}</td>
                <td className="p-4">
                  <Button onClick={() => editCustomer(customer)} size="sm" variant="outline">
                    <Edit className="size-3" />Edit
                  </Button>
                </td>
              </tr>
            ))}
            {loading ? <tr><td className="p-8 text-center text-stone-500" colSpan={7}>Loading customers...</td></tr> : null}
            {!loading && !filteredCustomers.length ? (
              <tr>
                <td className="p-8 text-center text-stone-500" colSpan={7}>
                  {customers.length ? "No customers match your filters." : "No customers yet."}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
