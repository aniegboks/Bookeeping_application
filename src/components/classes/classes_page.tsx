"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useUser } from "@/contexts/UserContext";
import { ClassTeacher } from "@/lib/types/class_teacher";
import { User } from "@/lib/types/user";
import { schoolClassApi } from "@/lib/classes";
import { classTeacherApi } from "@/lib/class_teacher";
import { userApi } from "@/lib/user";

import Container from "@/components/ui/container";
import Loader from "@/components/ui/loading_spinner";
import StatsCards from "@/components/classes/stats_card";
import Controls from "@/components/classes/controls";
import ClassTable from "@/components/classes/tables";
import ClassForm from "@/components/classes/form";
import DeleteModal from "@/components/classes/modal";
import Trends from "@/components/classes/trends";
import { CreateSchoolClassInput, UpdateSchoolClassInput, SchoolClass } from "@/lib/types/classes";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";

export default function SchoolClassesPage() {
  // Get permission checker from UserContext
  const { canPerformAction } = useUser();
  
  // Check permissions for different actions
  const canCreate = canPerformAction("Classes", "create");
  const canUpdate = canPerformAction("Classes", "update");
  const canDelete = canPerformAction("Classes", "delete");

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [classTeachers, setClassTeachers] = useState<ClassTeacher[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingClass, setDeletingClass] = useState<SchoolClass | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // -------------------- LOAD DATA --------------------
  const loadData = async () => {
    try {
      setLoading(true);
      const [classData, teacherData, userData]: [SchoolClass[], ClassTeacher[], User[]] =
        await Promise.all([schoolClassApi.getAll(), classTeacherApi.getAll(), userApi.getAll()]);

      setClasses(classData);
      setClassTeachers(teacherData);
      setUsers(userData);
    } catch (err: unknown) {
      console.error("Failed to load data:", err);
      
      if (err instanceof Error) {
        toast.error(err.message, { duration: 5000 });
      } else {
        toast.error(
          "Unable to load class information. Please refresh the page or contact support if the problem continues.",
          { duration: 5000 }
        );
      }
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // -------------------- HELPER FUNCTIONS --------------------
  const getTeacherName = (classId: string) => {
    const assignedTeacher = classTeachers.find((t) => t.class_id === classId);
    if (!assignedTeacher) return "Unassigned";
    const user = users.find((u) => u.id === assignedTeacher.teacher_id);
    return user?.username || user?.name || assignedTeacher?.name || "Unknown";
  };

  // -------------------- FILTER & TABLE DATA --------------------
  const filteredClasses = classes.filter((schoolClass) => {
    const searchLower = searchTerm.toLowerCase();
    const teacherName = getTeacherName(schoolClass.id).toLowerCase();

    return (
      (schoolClass.name.toLowerCase().includes(searchLower) ||
        schoolClass.id.toLowerCase().includes(searchLower) ||
        teacherName.includes(searchLower)) &&
      (!statusFilter || schoolClass.status === statusFilter)
    );
  });

  const classesWithNames = filteredClasses.map((schoolClass) => ({
    ...schoolClass,
    teacher_name: getTeacherName(schoolClass.id),
  }));

  // -------------------- HANDLERS --------------------
  const handleFormSubmit = async (data: CreateSchoolClassInput | UpdateSchoolClassInput) => {
    // Double-check permissions
    if (editingClass && !canUpdate) {
      toast.error("You don't have permission to update classes. Please contact your administrator.", {
        duration: 4000,
      });
      return;
    }
    if (!editingClass && !canCreate) {
      toast.error("You don't have permission to create classes. Please contact your administrator.", {
        duration: 4000,
      });
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading(
      editingClass ? "Updating class information..." : "Creating new class..."
    );

    try {
      if (editingClass) {
        await schoolClassApi.update(editingClass.id, data as UpdateSchoolClassInput);
        toast.success(`Class "${editingClass.name}" has been updated successfully!`, {
          duration: 3000,
        });
      } else {
        const createdClass = await schoolClassApi.create(data as CreateSchoolClassInput);
        toast.success(`Class "${(data as CreateSchoolClassInput).name}" has been created successfully!`, {
          duration: 3000,
        });
      }

      toast.dismiss(loadingToast);
      setShowForm(false);
      setEditingClass(null);
      await loadData();
    } catch (err: unknown) {
      toast.dismiss(loadingToast);
      console.error("Form submission failed:", err);
      
      if (err instanceof Error) {
        toast.error(err.message, { duration: 5000 });
      } else {
        toast.error(
          editingClass 
            ? "Unable to update the class. Please check your input and try again."
            : "Unable to create the class. Please check your input and try again.",
          { duration: 5000 }
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (schoolClass: SchoolClass) => {
    // Check permission before opening form
    if (!canUpdate) {
      toast.error("You don't have permission to update classes. Please contact your administrator.", {
        duration: 4000,
      });
      return;
    }
    setEditingClass(schoolClass);
    setShowForm(true);
  };

  const handleDeleteRequest = (schoolClass: SchoolClass) => {
    // Check permission before opening modal
    if (!canDelete) {
      toast.error("You don't have permission to delete classes. Please contact your administrator.", {
        duration: 4000,
      });
      return;
    }
    setDeletingClass(schoolClass);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingClass) return;
    
    // Double-check permission before deleting
    if (!canDelete) {
      toast.error("You don't have permission to delete classes. Please contact your administrator.", {
        duration: 4000,
      });
      return;
    }

    setIsDeleting(true);
    const loadingToast = toast.loading(`Deleting class "${deletingClass.name}"...`);

    try {
      await schoolClassApi.delete(deletingClass.id);
      toast.success(`Class "${deletingClass.name}" has been deleted successfully!`, {
        duration: 3000,
      });
      toast.dismiss(loadingToast);
      setShowDeleteModal(false);
      setDeletingClass(null);
      await loadData();
    } catch (err: unknown) {
      toast.dismiss(loadingToast);
      console.error("Delete failed:", err);
      
      if (err instanceof Error) {
        toast.error(err.message, { duration: 5000 });
      } else {
        toast.error(
          `Unable to delete class "${deletingClass.name}". Please try again or contact support if the problem persists.`,
          { duration: 5000 }
        );
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingClass(null);
    toast("Class form has been closed", { 
      icon: "ℹ️",
      duration: 2000,
    });
  };

  const handleAdd = () => {
    // Check permission before opening form
    if (!canCreate) {
      toast.error("You don't have permission to create classes. Please contact your administrator.", {
        duration: 4000,
      });
      return;
    }
    setEditingClass(null);
    setShowForm(true);
  };

  // -------------------- EXCEL EXPORT --------------------
  const exportToExcel = () => {
    if (classesWithNames.length === 0) {
      toast("No class data available to export. Try adjusting your filters.", { 
        icon: "ℹ️",
        duration: 3000,
      });
      return;
    }

    try {
      const dataToExport = classesWithNames.map((schoolClass) => {
        const createdByUser = users.find((u) => u.id === schoolClass.created_by);
        const createdByName =
          createdByUser?.username ?? createdByUser?.name ?? schoolClass.created_by;

        return {
          "Class Name": schoolClass.name,
          Status: schoolClass.status.charAt(0).toUpperCase() + schoolClass.status.slice(1),
          "Class Teacher": schoolClass.teacher_name,
          "Created By": createdByName,
          "Created At": new Date(schoolClass.created_at).toLocaleString(),
          "Updated At": new Date(schoolClass.updated_at).toLocaleString(),
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "SchoolClasses");

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
      const fileName = `SchoolClasses_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, fileName);

      toast.success(`Successfully exported ${classesWithNames.length} class records to Excel!`, {
        duration: 3000,
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export data to Excel. Please try again.", {
        duration: 4000,
      });
    }
  };

  if (initialLoading)
    return (
      <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#F3F4F7] z-50">
        <Loader />
      </div>
    );

  return (
    <div className="mx-6">
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
                {editingClass ? `Edit Class: ${editingClass.name}` : "Create New Class"}
              </h2>
              <ClassForm
                schoolClass={editingClass || undefined}
                onSubmit={handleFormSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
                users={users}
              />
            </div>
          )}

          <ClassTable
            classes={classesWithNames}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            loading={loading}
            users={users}
            classTeachers={classTeachers}
            canUpdate={canUpdate}
            canDelete={canDelete}
          />

          <div className="mt-4 flex justify-start">
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-[#3D4C63] hover:bg-[#495C79] text-white rounded-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={classesWithNames.length === 0}
              title={classesWithNames.length === 0 ? "No data to export" : "Export to Excel"}
            >
              <span className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export to Excel
              </span>
            </button>
          </div>

          {showDeleteModal && deletingClass && (
            <DeleteModal
              schoolClass={deletingClass}
              onConfirm={confirmDelete}
              onCancel={() => {
                setShowDeleteModal(false);
                setDeletingClass(null);
                toast("Delete action has been cancelled", { 
                  icon: "ℹ️",
                  duration: 2000,
                });
              }}
              isDeleting={isDeleting}
            />
          )}
        </div>
      </Container>
    </div>
  );
}