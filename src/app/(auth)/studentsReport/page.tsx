// app/student-inventory-report/page.tsx
"use client";

import { ProtectedPage } from "@/components/auth/protected_page";
import StudentInventoryReportPage from "@/components/student_report_ui/student_report_page";

export default function StudentInventoryReportPageWrapper() {
  return (
    <ProtectedPage 
      module="Student Inventory Report" 
      requiredAction="read"
      redirectTo="/dashboard"
    >
      <StudentInventoryReportPage />
    </ProtectedPage>
  );
}