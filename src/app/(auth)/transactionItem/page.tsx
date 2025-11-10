"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

import Container from "@/components/ui/container";
import Loader from "@/components/ui/loading_spinner";
import StatsCards from "@/components/transaction_items_ui/stats_card";
import Controls from "@/components/transaction_items_ui/controls";
import TransactionTable from "@/components/transaction_items_ui/table";
import TransactionForm from "@/components/transaction_items_ui/form";
import DistributionForm from "@/components/transaction_items_ui/distrbution_form";
import DeleteModal from "@/components/transaction_items_ui/delete_modal";
import InventoryTransactionChart from "@/components/transaction_items_ui/trends";

import { schoolClassApi } from "@/lib/classes";
import { academicSessionsApi } from "@/lib/academic_session";
import { inventoryTransactionApi } from "@/lib/inventory_transactions";
import { inventoryItemApi } from "@/lib/inventory_item";
import { supplierApi } from "@/lib/suppliers";
import { userApi } from "@/lib/user";
import { inventoryDistributionApi } from "@/lib/inventory_distrbution";

import {
    InventoryTransaction,
    CreateInventoryTransactionInput,
    UpdateInventoryTransactionInput
} from "@/lib/types/inventory_transactions";

import { CreateInventoryDistributionInput } from "@/lib/types/inventory_distribution";
import { InventoryItem } from "@/lib/types/inventory_item";
import { Supplier } from "@/lib/types/suppliers";
import { User } from "@/lib/types/user";
import { SchoolClass } from "@/lib/types/classes";
import { AcademicSession } from "@/lib/types/academic_session";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";

type FormType = "transaction" | "distribution" | null;

export default function InventoryTransactionsPage() {
    const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [academicSessions, setAcademicSessions] = useState<AcademicSession[]>([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [initialLoading, setInitialLoading] = useState(true);
    const [loading, setLoading] = useState(false);

    const [editingTransaction, setEditingTransaction] = useState<InventoryTransaction | null>(null);
    const [activeForm, setActiveForm] = useState<FormType>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingTransaction, setDeletingTransaction] = useState<InventoryTransaction | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // --- Helpers ---
    const getItemName = (id: string) => inventoryItems.find(i => i.id === id)?.name || id;

    const handleError = (err: unknown, prefix = "Failed") => {
        if (err instanceof Error) toast.error(`${prefix}: ${err.message}`);
        else toast.error(`${prefix}: Unexpected error`);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // --- Load All Data ---
    const loadAllData = useCallback(async () => {
        setLoading(true);
        try {
            const [
                transactionsData,
                itemsData,
                suppliersData,
                usersData,
                classesData,
                sessionsData
            ] = await Promise.all([
                inventoryTransactionApi.getAll(),
                inventoryItemApi.getAll(),
                supplierApi.getAll(),
                userApi.getAll(),
                schoolClassApi.getAll() as Promise<SchoolClass[]>,
                academicSessionsApi.getAll() as Promise<AcademicSession[]>,
            ]);

            setTransactions(transactionsData);
            setInventoryItems(itemsData);
            setSuppliers(suppliersData);
            setUsers(usersData);
            setClasses(classesData);
            setAcademicSessions(sessionsData);

            if (usersData.length > 0) setCurrentUser(usersData[0]);
        } catch (err: unknown) {
            console.error(err);
            handleError(err, "Failed to load data");
        } finally {
            setLoading(false);
            setInitialLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAllData();
    }, [loadAllData]);

    // --- Filters ---
    const filteredTransactions = transactions.filter(t => {
        const matchesSearch =
            t.reference_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getItemName(t.item_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.supplier_receiver?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = !typeFilter || t.transaction_type === typeFilter;
        const matchesStatus = !statusFilter || t.status === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
    });

    // --- Handlers ---
    const handleTransactionSubmit = async (
        data: CreateInventoryTransactionInput | UpdateInventoryTransactionInput
    ) => {
        if (!currentUser) return;
        setIsSubmitting(true);
        const loadingToast = toast.loading(editingTransaction ? "Updating transaction..." : "Creating transaction...");

        try {
            if (editingTransaction) {
                await inventoryTransactionApi.update(editingTransaction.id, data as UpdateInventoryTransactionInput);
                toast.dismiss(loadingToast);
                toast.success("Transaction updated!");
            } else {
                await inventoryTransactionApi.create(data as CreateInventoryTransactionInput);
                toast.dismiss(loadingToast);
                toast.success("Transaction created!");
            }

            setEditingTransaction(null);
            setActiveForm(null);
            await loadAllData();
        } catch (err: unknown) {
            toast.dismiss(loadingToast);
            handleError(err, "Failed to save transaction");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDistributionSubmit = async (data: CreateInventoryDistributionInput) => {
        if (!currentUser) return;
        setIsSubmitting(true);
        const loadingToast = toast.loading("Creating distribution...");

        try {
            await inventoryDistributionApi.create(data);
            toast.dismiss(loadingToast);
            toast.success("Distribution created!");
            setActiveForm(null);
            await loadAllData();
        } catch (err: unknown) {
            toast.dismiss(loadingToast);
            handleError(err, "Failed to create distribution");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (transaction: InventoryTransaction) => {
        setEditingTransaction(transaction);
        setActiveForm("transaction");
    };

    const handleDeleteRequest = (transaction: InventoryTransaction) => {
        setDeletingTransaction(transaction);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deletingTransaction) return;
        setIsDeleting(true);
        const loadingToast = toast.loading("Deleting transaction...");

        try {
            await inventoryTransactionApi.delete(deletingTransaction.id);
            toast.dismiss(loadingToast);
            toast.success("Transaction deleted!");
            setShowDeleteModal(false);
            setDeletingTransaction(null);
            await loadAllData();
        } catch (err: unknown) {
            toast.dismiss(loadingToast);
            handleError(err, "Failed to delete transaction");
        } finally {
            setIsDeleting(false);
        }
    };

    // --- Export to Excel ---
    const exportToExcel = () => {
        if (!filteredTransactions.length) return toast.error("No transactions to export");

        const data = filteredTransactions.map(t => {
            const isPurchase = t.transaction_type === "purchase";
            const quantity = isPurchase ? t.qty_in : t.qty_out;
            const unitCost = isPurchase ? t.in_cost : t.out_cost;
            const totalCost = quantity * unitCost;
            const balance = totalCost - (t.amount_paid || 0);

            return {
                "Transaction Type": t.transaction_type.toUpperCase(),
                "Item": getItemName(t.item_id),
                "Quantity": quantity,
                "Unit Cost": unitCost,
                "Total Cost": totalCost,
                "Amount Paid": t.amount_paid || 0,
                "Balance": balance,
                "Status": t.status.toUpperCase(),
                "Supplier/Receiver": t.supplier_receiver || "—",
                "Reference No": t.reference_no || "—",
                "Date": t.transaction_date ? new Date(t.transaction_date).toLocaleDateString() : "—",
                "Notes": t.notes || "—",
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(data);

        // Set column widths
        worksheet['!cols'] = [
            { wch: 18 }, // Transaction Type
            { wch: 25 }, // Item
            { wch: 10 }, // Quantity
            { wch: 12 }, // Unit Cost
            { wch: 12 }, // Total Cost
            { wch: 12 }, // Amount Paid
            { wch: 12 }, // Balance
            { wch: 12 }, // Status
            { wch: 25 }, // Supplier/Receiver
            { wch: 15 }, // Reference No
            { wch: 12 }, // Date
            { wch: 30 }, // Notes
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

        const filename = `inventory_transactions_${new Date().toISOString().split('T')[0]}.xlsx`;
        saveAs(blob, filename);

        toast.success("Transactions exported successfully!");
    };

    if (initialLoading) return (
        <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#F3F4F7] z-50">
            <Loader />
        </div>
    );

    return (
        <Container>
            <StatsCards transactions={transactions} filteredTransactions={filteredTransactions} />
            <Controls
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                typeFilter={typeFilter}
                onTypeFilterChange={setTypeFilter}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                onAddTransaction={() => { setEditingTransaction(null); setActiveForm("transaction"); }}
            />

            {activeForm === "transaction" && (
                <TransactionForm
                    transaction={editingTransaction || undefined}
                    onSubmit={handleTransactionSubmit}
                    onCancel={() => { setActiveForm(null); setEditingTransaction(null); }}
                    isSubmitting={isSubmitting}
                    inventoryItems={inventoryItems}
                    suppliers={suppliers}
                    users={users}
                    currentUserId={currentUser?.id || ""}
                />
            )}

            {activeForm === "distribution" && (
                <DistributionForm
                    onSubmit={handleDistributionSubmit}
                    onCancel={() => setActiveForm(null)}
                    isSubmitting={isSubmitting}
                    inventoryItems={inventoryItems}
                    classes={classes}
                    academicSessions={academicSessions}
                    users={users}
                    currentUser={currentUser}
                />
            )}

            <TransactionTable
                transactions={filteredTransactions}
                items={inventoryItems}
                onEdit={handleEdit}
                onDelete={handleDeleteRequest}
                loading={loading}
            />

            <div className="my-4 text-left">
                <button
                    onClick={exportToExcel}
                    disabled={filteredTransactions.length === 0}
                    className="px-4 py-2 bg-[#3D4C63] hover:bg-[#495C79] text-white rounded-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <span className="flex gap-2 items-center">
                        <Download className="w-5 h-5" />
                        Export to Excel ({filteredTransactions.length})
                    </span>
                </button>
            </div>

            <InventoryTransactionChart transactions={transactions} />

            {showDeleteModal && deletingTransaction && (
                <DeleteModal
                    transaction={deletingTransaction}
                    onConfirm={confirmDelete}
                    onCancel={() => {
                        setShowDeleteModal(false);
                        setDeletingTransaction(null);
                        toast("Delete canceled", { icon: "ℹ️" });
                    }}
                    isDeleting={isDeleting}
                />
            )}
        </Container>
    );
}