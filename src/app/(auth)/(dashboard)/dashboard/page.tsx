"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { AcademicSession, CreateAcademicSessionData } from "@/lib/types/academic_session";
import StatsCards from "@/components/academic_session_ui/stats_card";
import SessionsTable from "@/components/academic_session_ui/sessions_table";
import SessionModal from "@/components/academic_session_ui/session_modal";
import Loader from "@/components/ui/loading_spinner";
import Container from "@/components/ui/container";
import { Download } from "lucide-react";
import AcademicSessionsTrend from "@/components/academic_session_ui/trends";

export default function Dashboard() {
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
      if (!res.ok) throw new Error("Failed to fetch academic sessions");
      const data = await res.json();
      setSessions(data);
    } catch {
      toast.error("Failed to load academic sessions");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchSessions();
  }, []);

  // Download as Excel spreadsheet
  const downloadSpreadsheet = () => {
    if (sessions.length === 0) {
      toast.error("No sessions to download");
      return;
    }

    // Convert sessions array to worksheet
    const worksheet = XLSX.utils.json_to_sheet(sessions);

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Academic Sessions");

    // Write workbook and save as file
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "academic_sessions.xlsx");
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6">
      <Container>
        {/* Header */}
        <div className="mb-8 flex justify-between items-center mt-2">

          {/* Excel Download Button */}

        </div>

        {/* Stats */}
        <StatsCards sessions={sessions} />

        {/* Table */}
        <SessionsTable
          sessions={sessions}
          setSessions={setSessions}
          openCreateModal={() => {
            setEditingSession(null);
            setShowModal(true);
          }}
          openEditModal={(session) => {
            setEditingSession(session);
            setShowModal(true);
            setFormData({
              session: session.session,
              name: session.name,
              start_date: session.start_date,
              end_date: session.end_date,
              status: session.status,
            });
          }}
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
        <AcademicSessionsTrend sessions={sessions} />

      </Container>


      {/* Modal */}
      {showModal && (
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
