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
import StatsCards from "@/components/student_inventory_collection/stats_card";
import Controls from "@/components/student_inventory_collection/controls";
import CollectionTable from "@/components/student_inventory_collection/table";
import CollectionForm from "@/components/student_inventory_collection/form";
import BulkUploadForm from "@/components/student_inventory_collection/bulk_upsert";
import DeleteModal from "@/components/student_inventory_collection/delete_modal";
import Trends from "@/components/student_inventory_collection/trends";

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

  const [collections, setCollections] = useState<StudentInventoryCollection[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [academicSessions, setAcademicSessions] = useState<AcademicSession[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStudentId, setFilterStudentId] = useState("");
  const [filterInventoryItemId, setFilterInventoryItemId] = useState("");
  const [filterClassId, setFilterClassId] = useState("");
  const [filterReceived, setFilterReceived] = useState("");
  const [filterEligible, setFilterEligible] = useState("");

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState<StudentInventoryCollection | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCollection, setDeletingCollection] = useState<StudentInventoryCollection | null>(null);

  // fetch classes
  useEffect(() => {
    async function fetchClasses() {
      const res = await fetch("/api/classes");
      const data = await res.json();
      setClasses(data);
    }
    fetchClasses();
  }, []);

  // --- Load Initial Data ---
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [collectionData, studentData, itemData, sessionData, userData] = await Promise.all([
        studentInventoryCollectionApi.getAll(),
        studentApi.getAll(),
        inventoryItemApi.getAll(),
        academicSessionsApi.getAll(),
        userApi.getAll(),
      ]);

      setCollections(collectionData);
      setStudents(studentData);
      setInventoryItems(itemData);
      setAcademicSessions(sessionData);
      setUsers(userData);
    } catch (err: unknown) {
      console.error("Failed to load initial data:", err);
      toast.error("Failed to load initial data");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // --- Reload Collections ---
  const loadCollections = async () => {
    try {
      setLoading(true);
      const data = await studentInventoryCollectionApi.getAll();
      setCollections(data);
    } catch (err: unknown) {
      console.error("Failed to reload collections:", err);
      toast.error("Failed to reload data");
    } finally {
      setLoading(false);
    }
  };

  // --- Filter & Search ---
  const filteredCollections = collections.filter((c) => {
    const student = students.find((s) => s.id === c.student_id);
    const studentName = student
      ? `${student.first_name} ${student.middle_name ? student.middle_name + " " : ""}${student.last_name}`
      : c.student_id;

    const itemName = inventoryItems.find((i) => i.id === c.inventory_item_id)?.name || c.inventory_item_id;
    const className = classes.find((cls) => cls.id === c.class_id)?.name || c.class_id;
    const sessionName = academicSessions.find((s) => s.id === c.session_term_id)?.name || c.session_term_id;

    const matchesSearch =
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sessionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesStudentFilter =
      !filterStudentId || studentName.toLowerCase().includes(filterStudentId.toLowerCase());
    const matchesInventoryFilter =
      !filterInventoryItemId || itemName.toLowerCase().includes(filterInventoryItemId.toLowerCase());
    const matchesClassFilter =
      !filterClassId || className.toLowerCase().includes(filterClassId.toLowerCase());

    return matchesSearch && matchesStudentFilter && matchesInventoryFilter && matchesClassFilter;
  });

  // --- Export to Excel ---
  const handleExport = () => {
    if (filteredCollections.length === 0) {
      toast.error("No data to export!");
      return;
    }

    const dataToExport = filteredCollections.map((c) => {
      const student = students.find((s) => s.id === c.student_id);
      const studentName = student
        ? `${student.first_name} ${student.middle_name ? student.middle_name + " " : ""}${student.last_name}`
        : "Unknown";

      const itemName = inventoryItems.find((i) => i.id === c.inventory_item_id)?.name || "";
      const sessionName = academicSessions.find((s) => s.id === c.session_term_id)?.name || "";
      const className = classes.find((cls) => cls.id === c.class_id)?.name || "";

      const givenByUser = users.find((u) => u.id === c.given_by);
      const givenBy = givenByUser?.name || "N/A";

      return {
        "Student Name": studentName,
        "Class": className,
        "Inventory Item": itemName,
        "Session Term": sessionName,
        Quantity: c.qty,
        Eligible: c.eligible ? "Yes" : "No",
        Received: c.received ? "Yes" : "No",
        "Received Date": c.received_date ? new Date(c.received_date).toLocaleDateString() : "",
        "Given By": givenBy,
        Notes: c.notes || "",
        "Created At": new Date(c.created_at).toLocaleString(),
        "Updated At": new Date(c.updated_at).toLocaleString(),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Student Inventory");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(
      blob,
      `student_inventory_collection_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    toast.success("Spreadsheet exported successfully!");
  };

  // --- Form Handlers ---
  const handleAddClick = () => {
    // Check permission before opening form
    if (!canCreate) {
      toast.error("You don't have permission to create inventory collections");
      return;
    }
    setEditingCollection(null);
    setShowForm(true);
  };

  const handleBulkAddClick = () => {
    // Check permission before opening bulk form
    if (!canCreate) {
      toast.error("You don't have permission to create inventory collections");
      return;
    }
    setShowBulkForm(true);
  };

  const handleEdit = (collection: StudentInventoryCollection) => {
    // Check permission before opening edit form
    if (!canUpdate) {
      toast.error("You don't have permission to update inventory collections");
      return;
    }
    setEditingCollection(collection);
    setShowForm(true);
  };

  // --- Form Submission ---
  const handleFormSubmit = async (data: CollectionFormData) => {
    // Double-check permissions before submitting
    if (editingCollection && !canUpdate) {
      toast.error("You don't have permission to update inventory collections");
      return;
    }
    if (!editingCollection && !canCreate) {
      toast.error("You don't have permission to create inventory collections");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading(editingCollection ? "Updating record..." : "Creating record...");

    try {
      if (editingCollection) {
        await studentInventoryCollectionApi.update(editingCollection.id, data as UpdateStudentInventoryCollectionInput);
        toast.success("Collection updated successfully!");
      } else {
        await studentInventoryCollectionApi.create(data as CreateStudentInventoryCollectionInput);
        toast.success("Collection created successfully!");
      }

      setShowForm(false);
      setEditingCollection(null);
      await loadCollections();
    } catch (err: unknown) {
      console.error("Form submission failed:", err);
      toast.error("Failed to save collection");
    } finally {
      toast.dismiss(loadingToast);
      setIsSubmitting(false);
    }
  };

  // --- Bulk Submission ---
  const handleBulkSubmit = async (data: CreateStudentInventoryCollectionInput[]) => {
    // Double-check permission
    if (!canCreate) {
      toast.error("You don't have permission to create inventory collections");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading(`Uploading ${data.length} records...`);

    try {
      await studentInventoryCollectionApi.bulkUpsert(data);
      toast.success(`${data.length} records uploaded successfully!`);

      setShowBulkForm(false);
      await loadCollections();
    } catch (err: unknown) {
      console.error("Bulk submission failed:", err);
      toast.error("Failed to upload data");
    } finally {
      toast.dismiss(loadingToast);
      setIsSubmitting(false);
    }
  };

  // --- Delete Handlers ---
  const handleDeleteRequest = (collection: StudentInventoryCollection) => {
    // Check permission before opening delete modal
    if (!canDelete) {
      toast.error("You don't have permission to delete inventory collections");
      return;
    }
    setDeletingCollection(collection);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingCollection) return;
    
    // Double-check permission before deleting
    if (!canDelete) {
      toast.error("You don't have permission to delete inventory collections");
      return;
    }

    setIsDeleting(true);
    const loadingToast = toast.loading("Deleting record...");

    try {
      await studentInventoryCollectionApi.delete(deletingCollection.id);
      toast.success("Collection deleted successfully!");

      setShowDeleteModal(false);
      setDeletingCollection(null);
      await loadCollections();
    } catch (err: unknown) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete record");
    } finally {
      toast.dismiss(loadingToast);
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setShowBulkForm(false);
    setEditingCollection(null);
    toast("Action canceled", { icon: "ℹ️" });
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
          <StatsCards collections={collections} filteredCollections={filteredCollections} />
          <Controls
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterStudentId={filterStudentId}
            onFilterStudentIdChange={setFilterStudentId}
            filterClassId={filterClassId}
            onFilterClassIdChange={setFilterClassId}
            filterInventoryItemId={filterInventoryItemId}
            onFilterInventoryItemIdChange={setFilterInventoryItemId}
            filterReceived={filterReceived}
            onFilterReceivedChange={setFilterReceived}
            filterEligible={filterEligible}
            onFilterEligibleChange={setFilterEligible}
            onAdd={handleAddClick}
            onBulkAdd={handleBulkAddClick}
            // Pass permissions to controls
            canCreate={canCreate}
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
            />
          )}

          <CollectionTable
            collections={filteredCollections}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            loading={loading}
            inventoryItems={inventoryItems}
            students={students}
            academicSessions={academicSessions}
            users={users}
            // Pass permissions to table
            canUpdate={canUpdate}
            canDelete={canDelete}
          />

          <div className="my-4 flex justify-start">
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

          {showDeleteModal && deletingCollection && (
            <DeleteModal
              collectionId={deletingCollection.id}
              onConfirm={confirmDelete}
              onCancel={() => {
                setShowDeleteModal(false);
                setDeletingCollection(null);
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