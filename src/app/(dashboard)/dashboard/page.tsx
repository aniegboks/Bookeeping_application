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
    } catch (err) {
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
    <div className="min-h-screen bg-[#F3F4F7] p-6">
      <Container>
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#171D26] mb-2">
              Academic Sessions Dashboard
            </h1>
            <p className="text-gray-600">Manage your academic sessions and terms</p>
          </div>

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
      </Container>
      <Container>
        <div className="flex items-center justify-start mt-4">
          <button
            onClick={downloadSpreadsheet}
            className="bg-[#687EA2] text-white px-4 py-2 rounded hover:bg-[#687EA2] transition mt-4"
          >
            Download Spreadsheet
          </button>
        </div>
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
