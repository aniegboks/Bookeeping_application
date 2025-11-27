// app/classes/page.tsx
"use client";

import { ProtectedPage } from "@/components/auth/protected_page";
import SchoolClassesPage from "@/components/classes/classes_page";

export default function ClassesPage() {
  return (
    <ProtectedPage 
      module="Classes" 
      requiredAction="read"
      redirectTo="/dashboard"
    >
      <SchoolClassesPage />
    </ProtectedPage>
  );
}