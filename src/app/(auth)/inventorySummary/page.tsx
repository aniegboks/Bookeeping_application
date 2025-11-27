// app/inventory-summary/page.tsx
"use client";

import { ProtectedPage } from "@/components/auth/protected_page";
import InventorySummaryPage from "@/components/inventory_summary/inventory_summary_page";

export default function InventorySummaryRoute() {
  return (
    <ProtectedPage 
      module="Inventory Summary" 
      requiredAction="read"
      redirectTo="/dashboard"
    >
      <InventorySummaryPage />
    </ProtectedPage>
  );
}