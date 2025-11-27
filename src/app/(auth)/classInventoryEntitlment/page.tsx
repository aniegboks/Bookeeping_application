// app/entitlements/page.tsx (or wherever your route is)
"use client";

import { ProtectedPage } from "@/components/auth/protected_page";
import ClassInventoryEntitlementsPage from "@/components/class_inventory_entitlement_ui/entitlement_page";

export default function EntitlementsPage() {
  return (
    <ProtectedPage 
      module="Entitlements" 
      requiredAction="read"
      redirectTo="/dashboard"
    >
      <ClassInventoryEntitlementsPage />
    </ProtectedPage>
  );
}