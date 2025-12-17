"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";

// --- API Clients ---
import { studentInventoryCollectionApi } from "@/lib/student_inventory_collection";
import { studentApi } from "@/lib/students";
import { inventoryItemApi } from "@/lib/inventory_item";
import { academicSessionsApi } from "@/lib/academic_session";
import { userApi } from "@/lib/user";
import { InventoryDistribution } from "@/lib/types/inventory_distribution";
import { inventoryDistributionApi } from "@/lib/inventory_distrbution";

// --- Types ---
import {
  StudentInventoryCollection,
  CreateStudentInventoryCollectionInput,
  UpdateStudentInventoryCollectionInput,
} from "@/lib/types/student_inventory_collection";
import { Student } from "@/lib/types/students";
import { InventoryItem } from "@/lib/types/inventory_item";
import { AcademicSession } from "@/lib/types/academic_session";
import { User } from "@/lib/types/user";
import { SchoolClass } from "@/lib/types/classes";

// --- Components ---
import Container from "@/components/ui/container";
import Loader from "@/components/ui/loading_spinner";
import Controls from "@/components/student_inventory_collection/controls";
import CollectionTable from "@/components/student_inventory_collection/table";
import CollectionForm from "@/components/student_inventory_collection/form";
import BulkUploadForm from "@/components/student_inventory_collection/bulk_upsert";
import DeleteModal from "@/components/student_inventory_collection/delete_modal";

// --- Permissions ---
import { useUser } from "@/contexts/UserContext";

// --- Type alias for form data ---
type CollectionFormData =
  | CreateStudentInventoryCollectionInput
  | UpdateStudentInventoryCollectionInput;

export default function StudentInventoryCollectionPage() {
  // Get permission checker from UserContext
  const { canPerformAction } = useUser();

  // Check permissions for different actions
  const canCreate = canPerformAction("StudentInventoryCollection", "create");
  const canUpdate = canPerformAction("StudentInventoryCollection", "update");
  const canDelete = canPerformAction("StudentInventoryCollection", "delete");

  const [collections, setCollections] = useState<StudentInventoryCollection[]>(
    []
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [academicSessions, setAcademicSessions] = useState<AcademicSession[]>(
    []
  );
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [distributions, setDistributions] = useState<InventoryDistribution[]>(
    []
  );

  // Filter states
  const [filterStudentId, setFilterStudentId] = useState("");
  const [filterInventoryItemId, setFilterInventoryItemId] = useState("");
  const [filterClassId, setFilterClassId] = useState("");
  const [filterSessionTermId, setFilterSessionTermId] = useState("");
  const [filterReceived, setFilterReceived] = useState("");
  const [filterEligible, setFilterEligible] = useState("");

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [editingCollection, setEditingCollection] =
    useState<StudentInventoryCollection | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCollection, setDeletingCollection] =
    useState<StudentInventoryCollection | null>(null);

  // fetch classes
  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch("/api/classes");
        if (!res.ok) {
          throw new Error(`Failed to fetch classes: ${res.status}`);
        }
        const data = await res.json();
        setClasses(data);
      } catch (err) {
        console.error("Failed to load classes:", err);
        toast.error(
          "Failed to load classes. Some features may not work correctly.",
          { duration: 5000 }
        );
      }
    }
    fetchClasses();
  }, []);

  // --- Load Initial Data ---
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [
        studentData,
        itemData,
        sessionData,
        userData,
        distributionsData,
      ] = await Promise.all([
        studentApi.getAll(),
        inventoryItemApi.getAll(),
        academicSessionsApi.getAll(),
        userApi.getAll(),
        inventoryDistributionApi.getAll(),
      ]);

      setStudents(studentData);
      setInventoryItems(itemData);
      setAcademicSessions(sessionData);
      setUsers(userData);
      setDistributions(distributionsData.data || []);
      
      // Load collections with initial filters
      await loadCollections();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load initial data. Please refresh the page and try again.";
      console.error("Failed to load initial data:", err);
      toast.error(message, { duration: 5000 });
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // --- Load Collections with Filters ---
  const loadCollections = async () => {
    try {
      setLoading(true);
      
      // Build query params based on filters
      const params = new URLSearchParams();
      
      if (filterStudentId) params.append("student_id", filterStudentId);
      if (filterClassId) params.append("class_id", filterClassId);
      if (filterSessionTermId) params.append("session_term_id", filterSessionTermId);
      if (filterInventoryItemId) params.append("inventory_item_id", filterInventoryItemId);
      if (filterEligible) params.append("eligible", filterEligible);
      if (filterReceived) params.append("received", filterReceived);

      const queryString = params.toString();
      const url = `/api/proxy/student_inventory_collection${queryString ? `?${queryString}` : ""}`;
      
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch collections: ${res.status}`);
      }
      
      const data = await res.json();
      setCollections(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to reload collections. Please try again.";
      console.error("Failed to reload collections:", err);
      toast.error(message, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  // Reload collections when filters change
  useEffect(() => {
    if (!initialLoading) {
      loadCollections();
    }
  }, [
    filterStudentId,
    filterClassId,
    filterSessionTermId,
    filterInventoryItemId,
    filterEligible,
    filterReceived,
  ]);

  // --- Export to Excel ---
  const handleExport = () => {
    if (collections.length === 0) {
      toast.error(
        "No inventory collections available to export. Please create collections first.",
        { duration: 4000 }
      );
      return;
    }

    try {
      const dataToExport = collections.map((c) => {
        const student = students.find((s) => s.id === c.student_id);
        const studentName = student
          ? `${student.first_name} ${
              student.middle_name ? student.middle_name + " " : ""
            }${student.last_name}`
          : "Unknown";

        const itemName =
          inventoryItems.find((i) => i.id === c.inventory_item_id)?.name || "";
        const sessionName =
          academicSessions.find((s) => s.id === c.session_term_id)?.name || "";
        const className =
          classes.find((cls) => cls.id === c.class_id)?.name || "";

        const givenByUser = users.find((u) => u.id === c.given_by);
        const givenBy = givenByUser?.name || "N/A";

        return {
          "Student Name": studentName,
          Class: className,
          "Inventory Item": itemName,
          "Session Term": sessionName,
          Quantity: c.qty,
          Eligible: c.eligible ? "Yes" : "No",
          Received: c.received ? "Yes" : "No",
          "Received Date": c.received_date
            ? new Date(c.received_date).toLocaleDateString()
            : "",
          "Given By": givenBy,
          Notes: c.notes || "",
          "Created At": new Date(c.created_at).toLocaleString(),
          "Updated At": new Date(c.updated_at).toLocaleString(),
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Student Inventory");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const fileName = `student_inventory_collection_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
      saveAs(blob, fileName);

      toast.success(
        `Successfully exported ${collections.length} inventory collections to ${fileName}`,
        { duration: 4000 }
      );
    } catch (err) {
      console.error("Export failed:", err);
      toast.error(
        "Failed to export data. Please try again or contact support if the problem persists.",
        { duration: 5000 }
      );
    }
  };

  // --- Form Handlers ---
  const handleAddClick = () => {
    if (!canCreate) {
      toast.error(
        "Access denied. You do not have permission to create inventory collections. Please contact your administrator for access.",
        { duration: 5000 }
      );
      return;
    }
    setEditingCollection(null);
    setShowForm(true);
  };

  const handleBulkAddClick = () => {
    if (!canCreate) {
      toast.error(
        "Access denied. You do not have permission to create inventory collections. Please contact your administrator for access.",
        { duration: 5000 }
      );
      return;
    }
    setShowBulkForm(true);
  };

  const handleEdit = (collection: StudentInventoryCollection) => {
    if (!canUpdate) {
      toast.error(
        "Access denied. You do not have permission to update inventory collections. Please contact your administrator for access.",
        { duration: 5000 }
      );
      return;
    }
    setEditingCollection(collection);
    setShowForm(true);
  };

  // --- Form Submission ---
  const handleFormSubmit = async (data: CollectionFormData) => {
    if (editingCollection && !canUpdate) {
      toast.error(
        "Access denied. You do not have permission to update inventory collections.",
        { duration: 5000 }
      );
      return;
    }
    if (!editingCollection && !canCreate) {
      toast.error(
        "Access denied. You do not have permission to create inventory collections.",
        { duration: 5000 }
      );
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading(
      editingCollection
        ? "Updating inventory collection..."
        : "Creating inventory collection..."
    );

    try {
      if (editingCollection) {
        await studentInventoryCollectionApi.update(
          editingCollection.id,
          data as UpdateStudentInventoryCollectionInput
        );
        const student = students.find(
          (s) => s.id === editingCollection.student_id
        );
        const studentName = student
          ? `${student.first_name} ${student.last_name}`
          : "student";
        toast.success(
          `Successfully updated inventory collection for ${studentName}. Changes are now in effect.`,
          { duration: 4000 }
        );
      } else {
        await studentInventoryCollectionApi.create(
          data as CreateStudentInventoryCollectionInput
        );
        const student = students.find((s) => s.id === data.student_id);
        const item = inventoryItems.find(
          (i) => i.id === data.inventory_item_id
        );
        const studentName = student
          ? `${student.first_name} ${student.last_name}`
          : "student";
        const itemName = item?.name || "item";
        toast.success(
          `Successfully assigned ${itemName} to ${studentName}. Inventory record created.`,
          { duration: 4000 }
        );
      }

      setShowForm(false);
      setEditingCollection(null);
      await loadCollections();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : editingCollection
          ? "Failed to update inventory collection. Please verify your changes and available stock, then try again."
          : "Failed to create inventory collection. Please check your input and available stock, then try again.";
      console.error("Form submission failed:", err);
      toast.error(message, { duration: 6000 });
    } finally {
      toast.dismiss(loadingToast);
      setIsSubmitting(false);
    }
  };

  // --- Bulk Submission ---
  const handleBulkSubmit = async (
    data: CreateStudentInventoryCollectionInput[]
  ) => {
    if (!canCreate) {
      toast.error(
        "Access denied. You do not have permission to create inventory collections.",
        { duration: 5000 }
      );
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading(
      `Uploading ${data.length} inventory collections...`
    );

    try {
      await studentInventoryCollectionApi.bulkUpsert(data);
      toast.success(
        `Successfully uploaded ${data.length} inventory collections. All records are now active.`,
        { duration: 5000 }
      );

      setShowBulkForm(false);
      await loadCollections();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : `Failed to bulk upload inventory collections. Some items may have insufficient stock or duplicate records. Please review your data and try again.`;
      console.error("Bulk submission failed:", err);
      toast.error(message, { duration: 6000 });
    } finally {
      toast.dismiss(loadingToast);
      setIsSubmitting(false);
    }
  };

  // --- Delete Handlers ---
  const handleDeleteRequest = (collection: StudentInventoryCollection) => {
    if (!canDelete) {
      toast.error(
        "Access denied. You do not have permission to delete inventory collections. Please contact your administrator for access.",
        { duration: 5000 }
      );
      return;
    }
    setDeletingCollection(collection);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingCollection) return;

    if (!canDelete) {
      toast.error(
        "Access denied. You do not have permission to delete inventory collections.",
        { duration: 5000 }
      );
      return;
    }

    setIsDeleting(true);
    const loadingToast = toast.loading("Removing inventory collection...");

    try {
      await studentInventoryCollectionApi.delete(deletingCollection.id);
      const student = students.find(
        (s) => s.id === deletingCollection.student_id
      );
      const item = inventoryItems.find(
        (i) => i.id === deletingCollection.inventory_item_id
      );
      const studentName = student
        ? `${student.first_name} ${student.last_name}`
        : "student";
      const itemName = item?.name || "item";

      toast.success(
        `Successfully removed ${itemName} from ${studentName}. The inventory has been updated.`,
        { duration: 4000 }
      );

      setShowDeleteModal(false);
      setDeletingCollection(null);
      await loadCollections();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to delete collection record. The record may have already been removed. Please refresh the page.";
      console.error("Delete failed:", err);
      toast.error(message, { duration: 6000 });
    } finally {
      toast.dismiss(loadingToast);
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setShowBulkForm(false);
    setEditingCollection(null);
    toast("Operation canceled. No changes were made.", { duration: 3000 });
  };

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
          <Controls
            filterStudentId={filterStudentId}
            onFilterStudentIdChange={setFilterStudentId}
            filterClassId={filterClassId}
            onFilterClassIdChange={setFilterClassId}
            filterSessionTermId={filterSessionTermId}
            onFilterSessionTermIdChange={setFilterSessionTermId}
            filterInventoryItemId={filterInventoryItemId}
            onFilterInventoryItemIdChange={setFilterInventoryItemId}
            filterReceived={filterReceived}
            onFilterReceivedChange={setFilterReceived}
            filterEligible={filterEligible}
            onFilterEligibleChange={setFilterEligible}
            onAdd={handleAddClick}
            onBulkAdd={handleBulkAddClick}
            canCreate={canCreate}
            students={students}
            classes={classes}
            sessionTerms={academicSessions}
            inventoryItems={inventoryItems}
          />

          {showForm && (
            <CollectionForm
              collection={editingCollection || undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
              students={students}
              inventoryItems={inventoryItems}
              sessionTerms={academicSessions}
              users={users}
              classes={classes}
              distributions={distributions}
              collections={collections}
            />
          )}

          {showBulkForm && (
            <BulkUploadForm
              onSubmit={handleBulkSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
              students={students}
              inventoryItems={inventoryItems}
              sessionTerms={academicSessions}
              users={users}
              classes={classes}
              distributions={distributions}
              collections={collections}
            />
          )}

          <CollectionTable
            collections={collections}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            loading={loading}
            inventoryItems={inventoryItems}
            students={students}
            academicSessions={academicSessions}
            users={users}
            canUpdate={canUpdate}
            canDelete={canDelete}
          />

          <div className="my-4 flex justify-start">
            <button
              onClick={handleExport}
              disabled={collections.length === 0}
              className="bg-[#3D4C63] hover:bg-[#495C79] text-white px-5 py-2 rounded-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex gap-2 items-center">
                <Download className="w-5 h-5" />
                <span>Export to Excel</span>
              </span>
            </button>
          </div>

          {showDeleteModal && deletingCollection && (
            <DeleteModal
              collectionId={deletingCollection.id}
              onConfirm={confirmDelete}
              onCancel={() => {
                setShowDeleteModal(false);
                setDeletingCollection(null);
                toast("Delete operation canceled. No changes were made.", {
                  duration: 3000,
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