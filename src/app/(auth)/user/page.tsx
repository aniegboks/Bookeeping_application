// app/users/page.tsx
"use client";

import { ProtectedPage } from "@/components/auth/protected_page";
import UsersPage from "@/components/user_id/user_page";

export default function UsersPageWrapper() {
  return (
    <ProtectedPage 
      module="Users" 
      requiredAction="read"
      redirectTo="/dashboard"
    >
      <UsersPage />
    </ProtectedPage>
  );
}