"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import { InventoryDistribution } from "@/lib/types/inventory_distribution";
import { InventoryTransaction } from "@/lib/types/inventory_transactions";
import { SchoolClass } from "@/lib/types/classes";
import { InventoryItem } from "@/lib/types/inventory_item";
import { User } from "@/lib/types/user";
import { AcademicSession } from "@/lib/types/academic_session";

import Container from "@/components/ui/container";
import Loader from "@/components/ui/loading_spinner";
import StatsCards from "@/components/inventory_distribution/stats_card";
import Controls from "@/components/inventory_distribution/contorls";
import DistributionTable from "@/components/inventory_distribution/table";
import DistributionForm from "@/components/inventory_distribution/form";

import { inventoryDistributionApi } from "@/lib/inventory_distrbution";
import { inventoryTransactionApi } from "@/lib/inventory_transactions";
import { schoolClassApi } from "@/lib/classes";
import { inventoryItemApi } from "@/lib/inventory_item";
import { userApi } from "@/lib/user";
import { academicSessionsApi } from "@/lib/academic_session";

export default function InventoryDistributionsPage() {
  const [distributions, setDistributions] = useState<InventoryDistribution[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [academicSessions, setAcademicSessions] = useState<AcademicSession[]>([]);

  const [selectedTransactionId, setSelectedTransactionId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingDistribution, setEditingDistribution] = useState<InventoryDistribution | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load initial data (transactions, classes, items, users, sessions)
  const loadData = async () => {
    setInitialLoading(true);
    setLoading(true);

    try {
      const [transactionsData, classesData, inventoryItemsData, usersData, sessionsData] = await Promise.all([
        inventoryTransactionApi.getAll(),
        schoolClassApi.getAll(),
        inventoryItemApi.getAll(),
        userApi.getAll(),
        academicSessionsApi.getAll(),
      ]);

      setTransactions(transactionsData);
      setClasses(classesData);
      setInventoryItems(inventoryItemsData);
      setUsers(usersData);
      setAcademicSessions(sessionsData);

      if (transactionsData.length && !selectedTransactionId) {
        setSelectedTransactionId(transactionsData[0].id);
      }
    } catch (err: any) {
      console.error("Failed to load data:", err);
      toast.error("Failed to load data: " + err.message);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Load all distributions from server
  const loadDistributions = async () => {
    setLoading(true);
    try {
      const data = await inventoryDistributionApi.getAll();
      setDistributions(data);
    } catch (err: any) {
      console.error("Failed to load distributions:", err);
      toast.error("Failed to load distributions: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDistributions();
  }, []);

  // Filter distributions by selected transaction
  const filteredDistributions = distributions
    .filter(d => !selectedTransactionId || d.transaction_id === selectedTransactionId)
    .filter(d => {
      const searchLower = searchTerm.toLowerCase();
      const className = classes.find(c => c.id === d.class_id)?.name || d.class_id;
      const itemName = inventoryItems.find(i => i.id === d.inventory_item_id)?.name || d.inventory_item_id;

      return (
        d.receiver_name.toLowerCase().includes(searchLower) ||
        className.toLowerCase().includes(searchLower) ||
        itemName.toLowerCase().includes(searchLower) ||
        (d.notes?.toLowerCase().includes(searchLower) ?? false)
      );
    });

  // Form Submission
  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading(
      editingDistribution ? "Updating distribution..." : "Creating distribution..."
    );

    try {
      if (editingDistribution) {
        await inventoryDistributionApi.update(editingDistribution.id, data);
        toast.success("Distribution updated!");
      } else {
        await inventoryDistributionApi.create(data);
        toast.success("Distribution created!");
      }

      await loadDistributions();
      setShowForm(false);
      setEditingDistribution(null);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to save distribution: " + err.message);
    } finally {
      toast.dismiss(loadingToast);
      setIsSubmitting(false);
    }
  };

  const handleEdit = (dist: InventoryDistribution) => {
    setEditingDistribution(dist);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingDistribution(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDistribution(null);
    toast("Form canceled", { icon: "ℹ️" });
  };

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
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#171D26] mb-2">Inventory Distributions</h1>
            <p className="text-gray-600">Track and manage inventory distributions to classes</p>
          </div>

          {/* Transaction Selector */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Inventory Transaction
            </label>
            <select
              value={selectedTransactionId}
              onChange={(e) => setSelectedTransactionId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">-- Select a transaction --</option>
              {transactions.map(t => (
                <option key={t.id} value={t.id}>
                  {t.reference_no} - {new Date(t.transaction_date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          {/* Stats Cards */}
          <StatsCards distributions={distributions} filteredDistributions={filteredDistributions} />

          {/* Controls */}
          <Controls searchTerm={searchTerm} onSearchChange={setSearchTerm} onAdd={handleAdd} />

          {/* Form */}
          {showForm && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#171D26] mb-4">
                {editingDistribution ? "Edit Distribution" : "Create New Distribution"}
              </h2>
              <DistributionForm
                distribution={editingDistribution || undefined}
                onSubmit={handleFormSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
                classes={classes}
                inventoryItems={inventoryItems}
                users={users}
                academicSessions={academicSessions}
              />
            </div>
          )}

          {/* Table */}
          <DistributionTable
            distributions={filteredDistributions}
            onEdit={handleEdit}
            loading={loading}
            classes={classes}
            inventoryItems={inventoryItems}
          />
        </div>
      </Container>
    </div>
  );
}
