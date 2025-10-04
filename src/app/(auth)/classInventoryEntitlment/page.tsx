// src/pages/ClassInventoryEntitlementsPage.tsx
"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

// --- API Clients (Assume these are updated to use /api/proxy/ internally) ---
import { ClassInventoryEntitlement } from "@/lib/types/class_inventory_entitlement";
import { classInventoryEntitlementApi } from "@/lib/class_inventory_entitlement";
import { schoolClassApi } from "@/lib/classes";
import { inventoryItemApi } from "@/lib/inventory_item";
import { academicSessionsApi } from "@/lib/academic_session";
import { userApi } from "@/lib/user";

// --- Types ---
import { SchoolClass } from "@/lib/types/classes";
import { InventoryItem } from "@/lib/types/inventory_item";
import { AcademicSession } from "@/lib/types/academic_session";
import { User } from "@/lib/types/user";

// --- Components ---
import Container from "@/components/ui/container";
import Loader from "@/components/ui/loading_spinner";
import StatsCards from "@/components/class_inventory_entitlement_ui/stats_card";
import Controls from "@/components/class_inventory_entitlement_ui/controls";
import EntitlementTable from "@/components/class_inventory_entitlement_ui/table";
import EntitlementForm from "@/components/class_inventory_entitlement_ui/form";
import BulkUploadForm from "@/components/class_inventory_entitlement_ui/bulk_upload";
import DeleteModal from "@/components/class_inventory_entitlement_ui/delete_modal";

export default function ClassInventoryEntitlementsPage() {
  const [entitlements, setEntitlements] = useState<ClassInventoryEntitlement[]>([]);
  
  // State for reference data, fetched once by the parent
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [academicSessions, setAcademicSessions] = useState<AcademicSession[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterClassId, setFilterClassId] = useState("");
  const [filterInventoryItemId, setFilterInventoryItemId] = useState("");

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [editingEntitlement, setEditingEntitlement] =
    useState<ClassInventoryEntitlement | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingEntitlement, setDeletingEntitlement] =
    useState<ClassInventoryEntitlement | null>(null);

  // Load initial entitlements and all reference data concurrently
  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const [entitlementData, cls, items, sessions, userData] = await Promise.all([
        classInventoryEntitlementApi.getAll(),
        schoolClassApi.getAll(),
        inventoryItemApi.getAll(),
        academicSessionsApi.getAll(),
        userApi.getAll(),
      ]);

      setEntitlements(entitlementData);
      setClasses(cls);
      setInventoryItems(items);
      setAcademicSessions(sessions);
      setUsers(userData);

    } catch (err: any) {
      console.error("Failed to load initial data:", err);
      // NOTE: This error handler will now catch ALL 404s if the API clients are misconfigured
      toast.error("Failed to load initial data: " + err.message);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Function to reload only the entitlement data (used after CRUD operations)
  const loadEntitlements = async () => {
    try {
      setLoading(true);
      const data = await classInventoryEntitlementApi.getAll();
      setEntitlements(data);
    } catch (err: any) {
      console.error("Failed to reload entitlements:", err);
      toast.error("Failed to reload entitlements: " + err.message);
    } finally {
      setLoading(false);
    }
  };


  // Filters (Unchanged)
  const filteredEntitlements = entitlements.filter((e) => {
    const matchesSearch =
      e.class_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.inventory_item_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.session_term_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesClassFilter =
      !filterClassId ||
      e.class_id.toLowerCase().includes(filterClassId.toLowerCase());

    const matchesInventoryFilter =
      !filterInventoryItemId ||
      e.inventory_item_id
        .toLowerCase()
        .includes(filterInventoryItemId.toLowerCase());

    return matchesSearch && matchesClassFilter && matchesInventoryFilter;
  });

  // --- CRUD Handlers (Unchanged) ---
  
  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading(
      editingEntitlement ? "Updating entitlement..." : "Creating entitlement..."
    );

    try {
      if (editingEntitlement) {
        await classInventoryEntitlementApi.update(editingEntitlement.id, data);
        toast.success("Entitlement updated successfully!");
      } else {
        await classInventoryEntitlementApi.create(data);
        toast.success("Entitlement created successfully!");
      }

      setShowForm(false);
      setEditingEntitlement(null);
      await loadEntitlements(); // Reload entitlements after change
    } catch (err: any) {
      console.error("Form submission failed:", err);
      toast.error("Failed to save entitlement: " + err.message);
    } finally {
      toast.dismiss(loadingToast);
      setIsSubmitting(false);
    }
  };

  const handleBulkSubmit = async (data: any[]) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading(`Creating ${data.length} entitlements...`);

    try {
      await classInventoryEntitlementApi.bulkUpsert(data);
      toast.success(`${data.length} entitlements created successfully!`);

      setShowBulkForm(false);
      await loadEntitlements();
    } catch (err: any) {
      console.error("Bulk submission failed:", err);
      toast.error("Failed to create entitlements: " + err.message);
    } finally {
      toast.dismiss(loadingToast);
      setIsSubmitting(false);
    }
  };

  const handleEdit = (entitlement: ClassInventoryEntitlement) => {
    setEditingEntitlement(entitlement);
    setShowForm(true);
  };

  const handleDeleteRequest = (entitlement: ClassInventoryEntitlement) => {
    setDeletingEntitlement(entitlement);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingEntitlement) return;
    setIsDeleting(true);
    const loadingToast = toast.loading("Deleting entitlement...");

    try {
      await classInventoryEntitlementApi.delete(deletingEntitlement.id);
      toast.success("Entitlement deleted successfully!");

      setShowDeleteModal(false);
      setDeletingEntitlement(null);
      await loadEntitlements();
    } catch (err: any) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete entitlement: " + err.message);
    } finally {
      toast.dismiss(loadingToast);
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setShowBulkForm(false);
    setEditingEntitlement(null);
    toast("Action canceled", { icon: "ℹ️" });
  };

  // UI States (Unchanged)
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

          {/* Stats */}
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
            onAdd={() => setShowForm(true)}
            onBulkAdd={() => setShowBulkForm(true)}
            // Assuming Controls uses 'classes' and 'inventoryItems' for filters
            // This data should be passed down via props if needed.
          />

          {/* Modals */}
          {showForm && (
            <EntitlementForm
              entitlement={editingEntitlement || undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
              
              // Pass the pre-loaded data down to the form
              classes={classes}
              inventoryItems={inventoryItems}
              sessionTerms={academicSessions}
              users={users}
            />
          )}

          {showBulkForm && (
            <BulkUploadForm
              onSubmit={handleBulkSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
              classes={classes}
              inventoryItems={inventoryItems}
              sessionTerms={academicSessions}
              users={users}
            />
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