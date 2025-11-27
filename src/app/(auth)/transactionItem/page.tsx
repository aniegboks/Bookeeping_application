// app/inventory-transactions/page.tsx
"use client";

import { ProtectedPage } from "@/components/auth/protected_page";
import InventoryTransactionsManagement from "@/components/transaction_items_ui/transaction_item_page";

export default function InventoryTransactionsPageWrapper() {
  return (
    <ProtectedPage 
      module="Inventory Transactions" 
      requiredAction="read"
      redirectTo="/dashboard"
    >
      <InventoryTransactionsManagement />
    </ProtectedPage>
  );
}