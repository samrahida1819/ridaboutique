import { AdminProductForm } from "@/components/admin/admin-pages";

export default async function EditProductRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminProductForm productId={id} />;
}
