// app/brands/page.tsx
"use client";

import { ProtectedPage } from "@/components/auth/protected_page";
import BrandsManagement from "@/components/brands_ui/brands_page";

export default function BrandsPage() {
  return (
    <ProtectedPage 
      module="Brands" 
      requiredAction="read"
      redirectTo="/dashboard"
    >
      <BrandsManagement />
    </ProtectedPage>
  );
}