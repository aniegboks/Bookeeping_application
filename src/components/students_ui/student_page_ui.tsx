"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useUser } from "@/contexts/UserContext";
import { Student } from "@/lib/types/students";
import { studentApi } from "@/lib/students";
import { schoolClassApi } from "@/lib/classes";
import { userApi } from "@/lib/user";
import { SchoolClass } from "@/lib/types/classes";
import { User } from "@/lib/types/user";

import Container from "@/components/ui/container";
import Loader from "@/components/ui/loading_spinner";
import Controls from "@/components/students_ui/controls";
import StudentTable from "@/components/students_ui/table";
import StudentForm from "@/components/students_ui/form";
import DeleteModal from "@/components/students_ui/delete_modal";
import { CreateStudentInput, UpdateStudentInput } from "@/lib/types/students";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";

export default function StudentsPage() {
  const { canPerformAction } = useUser();
  
  const canCreate = canPerformAction("Students", "create");
  const canUpdate = canPerformAction("Students", "update");
  const canDelete = canPerformAction("Students", "delete");

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load all initial data
  const loadData = async () => {
    setInitialLoading(true);
    try {
      setLoading(true);
      const [studentsData, classesData, usersData] = await Promise.all([
        studentApi.getAll(),
        schoolClassApi.getAll(),
        userApi.getAll(),
      ]);

      setStudents(studentsData);
      setClasses(classesData);
      setUsers(usersData);
      
      // Success notification only on initial load
      if (initialLoading) {
        toast.success(`Successfully loaded ${studentsData.length} student${studentsData.length !== 1 ? 's' : ''}`);
      }
    } catch (err: unknown) {
      console.error("Failed to load data:", err);
      
      // Display detailed error message
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Unable to load student data. Please refresh the page or contact support.";
      
      toast.error(errorMessage, {
        duration: 5000,
        position: "top-center",
      });
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter students
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admission_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.guardian_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.middle_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesStatus = !statusFilter || student.status === statusFilter;
    const matchesGender = !genderFilter || student.gender === genderFilter;

    return matchesSearch && matchesStatus && matchesGender;
  });

  const handleExport = () => {
    if (filteredStudents.length === 0) {
      toast("No students to export", { icon: "⚠️" });
      return;
    }

    try {
      const exportData = filteredStudents.map((student) => {
        const studentClass = classes.find((cls) => cls.id === student.class_id);

        return {
          "Admission Number": student.admission_number,
          "First Name": student.first_name,
          "Middle Name": student.middle_name || "-",
          "Last Name": student.last_name,
          "Gender": student.gender,
          "Date of Birth": student.date_of_birth
            ? new Date(student.date_of_birth).toLocaleDateString()
            : "-",
          "Class": studentClass?.name || "-",
          "Guardian Name": student.guardian_name,
          "Guardian Email": student.guardian_email || "-",
          "Guardian Contact": student.guardian_contact || "-",
          "Address": student.address || "-",
          "Status": student.status,
          "Created At": student.created_at
            ? new Date(student.created_at).toLocaleDateString()
            : "-",
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const data = new Blob([excelBuffer], { type: "application/octet-stream" });
      
      const fileName = `students_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(data, fileName);

      toast.success(`Successfully exported ${filteredStudents.length} student${filteredStudents.length !== 1 ? 's' : ''} to ${fileName}`);
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Failed to export students. Please try again or contact support.", {
        duration: 4000,
      });
    }
  };

  // Form submission
  const handleFormSubmit = async (data: CreateStudentInput | UpdateStudentInput) => {
    if (editingStudent && !canUpdate) {
      toast.error("You don't have permission to update students");
      return;
    }
    if (!editingStudent && !canCreate) {
      toast.error("You don't have permission to create students");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading(
      editingStudent ? "Updating student..." : "Creating student..."
    );

    try {
      if (editingStudent) {
        const updated = await studentApi.update(editingStudent.id, data as UpdateStudentInput);
        toast.dismiss(loadingToast);
        toast.success(
          `Student ${updated.first_name} ${updated.last_name} updated successfully!`,
          { duration: 4000 }
        );
      } else {
        const created = await studentApi.create(data as CreateStudentInput);
        toast.dismiss(loadingToast);
        toast.success(
          `Student ${created.first_name} ${created.last_name} (${created.admission_number}) created successfully!`,
          { duration: 4000 }
        );
      }

      setShowForm(false);
      setEditingStudent(null);
      await loadData();
    } catch (err: unknown) {
      toast.dismiss(loadingToast);
      console.error("Form submission failed:", err);
      
      // Display the detailed error message from the API
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Unable to save student. Please check your input and try again.";
      
      toast.error(errorMessage, {
        duration: 6000,
        position: "top-center",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit
  const handleEdit = (student: Student) => {
    if (!canUpdate) {
      toast.error("You don't have permission to update students");
      return;
    }
    setEditingStudent(student);
    setShowForm(true);
    toast(`Editing ${student.first_name} ${student.last_name}`, { icon: "✏️" });
  };

  // Delete
  const handleDeleteRequest = (student: Student) => {
    if (!canDelete) {
      toast.error("You don't have permission to delete students");
      return;
    }
    setDeletingStudent(student);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingStudent) return;

    if (!canDelete) {
      toast.error("You don't have permission to delete students");
      return;
    }

    setIsDeleting(true);
    const loadingToast = toast.loading(
      `Deleting ${deletingStudent.first_name} ${deletingStudent.last_name}...`
    );

    try {
      await studentApi.delete(deletingStudent.id);
      toast.dismiss(loadingToast);
      toast.success(
        `Student ${deletingStudent.first_name} ${deletingStudent.last_name} (${deletingStudent.admission_number}) deleted successfully!`,
        { duration: 4000 }
      );
      setShowDeleteModal(false);
      setDeletingStudent(null);
      await loadData();
    } catch (err: unknown) {
      toast.dismiss(loadingToast);
      console.error("Delete failed:", err);
      
      // Display the detailed error message from the API
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Unable to delete student. Please try again or contact support.";
      
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
    setEditingStudent(null);
    toast("Form canceled", { icon: "ℹ️" });
  };

  const handleAdd = () => {
    if (!canCreate) {
      toast.error("You don't have permission to create students");
      return;
    }
    setEditingStudent(null);
    setShowForm(true);
  };

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
          <Controls
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            genderFilter={genderFilter}
            onGenderFilterChange={setGenderFilter}
            onAdd={handleAdd}
            canCreate={canCreate}
          />

          {showForm && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#171D26] mb-4">
                {editingStudent ? "Edit Student" : "Create New Student"}
              </h2>
              <StudentForm
                student={editingStudent || undefined}
                onSubmit={handleFormSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
                classes={classes}
                users={users}
              />
            </div>
          )}

          <StudentTable
            students={filteredStudents}
            onEdit={handleEdit}
            classes={classes}
            onDelete={handleDeleteRequest}
            loading={loading}
            canUpdate={canUpdate}
            canDelete={canDelete}
          />

          <div className="flex justify-start my-4">
            <button
              className="px-4 py-2 bg-[#3D4C63] hover:bg-[#495C79] text-white rounded-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleExport}
              disabled={filteredStudents.length === 0}
            >
              <span className="flex gap-2">
                <Download className="w-5 h-5" />
                Export {filteredStudents.length > 0 && `(${filteredStudents.length})`}
              </span>
            </button>
          </div>

          {showDeleteModal && deletingStudent && (
            <DeleteModal
              student={deletingStudent}
              onConfirm={confirmDelete}
              onCancel={() => {
                setShowDeleteModal(false);
                setDeletingStudent(null);
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