// app/categories/page.tsx
"use client";

import { ProtectedPage } from "@/components/auth/protected_page";
import CategoriesManagement from "@/components/categories_ui/categories_page";

export default function CategoriesPage() {
  return (
    <ProtectedPage 
      module="Categories" 
      requiredAction="read"
      redirectTo="/dashboard"
    >
      <CategoriesManagement />
    </ProtectedPage>
  );
}