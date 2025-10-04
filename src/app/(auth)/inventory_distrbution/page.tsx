"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { InventoryDistribution } from "@/lib/types/inventory_distribution";
import { inventoryDistributionApi } from "@/lib/inventory_distrbution";
import Container from "@/components/ui/container";
import StatsCards from "@/components/inventory_distribution/stats_card";
import Controls from "@/components/inventory_distribution/contorls";
import DistributionTable from "@/components/inventory_distribution/table";
import DistributionForm from "@/components/inventory_distribution/form";

export default function InventoryDistributionsPage() {
  const [distributions, setDistributions] = useState<InventoryDistribution[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingDistribution, setEditingDistribution] = useState<InventoryDistribution | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter distributions
  const filteredDistributions = distributions.filter((dist) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      dist.receiver_name.toLowerCase().includes(searchLower) ||
      dist.class_id.toLowerCase().includes(searchLower) ||
      dist.inventory_item_id.toLowerCase().includes(searchLower) ||
      (dist.notes?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  // Handle form submission (create/update)
  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading(
      editingDistribution ? "Updating distribution..." : "Creating distribution..."
    );

    try {
      if (editingDistribution) {
        const updated = await inventoryDistributionApi.update(editingDistribution.id, data);
        toast.dismiss(loadingToast);
        toast.success("Distribution updated successfully!");
        
        setDistributions(prev =>
          prev.map(d => d.id === updated.id ? updated : d)
        );
      } else {
        const created = await inventoryDistributionApi.create(data);
        toast.dismiss(loadingToast);
        toast.success("Distribution created successfully!");
        
        setDistributions(prev => [...prev, created]);
      }

      setShowForm(false);
      setEditingDistribution(null);
    } catch (err: any) {
      toast.dismiss(loadingToast);
      console.error("Form submission failed:", err);
      toast.error("Failed to save distribution: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (distribution: InventoryDistribution) => {
    setEditingDistribution(distribution);
    setShowForm(true);
  };

  // Handle cancel
  const handleCancel = () => {
    setShowForm(false);
    setEditingDistribution(null);
    toast("Form canceled", { icon: "ℹ️" });
  };

  // Handle add new
  const handleAdd = () => {
    setEditingDistribution(null);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-[#F3F4F7]">
      <Container>
        <div className="mt-24 pb-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#171D26] mb-2">
              Inventory Distributions
            </h1>
            <p className="text-gray-600">
              Track and manage inventory distributions to classes
            </p>
          </div>

          {/* Stats Cards */}
          <StatsCards
            distributions={distributions}
            filteredDistributions={filteredDistributions}
          />

          {/* Controls */}
          <Controls
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAdd={handleAdd}
          />

          {/* Form Modal */}
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
              />
            </div>
          )}

          {/* Table */}
          <DistributionTable
            distributions={filteredDistributions}
            onEdit={handleEdit}
            loading={loading}
          />
        </div>
      </Container>
    </div>
  );
}