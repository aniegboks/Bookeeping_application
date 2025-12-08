"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { use } from "react";

import { supplierTransactionsApi } from "@/lib/supplier_transaction";
import { supplierApi } from "@/lib/suppliers";
import { inventoryTransactionApi } from "@/lib/inventory_transactions";
import { inventoryItemApi } from "@/lib/inventory_item"; // Assuming you have this

import {
    SupplierTransaction,
    CreateSupplierTransactionPayload,
    UpdateSupplierTransactionPayload,
    BulkUpsertTransactionItem,
} from "@/lib/types/supplier_transactions";
import { Supplier } from "@/lib/types/suppliers";
import { InventoryTransaction } from "@/lib/types/inventory_transactions";
import { InventoryItem } from "@/lib/types/inventory_item";// Assuming you have this

import Container from "@/components/ui/container";
import Loader from "@/components/ui/loading_spinner";
import StatsCards from "@/components/supplier_transaction/stats_card";
import Controls from "@/components/supplier_transaction/single_control";
import TransactionTable from "@/components/supplier_transaction/table";
import TransactionForm from "@/components/supplier_transaction/form";
import BulkUploadForm from "@/components/supplier_transaction/bulk_upload";
import DeleteModal from "@/components/supplier_transaction/delete_modal";

interface SupplierTransactionsPageProps {
    params: Promise<{ id: string }>;
}

export default function SupplierTransactionsPage({ params }: SupplierTransactionsPageProps) {
    const { id: supplierId } = use(params);

    const { canPerformAction } = useUser();
    const canCreate = canPerformAction("Supplier Transactions", "create");
    const canUpdate = canPerformAction("Supplier Transactions", "update");
    const canDelete = canPerformAction("Supplier Transactions", "delete");

    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [transactions, setTransactions] = useState<SupplierTransaction[]>([]);
    const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>([]);
    const [items, setItems] = useState<InventoryItem[]>([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [filterTransactionType, setFilterTransactionType] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    const [initialLoading, setInitialLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [showBulkForm, setShowBulkForm] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<SupplierTransaction | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingTransaction, setDeletingTransaction] = useState<SupplierTransaction | null>(null);

    const getTransactionStatus = (t: SupplierTransaction) => (t.credit > 0 ? "completed" : "pending");
    const getTransactionType = (t: SupplierTransaction) => (t.credit > 0 ? "payment" : "purchase");

    // Load supplier + transactions + inventory transactions + items
    const loadInitialData = async () => {
        try {
            setLoading(true);

            const [supplierData, transactionData, inventoryData, itemsData] = await Promise.all([
                supplierApi.getById(supplierId),
                supplierTransactionsApi.getAll({ supplier_id: supplierId }),
                inventoryTransactionApi.getAll(),
                inventoryItemApi.getAll().catch(() => []), // Gracefully handle if items API doesn't exist
            ]);

            setSupplier(supplierData);
            setTransactions(transactionData);
            setInventoryTransactions(inventoryData);
            setItems(itemsData);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load supplier data");
        } finally {
            setLoading(false);
            setInitialLoading(false);
        }
    };

    useEffect(() => {
        loadInitialData();
    }, [supplierId]);

    const loadTransactions = async () => {
        try {
            setLoading(true);

            const [transactionData, inventoryData, itemsData] = await Promise.all([
                supplierTransactionsApi.getAll({ supplier_id: supplierId }),
                inventoryTransactionApi.getAll(),
                inventoryItemApi.getAll().catch(() => []),
            ]);

            setTransactions(transactionData);
            setInventoryTransactions(inventoryData);
            setItems(itemsData);
        } catch (err) {
            console.error(err);
            toast.error("Failed to reload transactions");
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter((t) => {
        const type = getTransactionType(t);
        const status = getTransactionStatus(t);

        const matchesSearch =
            t.reference_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.notes?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = !filterTransactionType || type === filterTransactionType;
        const matchesStatus = !filterStatus || status === filterStatus;

        return matchesSearch && matchesType && matchesStatus;
    });

    const handleExport = () => {
        if (!filteredTransactions.length) return toast.error("No data to export!");

        const dataToExport = filteredTransactions.map((t) => {
            // Find related inventory transactions by reference_no (not supplier_transaction_id)
            const relatedInvTransactions = inventoryTransactions.filter(
                (inv) => inv.reference_no === t.reference_no
            );

            // Get item names from item_id (not item_name which doesn't exist)
            const itemNames = relatedInvTransactions
                .map((inv) => {
                    const item = items.find((i) => i.id === inv.item_id);
                    return item?.name || "Unknown Item";
                })
                .join(", ");

            return {
                "Reference No": t.reference_no || "—",
                Supplier: supplier?.name || "Unknown",
                "Item Name(s)": itemNames || "—",
                Type: getTransactionType(t),
                "Credit Amount": t.credit,
                "Debit Amount": t.debit,
                Status: getTransactionStatus(t),
                "Transaction Date": new Date(t.transaction_date).toLocaleDateString(),
                Notes: t.notes || "",
                "Created At": new Date(t.created_at).toLocaleString(),
                "Updated At": new Date(t.updated_at).toLocaleString(),
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
            `supplier_transactions_${new Date().toISOString().slice(0, 10)}.xlsx`
        );

        toast.success("Exported successfully!");
    };

    if (initialLoading) {
        return (
            <div className="mx-6">
                <Container>
                    <div className="flex items-center justify-center py-16">
                        <Loader />
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <div className="mx-6">
            <Container>
                <div className="mt-2 pb-8">
                    <h1 className="text-2xl font-semibold mb-4">{supplier?.name}</h1>

                    <Controls
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        filterSupplierId={""}
                        onFilterSupplierIdChange={() => { }}
                        filterTransactionType={filterTransactionType}
                        onFilterTransactionTypeChange={setFilterTransactionType}
                        filterStatus={filterStatus}
                        onFilterStatusChange={setFilterStatus}
                        onAdd={() => canCreate && setShowForm(true)}
                        onBulkAdd={() => canCreate && setShowBulkForm(true)}
                        canCreate={canCreate}
                    />

                    {showForm && (
                        <TransactionForm
                            transaction={editingTransaction || undefined}
                            onSubmit={async (data) => {
                                setIsSubmitting(true);
                                try {
                                    if (editingTransaction) {
                                        await supplierTransactionsApi.update(editingTransaction.id, data as UpdateSupplierTransactionPayload);
                                        toast.success("Transaction updated!");
                                    } else {
                                        await supplierTransactionsApi.create(data as CreateSupplierTransactionPayload);
                                        toast.success("Transaction created!");
                                    }
                                    setShowForm(false);
                                    setEditingTransaction(null);
                                    await loadTransactions();
                                } catch (err) {
                                    console.error(err);
                                    toast.error("Failed to save transaction");
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
                            onCancel={() => {
                                setShowForm(false);
                                setEditingTransaction(null);
                            }}
                            isSubmitting={isSubmitting}
                            suppliers={[supplier!]}
                        />
                    )}

                    {showBulkForm && (
                        <BulkUploadForm
                            onSubmit={async (data) => {
                                setIsSubmitting(true);
                                try {
                                    await supplierTransactionsApi.bulkUpsert(data);
                                    toast.success(`${data.length} transactions uploaded!`);
                                    setShowBulkForm(false);
                                    await loadTransactions();
                                } catch (err) {
                                    console.error(err);
                                    toast.error("Bulk upload failed");
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
                            onCancel={() => setShowBulkForm(false)}
                            isSubmitting={isSubmitting}
                            suppliers={[supplier!]}
                        />
                    )}

                    <TransactionTable
                        transactions={filteredTransactions}
                        inventoryTransactions={inventoryTransactions}
                        inventoryItem={items}
                        onEdit={(t) => {
                            if (canUpdate) {
                                setEditingTransaction(t);
                                setShowForm(true);
                            }
                        }}
                        onDelete={(t) => {
                            if (canDelete) {
                                setDeletingTransaction(t);
                                setShowDeleteModal(true);
                            }
                        }}
                        loading={loading}
                        suppliers={[supplier!]}
                        onRefresh={loadTransactions}
                        canUpdate={canUpdate}
                        canDelete={canDelete}
                    />

                    <div className="my-4 flex justify-start">
                        <button
                            onClick={handleExport}
                            className="bg-[#3D4C63] hover:bg-[#495C79] text-white px-5 py-2 rounded-sm transition flex items-center gap-2"
                        >
                            <Download className="w-5 h-5" /> Export
                        </button>
                    </div>

                    {showDeleteModal && deletingTransaction && (
                        <DeleteModal
                            transactionId={deletingTransaction.id}
                            transactionReference={deletingTransaction.reference_no || "N/A"}
                            onConfirm={async () => {
                                setIsDeleting(true);
                                try {
                                    await supplierTransactionsApi.delete(deletingTransaction.id);
                                    toast.success("Transaction deleted!");
                                    setShowDeleteModal(false);
                                    setDeletingTransaction(null);
                                    await loadTransactions();
                                } catch (err) {
                                    console.error(err);
                                    toast.error("Delete failed");
                                } finally {
                                    setIsDeleting(false);
                                }
                            }}
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