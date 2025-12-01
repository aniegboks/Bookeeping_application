// app/uom/page.tsx
"use client";

import { ProtectedPage } from "@/components/auth/protected_page";
import UOMManagement from "@/components/uom_ui/uom_page";

export default function UOMPageWrapper() {
  return (
    <ProtectedPage
      module="UOM"
      requiredAction="read"
      redirectTo="/dashboard"
    >
      <UOMManagement />
    </ProtectedPage>
  );
}