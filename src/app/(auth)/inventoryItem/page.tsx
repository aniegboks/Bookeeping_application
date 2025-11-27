// app/inventory/page.tsx
"use client";

import { ProtectedPage } from "@/components/auth/protected_page";
import InventoryPage from "@/components/inventory_items_ui/inventory_item_page";

export default function InventoryRoute() {
  return (
    <ProtectedPage 
      module="Inventory" 
      requiredAction="read"
      redirectTo="/dashboard"
    >
      <InventoryPage />
    </ProtectedPage>
  );
}