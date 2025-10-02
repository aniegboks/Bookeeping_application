"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { SchoolClass } from "@/lib/types/classes";
import { schoolClassApi } from "@/lib/classes";
import Container from "@/components/ui/container";
import Loader from "@/components/ui/loading_spinner";
import StatsCards from "@/components/classes/stats_card";
import Controls from "@/components/classes/controls";
import ClassTable from "@/components/classes/tables";
import ClassForm from "@/components/classes/form";
import DeleteModal from "@/components/classes/modal";

export default function SchoolClassesPage() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
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

  // Load classes
  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await schoolClassApi.getAll();
      setClasses(data);
    } catch (err: any) {
      console.error("Failed to load classes:", err);
      toast.error("Failed to load classes: " + err.message);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  // Filter classes
  const filteredClasses = classes.filter((schoolClass) => {
    const matchesSearch =
      schoolClass.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schoolClass.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schoolClass.class_teacher_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || schoolClass.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle form submission (create/update)
  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading(
      editingClass ? "Updating class..." : "Creating class..."
    );

    try {
      if (editingClass) {
        await schoolClassApi.update(editingClass.id, data);
        toast.dismiss(loadingToast);
        toast.success("Class updated successfully!");
      } else {
        await schoolClassApi.create(data);
        toast.dismiss(loadingToast);
        toast.success("Class created successfully!");
      }

      setShowForm(false);
      setEditingClass(null);
      await loadClasses();
    } catch (err: any) {
      toast.dismiss(loadingToast);
      console.error("Form submission failed:", err);
      toast.error("Failed to save class: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (schoolClass: SchoolClass) => {
    setEditingClass(schoolClass);
    setShowForm(true);
  };

  // Handle delete request
  const handleDeleteRequest = (schoolClass: SchoolClass) => {
    setDeletingClass(schoolClass);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!deletingClass) return;

    setIsDeleting(true);
    const loadingToast = toast.loading("Deleting class...");

    try {
      await schoolClassApi.delete(deletingClass.id);
      toast.dismiss(loadingToast);
      toast.success("Class deleted successfully!");

      setShowDeleteModal(false);
      setDeletingClass(null);
      await loadClasses();
    } catch (err: any) {
      toast.dismiss(loadingToast);
      console.error("Delete failed:", err);
      toast.error("Failed to delete class: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowForm(false);
    setEditingClass(null);
    toast("Form canceled", { icon: "ℹ️" });
  };

  // Handle add new
  const handleAdd = () => {
    setEditingClass(null);
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
              School Classes Management
            </h1>
            <p className="text-gray-600">
              Manage school classes, teachers, and class status
            </p>
          </div>

          {/* Stats Cards */}
          <StatsCards classes={classes} filteredClasses={filteredClasses} />

          {/* Controls */}
          <Controls
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onAdd={handleAdd}
          />

          {/* Form Modal */}
          {showForm && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#171D26] mb-4">
                {editingClass ? "Edit Class" : "Create New Class"}
              </h2>
              <ClassForm
                schoolClass={editingClass || undefined}
                onSubmit={handleFormSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
              />
            </div>
          )}

          {/* Table */}
          <ClassTable
            classes={filteredClasses}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            loading={loading}
          />

          {/* Delete Modal */}
          {showDeleteModal && deletingClass && (
            <DeleteModal
              schoolClass={deletingClass}
              onConfirm={confirmDelete}
              onCancel={() => {
                setShowDeleteModal(false);
                setDeletingClass(null);
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