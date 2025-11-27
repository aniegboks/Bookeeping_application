// app/sub-categories/page.tsx
"use client";

import { ProtectedPage } from "@/components/auth/protected_page";
import SubCategoriesManagement from "@/components/sub_categories_ui/sub_categories_page";

export default function SubCategoriesPageWrapper() {
  return (
    <ProtectedPage 
      module="Sub Categories" 
      requiredAction="read"
      redirectTo="/dashboard"
    >
      <SubCategoriesManagement />
    </ProtectedPage>
  );
}