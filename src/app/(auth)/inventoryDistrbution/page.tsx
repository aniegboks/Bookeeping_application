"use client";

import { ProtectedPage } from "@/components/auth/protected_page";
import ClassInventoryDistributionsPage from "@/components/inventory_distribution_ui/inventory_distribution_page";

export default function DistributionsPage() {
  return (
    <ProtectedPage 
      module="Distributions" 
      requiredAction="read"
      redirectTo="/dashboard"
    >
      <ClassInventoryDistributionsPage />
    </ProtectedPage>
  );
}