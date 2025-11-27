// app/role-menus/page.tsx
"use client";

import { ProtectedPage } from "@/components/auth/protected_page";
import RoleMenusPage from "@/components/roles_menu/roles_menu_page";

export default function RoleMenusPageWrapper() {
  return (
    <ProtectedPage 
      module="RoleMenus" 
      requiredAction="read"
      redirectTo="/dashboard"
    >
      <RoleMenusPage />
    </ProtectedPage>
  );
}