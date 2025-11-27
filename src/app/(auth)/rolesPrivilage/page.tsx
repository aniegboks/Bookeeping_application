// app/role-privileges/page.tsx
"use client";

import { ProtectedPage } from "@/components/auth/protected_page";
import RolePrivilegesPage from "@/components/roles_privilage/roles_privilage_page";

export default function RolePrivilegesPageWrapper() {
  return (
    <ProtectedPage 
      module="RolePrivileges" 
      requiredAction="read"
      redirectTo="/dashboard"
    >
      <RolePrivilegesPage />
    </ProtectedPage>
  );
}