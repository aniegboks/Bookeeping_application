"use client";

import { useState, useEffect } from "react";
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
import { getAllSuppliers } from "@/lib/suppliers";
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
    // --- State ---
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

    // --- Load All Data ---
    const loadAllData = async () => {
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
                getAllSuppliers(),
                userApi.getAll(),
                schoolClassApi.getAll() as Promise<SchoolClass[]>,
                academicSessionsApi.getAll() as Promise<AcademicSession[]>,
            ]);

            const normalizedClasses: SchoolClass[] = classesData.map(c => ({
                ...c,
                class_teacher_id: c.class_teacher_id || "",
                status: c.status || "active",
                created_by: c.created_by || "",
                created_at: c.created_at || new Date().toISOString(),
                updated_at: c.updated_at || new Date().toISOString(),
            }));

            const normalizedSessions: AcademicSession[] = sessionsData.map(s => ({
                ...s,
                name: s.name || s.session,
            }));

            setTransactions(transactionsData);
            setInventoryItems(itemsData);
            setSuppliers(suppliersData);
            setUsers(usersData);
            setClasses(normalizedClasses);
            setAcademicSessions(normalizedSessions);

            if (usersData.length > 0) setCurrentUser(usersData[0]);

        } catch (err: unknown) {
            console.error(err);
            handleError(err, "Failed to load data");
        } finally {
            setLoading(false);
            setInitialLoading(false);
        }
    };

    useEffect(() => { loadAllData(); }, []);

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

    const exportToExcel = () => {
        if (!filteredTransactions.length) return toast.error("No transactions to export");

        const data = filteredTransactions.map(t => ({
            ReferenceNo: t.reference_no,
            Item: getItemName(t.item_id),
            Type: t.transaction_type,
            SupplierReceiver: t.supplier_receiver,
            Quantity: t.qty_in ?? t.qty_out ? t.qty_out ? -t.qty_out : 0 : 0,
            Notes: t.notes,
            Status: t.status,
            CreatedAt: t.created_at,
            UpdatedAt: t.updated_at,
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "inventory_transactions.xlsx");

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
            <InventoryTransactionChart transactions={transactions} />

            <Controls
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                typeFilter={typeFilter}
                onTypeFilterChange={setTypeFilter}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                onAddTransaction={() => { setEditingTransaction(null); setActiveForm("transaction"); }}
                onAddDistribution={() => setActiveForm("distribution")}
            />

            {activeForm === "transaction" && (
                <TransactionForm
                    transaction={editingTransaction || undefined}
                    onSubmit={handleTransactionSubmit}
                    onCancel={() => setActiveForm(null)}
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

            <div className="my-4 text-left">
                <button
                    onClick={exportToExcel}
                    className="px-4 py-2 bg-[#3D4C63] hover:bg-[#495C79] text-white rounded-sm"
                >
                    <span className="flex gap-2">
                        <Download className="w-5 h-5" />
                        Export
                    </span>
                </button>
            </div>
        </Container>
    );
}
