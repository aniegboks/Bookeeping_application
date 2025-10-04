"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { InventoryTransaction } from "@/lib/types/inventory_transactions";
import { inventoryTransactionApi } from "@/lib/inventory_transactions";
import Container from "@/components/ui/container";
import Loader from "@/components/ui/loading_spinner";
import StatsCards from "@/components/transaction_items_ui/stats_card";
import Controls from "@/components/transaction_items_ui/controls";
import TransactionTable from "@/components/transaction_items_ui/table";
import TransactionForm from "@/components/transaction_items_ui/form";
import DeleteModal from "@/components/transaction_items_ui/delete_modal";

import { InventoryItem } from "@/lib/types/inventory_item";
import { Supplier } from "@/lib/types/suppliers";
import { User } from "@/lib/types/user";

// CORRECTED IMPORTS:
import { userApi } from "@/lib/user";
import { inventoryItemApi } from "@/lib/inventory_item";
// 💡 IMPORTANT FIX: Import the function to get all suppliers
import { getAllSuppliers } from "@/lib/suppliers"; 

export default function InventoryTransactionsPage() {
    const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [initialLoading, setInitialLoading] = useState(true);
    const [loading, setLoading] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<InventoryTransaction | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingTransaction, setDeletingTransaction] = useState<InventoryTransaction | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Load ALL data (transactions + supporting data for form)
    const loadAllData = async () => {
        try {
            setLoading(true);
            
            // 💡 FIX APPLIED HERE: Replaced faulty call with the correct getAllSuppliers()
            const [transactionsData, itemsData, suppliersData, usersData] = await Promise.all([
                inventoryTransactionApi.getAll(),
                inventoryItemApi.getAll(), 
                getAllSuppliers(), // Correctly calls the function to get all suppliers
                userApi.getAll(),          
            ]);
            
            setTransactions(transactionsData);
            setInventoryItems(itemsData);
            setSuppliers(suppliersData);
            setUsers(usersData);
            
        } catch (err: any) {
            console.error("Failed to load data:", err);
            toast.error("Failed to load initial data: " + err.message);
        } finally {
            setLoading(false);
            setInitialLoading(false);
        }
    };

    useEffect(() => {
        loadAllData();
    }, []);

    // Filter transactions
    const filteredTransactions = transactions.filter((transaction) => {
        const matchesSearch =
            transaction.reference_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.item_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.supplier_receiver?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = !typeFilter || transaction.transaction_type === typeFilter;
        const matchesStatus = !statusFilter || transaction.status === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
    });

    // Handle form submission (create/update)
    const handleFormSubmit = async (data: any) => {
        setIsSubmitting(true);
        const loadingToast = toast.loading(
            editingTransaction ? "Updating transaction..." : "Creating transaction..."
        );

        try {
            if (editingTransaction) {
                await inventoryTransactionApi.update(editingTransaction.id, data);
                toast.dismiss(loadingToast);
                toast.success("Transaction updated successfully!");
            } else {
                await inventoryTransactionApi.create(data);
                toast.dismiss(loadingToast);
                toast.success("Transaction created successfully!");
            }

            setShowForm(false);
            setEditingTransaction(null);
            await loadAllData(); // Reload all data to ensure lists are fresh
        } catch (err: any) {
            toast.dismiss(loadingToast);
            console.error("Form submission failed:", err);
            toast.error("Failed to save transaction: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle edit
    const handleEdit = (transaction: InventoryTransaction) => {
        setEditingTransaction(transaction);
        setShowForm(true);
    };

    // Handle delete request
    const handleDeleteRequest = (transaction: InventoryTransaction) => {
        setDeletingTransaction(transaction);
        setShowDeleteModal(true);
    };

    // Confirm delete
    const confirmDelete = async () => {
        if (!deletingTransaction) return;

        setIsDeleting(true);
        const loadingToast = toast.loading("Deleting transaction...");

        try {
            await inventoryTransactionApi.delete(deletingTransaction.id);
            toast.dismiss(loadingToast);
            toast.success("Transaction deleted successfully!");

            setShowDeleteModal(false);
            setDeletingTransaction(null);
            await loadAllData(); // Reload all data
        } catch (err: any) {
            toast.dismiss(loadingToast);
            console.error("Delete failed:", err);
            toast.error("Failed to delete transaction: " + err.message);
        } finally {
            setIsDeleting(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        setShowForm(false);
        setEditingTransaction(null);
        toast("Form canceled", { icon: "ℹ️" });
    };

    // Handle add new
    const handleAdd = () => {
        setEditingTransaction(null);
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
                            Inventory Transactions
                        </h1>
                        <p className="text-gray-600">
                            Manage inventory purchases, sales, and transaction records
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <StatsCards
                        transactions={transactions}
                        filteredTransactions={filteredTransactions}
                    />

                    {/* Controls */}
                    <Controls
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        typeFilter={typeFilter}
                        onTypeFilterChange={setTypeFilter}
                        statusFilter={statusFilter}
                        onStatusFilterChange={setStatusFilter}
                        onAdd={handleAdd}
                    />

                    {/* Form Modal */}
                    {showForm && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-[#171D26] mb-4">
                                {editingTransaction ? "Edit Transaction" : "Create New Transaction"}
                            </h2>
                            <TransactionForm
                                transaction={editingTransaction || undefined}
                                onSubmit={handleFormSubmit}
                                onCancel={handleCancel}
                                isSubmitting={isSubmitting}
                                inventoryItems={inventoryItems}
                                suppliers={suppliers}
                                users={users}
                            />
                        </div>
                    )}

                    {/* Table */}
                    <TransactionTable
                        transactions={filteredTransactions}
                        onEdit={handleEdit}
                        onDelete={handleDeleteRequest}
                        loading={loading}
                    />

                    {/* Delete Modal */}
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
                </div>
            </Container>
        </div>
    );
}