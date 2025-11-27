// app/academic-sessions/page.tsx
"use client";

import { ProtectedPage } from "@/components/auth/protected_page";
import AcademicSessionsManagement from "@/components/academic_session_ui/academic_session_page";

export default function AcademicSessionsPage() {
  return (
    <ProtectedPage 
      module="Academic Sessions" 
      requiredAction="read"
      redirectTo="/dashboard"
    >
      <AcademicSessionsManagement />
    </ProtectedPage>
  );
}