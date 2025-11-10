"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";

// API
import { supplierTransactionsApi } from "@/lib/supplier_transaction";
import { supplierApi } from "@/lib/suppliers";

// Types
import {
  SupplierTransaction,
  CreateSupplierTransactionPayload,
  UpdateSupplierTransactionPayload,
  BulkUpsertTransactionItem,
} from "@/lib/types/supplier_transactions";
import { Supplier } from "@/lib/types/suppliers";

// Components
import Container from "@/components/ui/container";
import Loader from "@/components/ui/loading_spinner";
import StatsCards from "@/components/supplier_transaction/stats_card";
import Controls from "@/components/supplier_transaction/controls";
import TransactionTable from "@/components/supplier_transaction/table";
import TransactionForm from "@/components/supplier_transaction/form";
import BulkUploadForm from "@/components/supplier_transaction/bulk_upload";
import DeleteModal from "@/components/supplier_transaction/delete_modal";
import Trends from "@/components/supplier_transaction/trends";

export default function SupplierTransactionsPage() {
  const [transactions, setTransactions] = useState<SupplierTransaction[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterSupplierId, setFilterSupplierId] = useState("");
  const [filterTransactionType, setFilterTransactionType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<SupplierTransaction | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTransaction, setDeletingTransaction] =
    useState<SupplierTransaction | null>(null);

  // Helper functions to determine status and type from credit/debit
  const getTransactionStatus = (transaction: SupplierTransaction): "completed" | "pending" => {
    return transaction.credit > 0 ? "completed" : "pending";
  };

  const getTransactionType = (transaction: SupplierTransaction): "payment" | "purchase" => {
    return transaction.credit > 0 ? "payment" : "purchase";
  };

  // Load initial data
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [transactionData, supplierData] = await Promise.all([
        supplierTransactionsApi.getAll(),
        supplierApi.getAll(),
      ]);
      setTransactions(transactionData);
      setSuppliers(supplierData);
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

  // Reload transactions
  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await supplierTransactionsApi.getAll();
      setTransactions(data);
    } catch (err: unknown) {
      console.error("Failed to reload transactions:", err);
      toast.error("Failed to reload data");
    } finally {
      setLoading(false);
    }
  };

  // Filter & search with computed status and type
  const filteredTransactions = transactions.filter((t) => {
    const supplier = suppliers.find((s) => s.id === t.supplier_id);
    const supplierName = supplier?.name || "";

    // Search filter
    const matchesSearch =
      supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.reference_no?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (t.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    // Supplier filter
    const matchesSupplierFilter =
      !filterSupplierId ||
      supplierName.toLowerCase().includes(filterSupplierId.toLowerCase());

    // Transaction type filter (computed from credit/debit)
    const transactionType = getTransactionType(t);
    const matchesTypeFilter =
      !filterTransactionType || transactionType === filterTransactionType;

    // Status filter (computed from credit/debit)
    const transactionStatus = getTransactionStatus(t);
    const matchesStatusFilter =
      !filterStatus || transactionStatus === filterStatus;

    return matchesSearch && matchesSupplierFilter && matchesTypeFilter && matchesStatusFilter;
  });

  // Export to Excel
  const handleExport = () => {
    if (filteredTransactions.length === 0) {
      toast.error("No data to export!");
      return;
    }

    const dataToExport = filteredTransactions.map((t) => {
      const supplier = suppliers.find((s) => s.id === t.supplier_id);
      const status = getTransactionStatus(t);
      const type = getTransactionType(t);

      return {
        "Reference No": t.reference_no || "—",
        Supplier: supplier?.name || "Unknown",
        Type: type.charAt(0).toUpperCase() + type.slice(1),
        "Credit Amount": t.credit,
        "Debit Amount": t.debit,
        Status: status.charAt(0).toUpperCase() + status.slice(1),
        "Transaction Date": new Date(t.transaction_date).toLocaleDateString(),
        Notes: t.notes || "",
        "Created At": new Date(t.created_at).toLocaleString(),
        "Updated At": new Date(t.updated_at).toLocaleString(),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(
      blob,
      `supplier_transactions_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    toast.success("Spreadsheet exported successfully!");
  };

  // Form submission
  const handleFormSubmit = async (
    data: CreateSupplierTransactionPayload | UpdateSupplierTransactionPayload
  ) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading(
      editingTransaction ? "Updating transaction..." : "Creating transaction..."
    );

    try {
      if (editingTransaction) {
        await supplierTransactionsApi.update(
          editingTransaction.id,
          data as UpdateSupplierTransactionPayload
        );
        toast.success("Transaction updated successfully!");
      } else {
        await supplierTransactionsApi.create(
          data as CreateSupplierTransactionPayload
        );
        toast.success("Transaction created successfully!");
      }

      setShowForm(false);
      setEditingTransaction(null);
      await loadTransactions();
    } catch (err: unknown) {
      console.error("Form submission failed:", err);
      toast.error("Failed to save transaction");
    } finally {
      toast.dismiss(loadingToast);
      setIsSubmitting(false);
    }
  };

  // Bulk submission
  const handleBulkSubmit = async (data: BulkUpsertTransactionItem[]) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading(`Uploading ${data.length} transactions...`);

    try {
      await supplierTransactionsApi.bulkUpsert(data);
      toast.success(`${data.length} transactions uploaded successfully!`);

      setShowBulkForm(false);
      await loadTransactions();
    } catch (err: unknown) {
      console.error("Bulk submission failed:", err);
      toast.error("Failed to upload transactions");
    } finally {
      toast.dismiss(loadingToast);
      setIsSubmitting(false);
    }
  };

  // Edit handler
  const handleEdit = (transaction: SupplierTransaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  // Delete handler
  const handleDeleteRequest = (transaction: SupplierTransaction) => {
    setDeletingTransaction(transaction);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingTransaction) return;
    setIsDeleting(true);
    const loadingToast = toast.loading("Deleting transaction...");

    try {
      await supplierTransactionsApi.delete(deletingTransaction.id);
      toast.success("Transaction deleted successfully!");

      setShowDeleteModal(false);
      setDeletingTransaction(null);
      await loadTransactions();
    } catch (err: unknown) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete transaction");
    } finally {
      toast.dismiss(loadingToast);
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setShowBulkForm(false);
    setEditingTransaction(null);
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
          <StatsCards
            transactions={transactions}
            filteredTransactions={filteredTransactions}
          />

          <Controls
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterSupplierId={filterSupplierId}
            onFilterSupplierIdChange={setFilterSupplierId}
            filterTransactionType={filterTransactionType}
            onFilterTransactionTypeChange={setFilterTransactionType}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
            onAdd={() => setShowForm(true)}
            onBulkAdd={() => setShowBulkForm(true)}
          />

          {showForm && (
            <TransactionForm
              transaction={editingTransaction || undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
              suppliers={suppliers}
            />
          )}

          {showBulkForm && (
            <BulkUploadForm
              onSubmit={handleBulkSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
              suppliers={suppliers}
            />
          )}

          <TransactionTable
            transactions={filteredTransactions}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            loading={loading}
            suppliers={suppliers}
            onRefresh={loadTransactions}
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

          <Trends transactions={transactions} />

          {showDeleteModal && deletingTransaction && (
            <DeleteModal
              transactionId={deletingTransaction.id}
              transactionReference={deletingTransaction.reference_no || "N/A"}
              onConfirm={confirmDelete}
              onCancel={() => {
                setShowDeleteModal(false);
                setDeletingTransaction(null);
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