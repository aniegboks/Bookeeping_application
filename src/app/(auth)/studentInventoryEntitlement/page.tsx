// app/student-inventory-collection/page.tsx
"use client";

import { ProtectedPage } from "@/components/auth/protected_page";
import StudentInventoryCollectionPage from "@/components/student_inventory_collection/student_inventory_collection";

export default function StudentInventoryCollectionPageWrapper() {
  return (
    <ProtectedPage 
      module="StudentInventoryCollection" 
      requiredAction="read"
      redirectTo="/dashboard"
    >
      <StudentInventoryCollectionPage />
    </ProtectedPage>
  );
}