// app/teachers/page.tsx (or wherever your route is)
"use client";

import { ProtectedPage } from "@/components/auth/protected_page";
import ClassTeachersPage from "@/components/class_teachers_ui/class_teacher_page";

export default function TeachersPage() {
  return (
    <ProtectedPage 
      module="Teachers" 
      requiredAction="read"
      redirectTo="/dashboard"
    >
      <ClassTeachersPage />
    </ProtectedPage>
  );
}