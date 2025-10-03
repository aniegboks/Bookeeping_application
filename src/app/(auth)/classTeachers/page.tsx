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
// Corrected import: Use the type for state and the API for fetching
import { AcademicSession as AcademicSessionType } from "@/lib/types/academic_session";
import { academicSessionsApi } from "@/lib/academic_session"; // Assuming you have an API for academic sessions
import { SchoolClass } from "@/lib/types/classes";
import { schoolClassApi } from "@/lib/classes";
import { User } from "@/lib/types/user";
import { userApi } from "@/lib/user";
import SmallLoader from "@/components/ui/small_loader";

// Define the type for the API function to use for academic sessions
// NOTE: I've replaced the redundant/incorrect import:
// import { AcademicSession } from "@/lib/academic_session";
// import { AcademicSession as AcademicSessionProps } from "@/lib/types/academic_session";

export default function ClassTeachersPage() {
  const [teachers, setTeachers] = useState<ClassTeacher[]>([]);
  // Use the imported types for the state
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [academicSessions, setAcademicSessions] = useState<AcademicSessionType[]>([]);
  // Assuming 'users' are the potential teachers
  const [users, setUsers] = useState<User[]>([]); 

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [dependenciesLoading, setDependenciesLoading] = useState(false); // New state for loading classes/sessions/users

  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<ClassTeacher | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTeacher, setDeletingTeacher] = useState<ClassTeacher | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Load Data Functions ---

  // Load class teachers
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
      // Removed setInitialLoading(false) here, as it should wait for all initial data
    }
  };

  // Load School Classes
  const loadClasses = async () => {
    try {
      const data = await schoolClassApi.getAll(); // Assuming getAll exists
      setClasses(data);
    } catch (err: any) {
      console.error("Failed to load classes:", err);
      toast.error("Failed to load classes: " + err.message);
      // It's crucial to still set initialLoading to false in a multi-load scenario
      // or handle the error gracefully to avoid a permanent loader.
    }
  };

  // Load Academic Sessions
  const loadAcademicSessions = async () => {
    try {
      // Assuming academicSessionApi is available and has an getAll method
      const data = await academicSessionsApi.getAll(); 
      setAcademicSessions(data);
    } catch (err: any) {
      console.error("Failed to load academic sessions:", err);
      toast.error("Failed to load academic sessions: " + err.message);
    }
  };

  // Load Users (for potential teachers)
  const loadUsers = async () => {
    try {
      // Assuming userApi is available and has an getAll method, 
      // or a specific endpoint to get only teachers/staff
      const data = await userApi.getAll(); 
      // OPTIONAL: Filter users to only include those who can be teachers, 
      // if your API doesn't do this already.
      setUsers(data); 
    } catch (err: any) {
      console.error("Failed to load users/teachers:", err);
      toast.error("Failed to load users/teachers: " + err.message);
    }
  };

  // --- Initial Data Fetching Effect ---
  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true);
      setDependenciesLoading(true); // Indicate that classes, sessions, and users are loading

      // Load all data concurrently
      await Promise.all([
        loadTeachers(),
        loadClasses(),
        loadAcademicSessions(),
        loadUsers(),
      ]);

      setDependenciesLoading(false);
      setInitialLoading(false);
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this runs once on mount

  // --- Filter Teachers ---

  // Filter teachers (updated to include academic_session_id in search)
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) || // Added optional chaining for safety
      teacher.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.class_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.teacher_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.session_term_id?.toLowerCase().includes(searchTerm.toLowerCase()); // Assuming academic_session_id is part of ClassTeacher type

    const matchesStatus = !statusFilter || teacher.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // --- CRUD Handlers (Unchanged logic, just maintaining the code structure) ---

  // Handle form submission (create/update)
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
      await loadTeachers(); // Reload list after successful operation
    } catch (err: any) {
      toast.dismiss(loadingToast);
      console.error("Form submission failed:", err);
      toast.error("Failed to save teacher assignment: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (teacher: ClassTeacher) => {
    setEditingTeacher(teacher);
    setShowForm(true);
  };

  // Handle delete request
  const handleDeleteRequest = (teacher: ClassTeacher) => {
    setDeletingTeacher(teacher);
    setShowDeleteModal(true);
  };

  // Confirm delete
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
      await loadTeachers(); // Reload list after successful operation
    } catch (err: any) {
      toast.dismiss(loadingToast);
      console.error("Delete failed:", err);
      toast.error("Failed to delete teacher assignment: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowForm(false);
    setEditingTeacher(null);
    toast("Form canceled", { icon: "ℹ️" });
  };

  // Handle add new
  const handleAdd = () => {
    setEditingTeacher(null);
    setShowForm(true);
  };

  // --- UI Rendering ---

  // Initial loading screen (for all essential data)
  if (initialLoading) {
    return (
      <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#F3F4F7] z-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F7]">
      <Container>
        <div className="mt-24 pb-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#171D26] mb-2">
              Class Teacher Assignments
            </h1>
            <p className="text-gray-600">
              Manage class teacher assignments and responsibilities
            </p>
          </div>

          {/* Stats Cards */}
          <StatsCards teachers={teachers} filteredTeachers={filteredTeachers} />

          {/* Controls */}
          <Controls
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onAdd={handleAdd}
            // You might want to pass loading state to Controls to disable the Add button
            // if dependencies are still loading, although initialLoading handles the main block.
            // dependenciesLoading={dependenciesLoading} 
          />

          {/* Form Modal */}
          {showForm && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#171D26] mb-4">
                {editingTeacher ? "Edit Teacher Assignment" : "Create New Teacher Assignment"}
              </h2>
              {dependenciesLoading ? (
                // Show a mini loader if the data for the form fields (classes, users, sessions) is still being fetched
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
                  // New Props for dropdowns
                  classes={classes}
                  academicSessions={academicSessions}
                  users={users} // Potential teachers
                />
              )}
            </div>
          )}

          {/* Table */}
          <TeacherTable
            teachers={filteredTeachers}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            loading={loading}
          />

          {/* Delete Modal */}
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
        </div>
      </Container>
    </div>
  );
}