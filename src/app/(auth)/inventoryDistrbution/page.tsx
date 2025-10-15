"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import { InventoryDistribution } from "@/lib/types/inventory_distribution";
import { inventoryDistributionApi } from "@/lib/inventory_distrbution";
import Container from "@/components/ui/container";
import Loader from "@/components/ui/loading_spinner";
import StatsCards from "@/components/inventory_distribution_ui/stats_card";
import Controls from "@/components/inventory_distribution_ui/contorls";
import DistributionTable from "@/components/inventory_distribution_ui/table";
import DistributionForm from "@/components/inventory_distribution_ui/form";

import { schoolClassApi } from "@/lib/classes";
import { inventoryItemApi } from "@/lib/inventory_item";
import { academicSessionsApi } from "@/lib/academic_session";
import { userApi } from "@/lib/user";

import { SchoolClass } from "@/lib/types/classes";
import { InventoryItem } from "@/lib/types/inventory_item";
import { AcademicSession } from "@/lib/types/academic_session";
import { User } from "@/lib/types/user";
import DistributionTrend from "@/components/inventory_distribution_ui/trends";

export default function ClassInventoryDistributionsPage() {
  const [distributions, setDistributions] = useState<InventoryDistribution[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [academicSessions, setAcademicSessions] = useState<AcademicSession[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingDistribution, setEditingDistribution] = useState<InventoryDistribution | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter distributions by search term
  const filteredDistributions = distributions.filter((distribution) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      distribution.class_id.toLowerCase().includes(searchLower) ||
      distribution.inventory_item_id.toLowerCase().includes(searchLower) ||
      distribution.receiver_name.toLowerCase().includes(searchLower) ||
      distribution.notes?.toLowerCase().includes(searchLower)
    );
  });

  // Load all data (classes, items, sessions, users, distributions)
  useEffect(() => {
    const loadData = async () => {
      try {
        setInitialLoading(true);

        const savedDistributions = localStorage.getItem("distributions");
        if (savedDistributions) {
          setDistributions(JSON.parse(savedDistributions));
        }

        const [classesRes, itemsRes, sessionsRes, usersRes, distributionsRes] = await Promise.all([
          schoolClassApi.getAll(),
          inventoryItemApi.getAll(),
          academicSessionsApi.getAll(),
          userApi.getAll(),
          inventoryDistributionApi.getAll(),
        ]);

        setClasses(classesRes);
        setInventoryItems(itemsRes);
        setAcademicSessions(sessionsRes);
        setUsers(usersRes);
        setDistributions(distributionsRes.data);
      } catch (err) {
        console.error("Failed to load initial data:", err);
        toast.error("Failed to load initial data");
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, []);


  // Persist distributions to localStorage
  useEffect(() => {
    if (distributions.length > 0) {
      localStorage.setItem("distributions", JSON.stringify(distributions));
    }
  }, [distributions]);

  // Handle form submission (create/update)
  const handleFormSubmit = async (data: any) => {
    if (currentUser) {
      data.created_by = currentUser.id; // Auto-fill created_by
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading(
      editingDistribution ? "Updating distribution..." : "Creating distribution..."
    );

    try {
      if (editingDistribution) {
        const updated = await inventoryDistributionApi.update(editingDistribution.id, data);
        toast.dismiss(loadingToast);
        toast.success("Distribution updated successfully!");
        setDistributions((prev) =>
          prev.map((d) => (d.id === updated.id ? updated : d))
        );
      } else {
        const created = await inventoryDistributionApi.create(data);
        toast.dismiss(loadingToast);
        toast.success("Distribution created successfully!");
        setDistributions((prev) => [...prev, created]);
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

  const handleEdit = (distribution: InventoryDistribution) => {
    setEditingDistribution(distribution);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDistribution(null);
    toast("Form canceled", { icon: "ℹ️" });
  };

  const handleAdd = () => {
    setEditingDistribution(null);
    setShowForm(true);
  };

  if (initialLoading) {
    return (
      <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#F3F4F7] z-50">
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <Container>
        <div className="mt-4 pb-8">
          <StatsCards
            distributions={distributions}
            filteredDistributions={filteredDistributions}
          />

          <Controls
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAdd={handleAdd}
          />

          {showForm && (
            <DistributionForm
              distribution={editingDistribution || undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
              classes={classes}
              inventoryItems={inventoryItems}
              academicSessions={academicSessions}
              users={users}
              currentUser={currentUser}
            />
          )}

          <DistributionTable
            distributions={filteredDistributions}
            onEdit={handleEdit}
            loading={loading}
          />
          <DistributionTrend distributions={distributions} />        </div>
      </Container>
    </div>
  );
}
