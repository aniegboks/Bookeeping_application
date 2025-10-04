"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Student } from "@/lib/types/students";
import { studentApi } from "@/lib/students";
import Container from "@/components/ui/container";
import Loader from "@/components/ui/loading_spinner";
import StatsCards from "@/components/students_ui/stats_card";
import Controls from "@/components/students_ui/controls";
import StudentTable from "@/components/students_ui/table";
import StudentForm from "@/components/students_ui/form";
import DeleteModal from "@/components/students_ui/delete_modal";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
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

  // Load students
  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await studentApi.getAll();
      setStudents(data);
    } catch (err: any) {
      console.error("Failed to load students:", err);
      toast.error("Failed to load students: " + err.message);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
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

  // Handle form submission (create/update)
  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading(
      editingStudent ? "Updating student..." : "Creating student..."
    );

    try {
      if (editingStudent) {
        await studentApi.update(editingStudent.id, data);
        toast.dismiss(loadingToast);
        toast.success("Student updated successfully!");
      } else {
        await studentApi.create(data);
        toast.dismiss(loadingToast);
        toast.success("Student created successfully!");
      }

      setShowForm(false);
      setEditingStudent(null);
      await loadStudents();
    } catch (err: any) {
      toast.dismiss(loadingToast);
      console.error("Form submission failed:", err);
      toast.error("Failed to save student: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  // Handle delete request
  const handleDeleteRequest = (student: Student) => {
    setDeletingStudent(student);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!deletingStudent) return;

    setIsDeleting(true);
    const loadingToast = toast.loading("Deleting student...");

    try {
      await studentApi.delete(deletingStudent.id);
      toast.dismiss(loadingToast);
      toast.success("Student deleted successfully!");

      setShowDeleteModal(false);
      setDeletingStudent(null);
      await loadStudents();
    } catch (err: any) {
      toast.dismiss(loadingToast);
      console.error("Delete failed:", err);
      toast.error("Failed to delete student: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowForm(false);
    setEditingStudent(null);
    toast("Form canceled", { icon: "ℹ️" });
  };

  // Handle add new
  const handleAdd = () => {
    setEditingStudent(null);
    setShowForm(true);
  };

  // Initial loading screen
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
              Student Management
            </h1>
            <p className="text-gray-600">
              Manage student records, admissions, and information
            </p>
          </div>

          {/* Stats Cards */}
          <StatsCards students={students} filteredStudents={filteredStudents} />

          {/* Controls */}
          <Controls
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            genderFilter={genderFilter}
            onGenderFilterChange={setGenderFilter}
            onAdd={handleAdd}
          />

          {/* Form Modal */}
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
              />
            </div>
          )}

          {/* Table */}
          <StudentTable
            students={filteredStudents}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            loading={loading}
          />

          {/* Delete Modal */}
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