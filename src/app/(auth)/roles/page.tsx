// app/roles/page.tsx
"use client";

import { ProtectedPage } from "@/components/auth/protected_page";
import RolesPage from "@/components/roles/roles_page";

export default function RolesPageWrapper() {
  return (
    <ProtectedPage 
      module="Roles" 
      requiredAction="read"
      redirectTo="/dashboard"
    >
      <RolesPage />
    </ProtectedPage>
  );
}