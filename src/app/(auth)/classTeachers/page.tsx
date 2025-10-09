"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { ClassTeacher } from "@/lib/types/class_teacher";
import { classTeacherApi } from "@/lib/class_teacher";
import Container from "@/components/ui/container";
import Loader from "@/components/ui/loading_spinner";
import StatsCards from "@/components/class_teachers_ui/stats_card";
import Controls from "@/components/class_teachers_ui/control";
import TeacherTable from "@/components/class_teachers_ui/table";
import TeacherForm from "@/components/class_teachers_ui/form";
import DeleteModal from "@/components/class_teachers_ui/modal";
import { AcademicSession as AcademicSessionType } from "@/lib/types/academic_session";
import { academicSessionsApi } from "@/lib/academic_session";
import { SchoolClass } from "@/lib/types/classes";
import { schoolClassApi } from "@/lib/classes";
import { User } from "@/lib/types/user";
import { userApi } from "@/lib/user";
import SmallLoader from "@/components/ui/small_loader";
import TeacherStatusChart from "@/components/class_teachers_ui/trends";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";

export default function ClassTeachersPage() {
  const [teachers, setTeachers] = useState<ClassTeacher[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [academicSessions, setAcademicSessions] = useState<AcademicSessionType[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [dependenciesLoading, setDependenciesLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<ClassTeacher | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTeacher, setDeletingTeacher] = useState<ClassTeacher | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Load Data Functions ---
  const loadTeachers = async () => {
    try {
      setLoading(true);
      const data = await classTeacherApi.getAll();
      setTeachers(data);
    } catch (err: any) {
      console.error("Failed to load class teachers:", err);
      toast.error("Failed to load class teachers: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const data = await schoolClassApi.getAll();
      setClasses(data);
    } catch (err: any) {
      console.error("Failed to load classes:", err);
      toast.error("Failed to load classes: " + err.message);
    }
  };

  const loadAcademicSessions = async () => {
    try {
      const data = await academicSessionsApi.getAll();
      setAcademicSessions(data);
    } catch (err: any) {
      console.error("Failed to load academic sessions:", err);
      toast.error("Failed to load academic sessions: " + err.message);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await userApi.getAll();
      setUsers(data);
    } catch (err: any) {
      console.error("Failed to load users/teachers:", err);
      toast.error("Failed to load users/teachers: " + err.message);
    }
  };

  // --- Initial Data Fetching ---
  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true);
      setDependenciesLoading(true);
      await Promise.all([loadTeachers(), loadClasses(), loadAcademicSessions(), loadUsers()]);
      setDependenciesLoading(false);
      setInitialLoading(false);
    };

    loadInitialData();
  }, []);

  // --- Filter Teachers ---
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.class_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.teacher_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.session_term_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || teacher.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // --- CRUD Handlers ---
  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading(
      editingTeacher ? "Updating teacher assignment..." : "Creating teacher assignment..."
    );

    try {
      if (editingTeacher) {
        await classTeacherApi.update(editingTeacher.id, data);
        toast.dismiss(loadingToast);
        toast.success("Teacher assignment updated successfully!");
      } else {
        await classTeacherApi.create(data);
        toast.dismiss(loadingToast);
        toast.success("Teacher assignment created successfully!");
      }

      setShowForm(false);
      setEditingTeacher(null);
      await loadTeachers();
    } catch (err: any) {
      toast.dismiss(loadingToast);
      console.error("Form submission failed:", err);
      toast.error("Failed to save teacher assignment: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (teacher: ClassTeacher) => {
    setEditingTeacher(teacher);
    setShowForm(true);
  };

  const handleDeleteRequest = (teacher: ClassTeacher) => {
    setDeletingTeacher(teacher);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingTeacher) return;
    setIsDeleting(true);
    const loadingToast = toast.loading("Deleting teacher assignment...");
    try {
      await classTeacherApi.delete(deletingTeacher.id);
      toast.dismiss(loadingToast);
      toast.success("Teacher assignment deleted successfully!");
      setShowDeleteModal(false);
      setDeletingTeacher(null);
      await loadTeachers();
    } catch (err: any) {
      toast.dismiss(loadingToast);
      console.error("Delete failed:", err);
      toast.error("Failed to delete teacher assignment: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTeacher(null);
    toast("Form canceled", { icon: "ℹ️" });
  };

  const handleAdd = () => {
    setEditingTeacher(null);
    setShowForm(true);
  };

  // --- Export to Excel ---
  const exportToExcel = () => {
    if (filteredTeachers.length === 0) {
      toast("No data to export", { icon: "ℹ️" });
      return;
    }

    const data = filteredTeachers.map((t) => {
      const classInfo = classes.find((c) => c.id === t.class_id);
      const userInfo = users.find((u) => u.id === t.teacher_id);
      const sessionInfo = academicSessions.find((s) => s.id === t.session_term_id);

      return {
        "Teacher Name": userInfo?.name || "",
        "Email": t.email || "",
        "Class": classInfo?.name || "",
        "Session": sessionInfo?.name || "",
        "Status": t.status,
        "ID": t.id,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Teachers");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `teachers_export_${new Date().toISOString()}.xlsx`);
  };

  // --- UI Rendering ---
  if (initialLoading) {
    return (
      <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#F3F4F7] z-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="">
      <Container>
        <div className="mt-4 pb-8">
          <StatsCards teachers={teachers} filteredTeachers={filteredTeachers} />
          <TeacherStatusChart teachers={teachers} />

          <Controls
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onAdd={handleAdd}
          />

          {showForm && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#171D26] mb-4">
                {editingTeacher ? "Edit Teacher Assignment" : "Create New Teacher Assignment"}
              </h2>
              {dependenciesLoading ? (
                <span className="flex">
                  <SmallLoader />
                  <p className="text-sm">Loading form dependencies...</p>
                </span>
              ) : (
                <TeacherForm
                  teacher={editingTeacher || undefined}
                  onSubmit={handleFormSubmit}
                  onCancel={handleCancel}
                  isSubmitting={isSubmitting}
                  classes={classes}
                  academicSessions={academicSessions}
                  users={users}
                />
              )}
            </div>
          )}

          <TeacherTable
            teachers={filteredTeachers}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            loading={loading}
          />

          {showDeleteModal && deletingTeacher && (
            <DeleteModal
              teacher={deletingTeacher}
              onConfirm={confirmDelete}
              onCancel={() => {
                setShowDeleteModal(false);
                setDeletingTeacher(null);
                toast("Delete canceled", { icon: "ℹ️" });
              }}
              isDeleting={isDeleting}
            />
          )}

          {/* Export Button */}
          <div className="mt-4 flex justify-start">
            <button
              className="px-4 py-2 rounded bg-[#3D4C63] hover:bg-[#495C79] text-white
 transition"
              onClick={exportToExcel}
            >
              <span className="flex gap-2">
                <Download className="w-5 h-5" />
                Export
              </span>
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
}
