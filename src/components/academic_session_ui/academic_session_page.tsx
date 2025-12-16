// components/academic_session_ui/academic_sessions_page.tsx
"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useUser } from "@/contexts/UserContext";
import { AcademicSession, CreateAcademicSessionData } from "@/lib/types/academic_session";
import SessionsTable from "@/components/academic_session_ui/sessions_table";
import SessionModal from "@/components/academic_session_ui/session_modal";
import Loader from "@/components/ui/loading_spinner";
import Container from "@/components/ui/container";
import { Download } from "lucide-react";

export default function AcademicSessionsManagement() {
  const { canPerformAction } = useUser();
  
  const canCreate = canPerformAction("Academic Sessions", "create");
  const canUpdate = canPerformAction("Academic Sessions", "update");
  const canDelete = canPerformAction("Academic Sessions", "delete");

  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState<AcademicSession | null>(null);
  const [formData, setFormData] = useState<CreateAcademicSessionData>({
    session: "",
    name: "",
    start_date: "",
    end_date: "",
    status: "active",
  });

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/academic_session");
      
      if (!res.ok) {
        // Enhanced error handling with status codes
        let errorMessage = "Unable to load academic sessions. ";
        
        if (res.status === 404) {
          errorMessage += "The sessions endpoint was not found.";
        } else if (res.status === 500) {
          errorMessage += "A server error occurred. Please try again later.";
        } else if (res.status === 403) {
          errorMessage += "You don't have permission to view sessions.";
        } else if (res.status === 401) {
          errorMessage += "Please log in to continue.";
        } else {
          errorMessage += "Please check your connection and try again.";
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await res.json();
      setSessions(data);
    } catch (error) {
      // Distinguish between network errors and API errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error("Network error: Unable to connect to the server. Please check your internet connection.", {
          duration: 5000,
        });
      } else if (error instanceof Error) {
        toast.error(error.message, { duration: 5000 });
      } else {
        toast.error("An unexpected error occurred while loading sessions.", { duration: 5000 });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const openCreateModal = () => {
    if (!canCreate) {
      toast.error("Access denied: You don't have permission to create academic sessions. Please contact your administrator.", {
        duration: 4000,
      });
      return;
    }
    setEditingSession(null);
    setFormData({
      session: "",
      name: "",
      start_date: "",
      end_date: "",
      status: "active",
    });
    setShowModal(true);
  };

  const openEditModal = (session: AcademicSession) => {
    if (!canUpdate) {
      toast.error("Access denied: You don't have permission to update academic sessions. Please contact your administrator.", {
        duration: 4000,
      });
      return;
    }
    setEditingSession(session);
    setFormData({
      session: session.session,
      name: session.name,
      start_date: session.start_date,
      end_date: session.end_date,
      status: session.status,
    });
    setShowModal(true);
  };

  const downloadSpreadsheet = () => {
    try {
      if (sessions.length === 0) {
        toast.error("No data to export: There are no academic sessions available to download.", {
          duration: 3000,
        });
        return;
      }

      // Convert sessions array to worksheet
      const worksheet = XLSX.utils.json_to_sheet(sessions);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Academic Sessions");

      // Write workbook and save as file
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(blob, `academic_sessions_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success(`Successfully exported ${sessions.length} session(s) to Excel.`, {
        duration: 3000,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export failed: Unable to generate Excel file. Your browser may not support file downloads.", {
        duration: 4000,
      });
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6">
      <Container>
        <div className="mb-8 flex justify-between items-center mt-2">
          {/* Additional header content */}
        </div>

        <SessionsTable
          sessions={sessions}
          setSessions={setSessions}
          openCreateModal={openCreateModal}
          openEditModal={openEditModal}
          canCreate={canCreate}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />

        <Container>
          <div className="flex items-center justify-start mt-4">
            <button
              onClick={downloadSpreadsheet}
              className="bg-[#3D4C63] text-white flex items-center gap-2 hover:bg-[#495C79] transition-colors px-4 py-2 rounded-sm text-sm"
            >
              <Download className="w-5 h-5" />
              <span>Export</span>
            </button>
          </div>
        </Container>
      </Container>

      {showModal && (canCreate || canUpdate) && (
        <SessionModal
          formData={formData}
          setFormData={setFormData}
          editingSession={editingSession}
          setEditingSession={setEditingSession}
          setShowModal={setShowModal}
          setSessions={setSessions}
          sessions={sessions}
        />
      )}
    </div>
  );
}