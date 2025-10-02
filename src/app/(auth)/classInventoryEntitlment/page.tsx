"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { ClassInventoryEntitlement } from "@/lib/types/class_inventory_entitlement";
import { classInventoryEntitlementApi } from "@/lib/class_inventory_entitlement";
import Container from "@/components/ui/container";
import Loader from "@/components/ui/loading_spinner";
import StatsCards from "@/components/class_inventory_entitlement_ui/stats_card";
import Controls from "@/components/class_inventory_entitlement_ui/controls";
import EntitlementTable from "@/components/class_inventory_entitlement_ui/table";
import EntitlementForm from "@/components/class_inventory_entitlement_ui/form";
import DeleteModal from "@/components/class_inventory_entitlement_ui/delete_modal";

export default function ClassInventoryEntitlementsPage() {
  const [entitlements, setEntitlements] = useState<ClassInventoryEntitlement[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClassId, setFilterClassId] = useState("");
  const [filterInventoryItemId, setFilterInventoryItemId] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [showForm, setShowForm] = useState(false);
  const [editingEntitlement, setEditingEntitlement] = useState<ClassInventoryEntitlement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingEntitlement, setDeletingEntitlement] = useState<ClassInventoryEntitlement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load entitlements
  const loadEntitlements = async () => {
    try {
      setLoading(true);
      const data = await classInventoryEntitlementApi.getAll();
      setEntitlements(data);
    } catch (err: any) {
      console.error("Failed to load entitlements:", err);
      toast.error("Failed to load entitlements: " + err.message);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadEntitlements();
  }, []);

  // Filter entitlements
  const filteredEntitlements = entitlements.filter((e) => {
    const matchesSearch =
      e.class_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.inventory_item_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.session_term_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesClassFilter =
      !filterClassId || e.class_id.toLowerCase().includes(filterClassId.toLowerCase());

    const matchesInventoryFilter =
      !filterInventoryItemId ||
      e.inventory_item_id.toLowerCase().includes(filterInventoryItemId.toLowerCase());

    return matchesSearch && matchesClassFilter && matchesInventoryFilter;
  });

  // Handle form submission (create/update)
  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading(
      editingEntitlement ? "Updating entitlement..." : "Creating entitlement..."
    );

    try {
      if (editingEntitlement) {
        await classInventoryEntitlementApi.update(editingEntitlement.id, data);
        toast.dismiss(loadingToast);
        toast.success("Entitlement updated successfully!");
      } else {
        await classInventoryEntitlementApi.create(data);
        toast.dismiss(loadingToast);
        toast.success("Entitlement created successfully!");
      }

      setShowForm(false);
      setEditingEntitlement(null);
      await loadEntitlements();
    } catch (err: any) {
      toast.dismiss(loadingToast);
      console.error("Form submission failed:", err);
      toast.error("Failed to save entitlement: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (entitlement: ClassInventoryEntitlement) => {
    setEditingEntitlement(entitlement);
    setShowForm(true);
  };

  // Handle delete request
  const handleDeleteRequest = (entitlement: ClassInventoryEntitlement) => {
    setDeletingEntitlement(entitlement);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!deletingEntitlement) return;

    setIsDeleting(true);
    const loadingToast = toast.loading("Deleting entitlement...");

    try {
      await classInventoryEntitlementApi.delete(deletingEntitlement.id);
      toast.dismiss(loadingToast);
      toast.success("Entitlement deleted successfully!");

      setShowDeleteModal(false);
      setDeletingEntitlement(null);
      await loadEntitlements();
    } catch (err: any) {
      toast.dismiss(loadingToast);
      console.error("Delete failed:", err);
      toast.error("Failed to delete entitlement: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowForm(false);
    setEditingEntitlement(null);
    toast("Form canceled", { icon: "ℹ️" });
  };

  // Handle add new
  const handleAdd = () => {
    setEditingEntitlement(null);
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
    <div className="min-h-screen bg-[#F3F4F7] mx-6">
      <Container>
        <div className="mt-24 pb-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#171D26] mb-2">
              Class Inventory Entitlements
            </h1>
            <p className="text-gray-600">
              Manage class inventory allocations and entitlements
            </p>
          </div>

          {/* Stats Cards */}
          <StatsCards
            entitlements={entitlements}
            filteredEntitlements={filteredEntitlements}
          />

          {/* Controls */}
          <Controls
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterClassId={filterClassId}
            onFilterClassIdChange={setFilterClassId}
            filterInventoryItemId={filterInventoryItemId}
            onFilterInventoryItemIdChange={setFilterInventoryItemId}
            onAdd={handleAdd}
          />

          {/* Form Modal */}
          {showForm && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#171D26] mb-4">
                {editingEntitlement ? "Edit Entitlement" : "Create New Entitlement"}
              </h2>
              <EntitlementForm
                entitlement={editingEntitlement || undefined}
                onSubmit={handleFormSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
              />
            </div>
          )}

          {/* Table */}
          <EntitlementTable
            entitlements={filteredEntitlements}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            loading={loading}
          />

          {/* Delete Modal */}
          {showDeleteModal && deletingEntitlement && (
            <DeleteModal
              entitlementId={deletingEntitlement.id}
              onConfirm={confirmDelete}
              onCancel={() => {
                setShowDeleteModal(false);
                setDeletingEntitlement(null);
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