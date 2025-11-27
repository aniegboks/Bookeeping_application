// app/students/page.tsx
"use client";

import { ProtectedPage } from "@/components/auth/protected_page";
import StudentsManagement from "@/components/students_ui/student_page_ui";

export default function StudentsPage() {
  return (
    <ProtectedPage 
      module="Students" 
      requiredAction="read"
      redirectTo="/dashboard"
    >
      <StudentsManagement />
    </ProtectedPage>
  );
}