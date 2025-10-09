"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

// --- API Clients ---
import { ClassInventoryEntitlement, CreateClassInventoryEntitlementInput, UpdateClassInventoryEntitlementInput } from "@/lib/types/class_inventory_entitlement";
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
import EntitlementBarChart from "@/components/class_inventory_entitlement_ui/trends";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";

// --- Type alias for form data ---
type EntitlementFormData = CreateClassInventoryEntitlementInput | UpdateClassInventoryEntitlementInput;

export default function ClassInventoryEntitlementsPage() {
  const [entitlements, setEntitlements] = useState<ClassInventoryEntitlement[]>([]);
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
  const [editingEntitlement, setEditingEntitlement] = useState<ClassInventoryEntitlement | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingEntitlement, setDeletingEntitlement] = useState<ClassInventoryEntitlement | null>(null);

  // --- Load initial data ---
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Failed to load initial data:", err);
        toast.error("Failed to load initial data: " + err.message);
      } else {
        console.error("Failed to load initial data:", err);
        toast.error("Failed to load initial data");
      }
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // --- Reload entitlements ---
  const loadEntitlements = async () => {
    try {
      setLoading(true);
      const data = await classInventoryEntitlementApi.getAll();
      setEntitlements(data);
    } catch (err: unknown) {
      let message: string;
      if (err instanceof Error) message = err.message;
      else if (typeof err === "string") message = err;
      else {
        try {
          message = JSON.stringify(err);
        } catch {
          message = "An unknown error occurred";
        }
      }
      console.error("Failed to reload entitlements:", err);
      toast.error("Failed to reload entitlements: " + message);
    } finally {
      setLoading(false);
    }
  };

  // --- Filter & Search ---
  const filteredEntitlements = entitlements.filter((e) => {
    const className = classes.find((c) => c.id === e.class_id)?.name || e.class_id;
    const itemName = inventoryItems.find((i) => i.id === e.inventory_item_id)?.name || e.inventory_item_id;
    const sessionName = academicSessions.find((s) => s.id === e.session_term_id)?.name || e.session_term_id;

    const matchesSearch =
      className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sessionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesClassFilter = !filterClassId || className.toLowerCase().includes(filterClassId.toLowerCase());
    const matchesInventoryFilter =
      !filterInventoryItemId || itemName.toLowerCase().includes(filterInventoryItemId.toLowerCase());

    return matchesSearch && matchesClassFilter && matchesInventoryFilter;
  });

  // --- Export to Excel ---
  const handleExport = () => {
    if (filteredEntitlements.length === 0) {
      toast.error("No data to export!");
      return;
    }

    const dataToExport = filteredEntitlements.map((e) => {
      const className = classes.find((c) => c.id === e.class_id)?.name || "";
      const itemName = inventoryItems.find((i) => i.id === e.inventory_item_id)?.name || "";
      const sessionName = academicSessions.find((s) => s.id === e.session_term_id)?.name || "";
      const user = users.find((u) => u.id === e.created_by);
      const createdBy = user?.name || user?.username || user?.email || "Unknown";

      return {
        "Class Name": className,
        "Inventory Item": itemName,
        "Session Term": sessionName,
        Quantity: e.quantity,
        Notes: e.notes || "",
        "Created By": createdBy,
        "Created At": new Date(e.created_at).toLocaleString(),
        "Updated At": new Date(e.updated_at).toLocaleString(),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Entitlements");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `class_inventory_entitlements_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Spreadsheet exported successfully!");
  };

  // --- Form Submission ---
  const handleFormSubmit = async (data: CreateClassInventoryEntitlementInput | UpdateClassInventoryEntitlementInput) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading(editingEntitlement ? "Updating entitlement..." : "Creating entitlement...");

    try {
      if (editingEntitlement) {
        // Update: cast to UpdateClassInventoryEntitlementInput
        await classInventoryEntitlementApi.update(editingEntitlement.id, data as UpdateClassInventoryEntitlementInput);
        toast.success("Entitlement updated successfully!");
      } else {
        // Create: cast to CreateClassInventoryEntitlementInput
        await classInventoryEntitlementApi.create(data as CreateClassInventoryEntitlementInput);
        toast.success("Entitlement created successfully!");
      }

      setShowForm(false);
      setEditingEntitlement(null);
      await loadEntitlements();
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Form submission failed:", err);
        toast.error("Failed to save entitlement: " + err.message);
      } else {
        console.error("Form submission failed:", err);
        toast.error("Failed to save entitlement");
      }
    } finally {
      toast.dismiss(loadingToast);
      setIsSubmitting(false);
    }
  };


  // --- Bulk Submission ---
  const handleBulkSubmit = async (data: CreateClassInventoryEntitlementInput[]) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading(`Creating ${data.length} entitlements...`);

    try {
      await classInventoryEntitlementApi.bulkUpsert(data);
      toast.success(`${data.length} entitlements created successfully!`);

      setShowBulkForm(false);
      await loadEntitlements();
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Bulk submission failed:", err);
        toast.error("Failed to create entitlements: " + err.message);
      } else {
        console.error("Bulk submission failed:", err);
        toast.error("Failed to create entitlements");
      }
    } finally {
      toast.dismiss(loadingToast);
      setIsSubmitting(false);
    }
  };

  // --- Edit / Delete Handlers ---
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Delete failed:", err);
        toast.error("Failed to delete entitlement: " + err.message);
      } else {
        console.error("Delete failed:", err);
        toast.error("Failed to delete entitlement");
      }
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

  // --- UI States ---
  if (initialLoading) {
    return (
      <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#F3F4F7] z-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="mx-6">
      <Container>
        <div className="mt-2 pb-8">
          {/* Stats */}
          <StatsCards entitlements={entitlements} filteredEntitlements={filteredEntitlements} />
          <EntitlementBarChart entitlements={entitlements} />

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
          />

          {/* Modals */}
          {showForm && (
            <EntitlementForm
              entitlement={editingEntitlement || undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
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
            inventoryItems={inventoryItems}
            classes={classes}
            academicSessions={academicSessions}
            users={users}
          />

          {/* Export Button */}
          <div className="mt-6 flex justify-start">
            <button
              onClick={handleExport}
              className="bg-[#3D4C63] hover:bg-[#495C79] text-white px-5 py-2 rounded-sm transition"
            >
              <span className="flex gap-2">
                <Download className="w-5 h-5" />
                <span>Export</span>
              </span>
            </button>
          </div>

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
