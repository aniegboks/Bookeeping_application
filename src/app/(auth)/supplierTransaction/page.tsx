// app/supplier-transactions/page.tsx
"use client";

import { ProtectedPage } from "@/components/auth/protected_page";
import SupplierTransactionsManagement from "@/components/supplier_transaction/supplier_transaction_page";

export default function SupplierTransactionsPageWrapper() {
  return (
    <ProtectedPage 
      module="Supplier Transactions" 
      requiredAction="read"
      redirectTo="/dashboard"
    >
      <SupplierTransactionsManagement />
    </ProtectedPage>
  );
}