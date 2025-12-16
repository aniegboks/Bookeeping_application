"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useUser } from "@/contexts/UserContext";
import { ClassTeacher, CreateClassTeacherInput, UpdateClassTeacherInput } from "@/lib/types/class_teacher";
import { classTeacherApi } from "@/lib/class_teacher";
import Container from "@/components/ui/container";
import Loader from "@/components/ui/loading_spinner";
import StatsCards from "@/components/class_teachers_ui/stats_card";
import Controls from "@/components/class_teachers_ui/control";
import TeacherTable from "@/components/class_teachers_ui/table";
import TeacherForm from "@/components/class_teachers_ui/form";
import DeleteModal from "@/components/class_teachers_ui/modal";
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
  const { canPerformAction } = useUser();
  
  const canCreate = canPerformAction("Teachers", "create");
  const canUpdate = canPerformAction("Teachers", "update");
  const canDelete = canPerformAction("Teachers", "delete");

  const [teachers, setTeachers] = useState<ClassTeacher[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
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
    setLoading(true);
    try {
      const data = await classTeacherApi.getAll();
      setTeachers(data);
      
      // Only show success on initial load
      if (initialLoading) {
        toast.success(`Successfully loaded ${data.length} teacher assignment${data.length !== 1 ? 's' : ''}`);
      }
    } catch (err) {
      console.error("Failed to load class teachers:", err);
      
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Unable to load teacher assignments. Please refresh the page or contact support.";
      
      toast.error(errorMessage, {
        duration: 5000,
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const data = await schoolClassApi.getAll();
      setClasses(data);
    } catch (err) {
      console.error("Failed to load classes:", err);
      
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Unable to load classes. Some features may not work correctly.";
      
      toast.error(errorMessage, {
        duration: 5000,
      });
    }
  };

  const loadUsers = async () => {
    try {
      const data = await userApi.getAll();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users/teachers:", err);
      
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Unable to load users. Some features may not work correctly.";
      
      toast.error(errorMessage, {
        duration: 5000,
      });
    }
  };

  // --- Initial Data Fetching ---
  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true);
      setDependenciesLoading(true);
      await Promise.all([loadTeachers(), loadClasses(), loadUsers()]);
      setDependenciesLoading(false);
      setInitialLoading(false);
    };
    loadInitialData();
  }, []);

  // --- Filter Teachers ---
  const filteredTeachers: ClassTeacher[] = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.class_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (teacher.teacher_id ?? "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || teacher.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // --- CRUD Handlers ---
  const handleFormSubmit = async (data: CreateClassTeacherInput | UpdateClassTeacherInput) => {
    if (editingTeacher && !canUpdate) {
      toast.error("You don't have permission to update teacher assignments");
      return;
    }
    if (!editingTeacher && !canCreate) {
      toast.error("You don't have permission to create teacher assignments");
      return;
    }

    setIsSubmitting(true);
    const isCreating = !editingTeacher;
    const teacherIdentifier = editingTeacher?.name || data.name;
    const className = classes.find(c => c.id === data.class_id)?.name || "class";
    
    const loadingToast = toast.loading(
      isCreating 
        ? `Assigning ${teacherIdentifier} to ${className}...` 
        : `Updating assignment for ${teacherIdentifier}...`
    );

    try {
      if (editingTeacher) {
        const updateData: UpdateClassTeacherInput = data;
        const updated = await classTeacherApi.update(editingTeacher.id, updateData);
        
        toast.dismiss(loadingToast);
        toast.success(
          `Teacher assignment updated: ${updated.name} is now assigned to ${classes.find(c => c.id === updated.class_id)?.name || 'class'}`,
          { duration: 4000 }
        );
      } else {
        const createData: CreateClassTeacherInput = data as CreateClassTeacherInput;
        const created = await classTeacherApi.create(createData);
        
        toast.dismiss(loadingToast);
        toast.success(
          `Teacher assigned successfully: ${created.name} is now assigned to ${className}`,
          { duration: 4000 }
        );
      }

      setShowForm(false);
      setEditingTeacher(null);
      await loadTeachers();
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error("Form submission failed:", err);
      
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Unable to save teacher assignment. Please check your input and try again.";
      
      toast.error(errorMessage, {
        duration: 6000,
        position: "top-center",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (teacher: ClassTeacher) => {
    if (!canUpdate) {
      toast.error("You don't have permission to update teacher assignments");
      return;
    }
    setEditingTeacher(teacher);
    setShowForm(true);
    
    const className = classes.find(c => c.id === teacher.class_id)?.name || "class";
    toast(`Editing assignment: ${teacher.name} → ${className}`, { icon: "✏️" });
  };

  const handleDeleteRequest = (teacher: ClassTeacher) => {
    if (!canDelete) {
      toast.error("You don't have permission to delete teacher assignments");
      return;
    }
    setDeletingTeacher(teacher);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingTeacher) return;
    
    if (!canDelete) {
      toast.error("You don't have permission to delete teacher assignments");
      return;
    }

    setIsDeleting(true);
    const teacherName = deletingTeacher.name || deletingTeacher.email;
    const className = classes.find(c => c.id === deletingTeacher.class_id)?.name || "class";
    const loadingToast = toast.loading(`Removing ${teacherName} from ${className}...`);

    try {
      await classTeacherApi.delete(deletingTeacher.id);
      
      toast.dismiss(loadingToast);
      toast.success(
        `Teacher assignment deleted: ${teacherName} removed from ${className}`,
        { duration: 4000 }
      );
      
      setShowDeleteModal(false);
      setDeletingTeacher(null);
      await loadTeachers();
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error("Delete failed:", err);
      
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Unable to delete teacher assignment. Please try again or contact support.";
      
      toast.error(errorMessage, {
        duration: 6000,
        position: "top-center",
      });
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
    if (!canCreate) {
      toast.error("You don't have permission to create teacher assignments");
      return;
    }
    setEditingTeacher(null);
    setShowForm(true);
  };

  // --- Export to Excel ---
  const exportToExcel = () => {
    if (filteredTeachers.length === 0) {
      toast("No teacher assignments to export", { icon: "⚠️" });
      return;
    }

    try {
      const data = filteredTeachers.map((t) => {
        const classInfo = classes.find((c) => c.id === t.class_id);

        return {
          "Teacher Name": t.name || "",
          "Teacher Email": t.email || "",
          "Class": classInfo?.name || "",
          "Role": t.role || "",
          "Status": t.status || "",
          "Assigned At": t.assigned_at ? new Date(t.assigned_at).toLocaleDateString() : "",
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Teachers");

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
      
      const fileName = `teacher_assignments_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, fileName);
      
      toast.success(
        `Successfully exported ${filteredTeachers.length} teacher assignment${filteredTeachers.length !== 1 ? 's' : ''} to ${fileName}`
      );
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export teacher assignments. Please try again or contact support.", {
        duration: 4000,
      });
    }
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
    <div>
      <Container>
        <div className="mt-4 pb-8">
          <Controls
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onAdd={handleAdd}
            canCreate={canCreate}
          />

          {showForm && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#171D26] mb-4">
                {editingTeacher ? "Edit Teacher Assignment" : "Create New Teacher Assignment"}
              </h2>
              {dependenciesLoading ? (
                <span className="flex items-center gap-2">
                  <SmallLoader />
                  <p className="text-sm">Loading form dependencies...</p>
                </span>
              ) : (
                <TeacherForm
                  initialTeacher={editingTeacher || undefined}
                  onSubmit={handleFormSubmit}
                  onCancel={handleCancel}
                  isSubmitting={isSubmitting}
                  classes={classes}
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
            classes={classes}
            canUpdate={canUpdate}
            canDelete={canDelete}
          />

          <div className="mt-4 flex justify-start">
            <button
              className="px-4 py-2 rounded bg-[#3D4C63] hover:bg-[#495C79] text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={exportToExcel}
              disabled={filteredTeachers.length === 0}
            >
              <span className="flex gap-2">
                <Download className="w-5 h-5" />
                Export {filteredTeachers.length > 0 && `(${filteredTeachers.length})`}
              </span>
            </button>
          </div>

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