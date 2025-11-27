// app/menus/page.tsx
"use client";

import { ProtectedPage } from "@/components/auth/protected_page";
import MenusManagement from "@/components/menu/menu_page";

export default function MenusPage() {
  return (
    <ProtectedPage 
      module="Menus" 
      requiredAction="read"
      redirectTo="/dashboard"
    >
      <MenusManagement />
    </ProtectedPage>
  );
}