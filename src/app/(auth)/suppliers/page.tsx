// app/suppliers/page.tsx
"use client";

import { ProtectedPage } from "@/components/auth/protected_page";
import SuppliersDashboard from "@/components/suppliers_ui/supplier_page";

export default function SuppliersPage() {
  return (
    <ProtectedPage 
      module="Suppliers" 
      requiredAction="read"
      redirectTo="/dashboard"
    >
      <SuppliersDashboard />
    </ProtectedPage>
  );
}