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
import StatsCards from "@/components/students_ui/stats_card";
import Controls from "@/components/students_ui/controls";
import StudentTable from "@/components/students_ui/table";
import StudentForm from "@/components/students_ui/form";
import DeleteModal from "@/components/students_ui/delete_modal";
import StudentStatusChart from "@/components/students_ui/trends";
import { CreateStudentInput, UpdateStudentInput } from "@/lib/types/students";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";

export default function StudentsPage() {
  // Get permission checker from UserContext
  const { canPerformAction } = useUser();
  
  // Check permissions for different actions
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
    } catch (err: unknown) {
      console.error("Failed to load data:", err);
      if (err instanceof Error)
        toast.error("Failed to load data: " + err.message);
      else toast.error("Failed to load data");
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
    saveAs(data, "students.xlsx");

    toast.success("Students exported successfully!");
  };

  // Form submission
  const handleFormSubmit = async (data: CreateStudentInput | UpdateStudentInput) => {
    // Double-check permissions before submitting
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
        await studentApi.update(editingStudent.id, data as UpdateStudentInput);
        toast.dismiss(loadingToast);
        toast.success("Student updated successfully!");
      } else {
        await studentApi.create(data as CreateStudentInput);
        toast.dismiss(loadingToast);
        toast.success("Student created successfully!");
      }

      setShowForm(false);
      setEditingStudent(null);
      await loadData();
    } catch (err: unknown) {
      toast.dismiss(loadingToast);
      console.error("Form submission failed:", err);
      if (err instanceof Error)
        toast.error("Failed to save student: " + err.message);
      else toast.error("Failed to save student");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit
  const handleEdit = (student: Student) => {
    // Check permission before opening form
    if (!canUpdate) {
      toast.error("You don't have permission to update students");
      return;
    }
    setEditingStudent(student);
    setShowForm(true);
  };

  // Delete
  const handleDeleteRequest = (student: Student) => {
    // Check permission before opening modal
    if (!canDelete) {
      toast.error("You don't have permission to delete students");
      return;
    }
    setDeletingStudent(student);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingStudent) return;

    // Double-check permission before deleting
    if (!canDelete) {
      toast.error("You don't have permission to delete students");
      return;
    }

    setIsDeleting(true);
    const loadingToast = toast.loading("Deleting student...");

    try {
      await studentApi.delete(deletingStudent.id);
      toast.dismiss(loadingToast);
      toast.success("Student deleted successfully!");
      setShowDeleteModal(false);
      setDeletingStudent(null);
      await loadData();
    } catch (err: unknown) {
      toast.dismiss(loadingToast);
      console.error("Delete failed:", err);
      if (err instanceof Error)
        toast.error("Failed to delete student: " + err.message);
      else toast.error("Failed to delete student");
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
    // Check permission before opening form
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
          <StatsCards students={students} filteredStudents={filteredStudents} />
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
              className="px-4 py-2 bg-[#3D4C63] hover:bg-[#495C79] text-white rounded-sm transition"
              onClick={handleExport}
            >
              <span className="flex gap-2">
                <Download className="w-5 h-5" />
                Export
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