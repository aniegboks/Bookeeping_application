"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import { 
  InventoryDistribution, 
  CreateInventoryDistributionInput,
  UpdateInventoryDistributionInput 
} from "@/lib/types/inventory_distribution";
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
import { classTeacherApi } from "@/lib/class_teacher";
import { ClassTeacher } from "@/lib/types/class_teacher";

import { SchoolClass } from "@/lib/types/classes";
import { InventoryItem } from "@/lib/types/inventory_item";
import { AcademicSession } from "@/lib/types/academic_session";
import { User } from "@/lib/types/user";
import DistributionTrend from "@/components/inventory_distribution_ui/trends";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";

export default function ClassInventoryDistributionsPage() {
  const [distributions, setDistributions] = useState<InventoryDistribution[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [academicSessions, setAcademicSessions] = useState<AcademicSession[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [classTeachers, setClassTeachers] = useState<ClassTeacher[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading] = useState(false);

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

  // Load all data (classes, items, sessions, users, class teachers, distributions)
  useEffect(() => {
    const loadData = async () => {
      try {
        setInitialLoading(true);

        const [
          classesRes, 
          itemsRes, 
          sessionsRes, 
          usersRes, 
          classTeachersRes,
          distributionsRes
        ] = await Promise.all([
          schoolClassApi.getAll(),
          inventoryItemApi.getAll(),
          academicSessionsApi.getAll(),
          userApi.getAll(),
          classTeacherApi.getAll(),
          inventoryDistributionApi.getAll(),
        ]);

        setClasses(classesRes);
        setInventoryItems(itemsRes);
        setAcademicSessions(sessionsRes);
        setUsers(usersRes);
        setClassTeachers(classTeachersRes);
        setDistributions(distributionsRes.data);
      } catch (err) {
        console.error("Failed to load initial data:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load initial data";
        toast.error(errorMessage);
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle form submission (create/update)
  const handleFormSubmit = async (data: CreateInventoryDistributionInput | UpdateInventoryDistributionInput) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading(
      editingDistribution ? "Updating distribution..." : "Creating distribution..."
    );

    try {
      if (editingDistribution) {
        const updated = await inventoryDistributionApi.update(
          editingDistribution.id, 
          data as UpdateInventoryDistributionInput
        );
        toast.dismiss(loadingToast);
        toast.success("Distribution updated successfully!");
        setDistributions((prev) =>
          prev.map((d) => (d.id === updated.id ? updated : d))
        );
      } else {
        const created = await inventoryDistributionApi.create(data as CreateInventoryDistributionInput);
        toast.dismiss(loadingToast);
        toast.success("Distribution created successfully!");
        setDistributions((prev) => [...prev, created]);
      }

      setShowForm(false);
      setEditingDistribution(null);
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error("Form submission failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      toast.error("Failed to save distribution: " + errorMessage);
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

  // --- Export to Excel ---
  const exportToExcel = () => {
    if (filteredDistributions.length === 0) {
      toast("No data to export", { icon: "ℹ️" });
      return;
    }

    const data = filteredDistributions.map((d) => {
      const classInfo = classes.find((c) => c.id === d.class_id);
      const itemInfo = inventoryItems.find((i) => i.id === d.inventory_item_id);
      const sessionInfo = academicSessions.find((s) => s.id === d.session_term_id);
      const teacherInfo = classTeachers.find((t) => t.id === d.received_by);

      return {
        "Class": classInfo?.name || "N/A",
        "Item": itemInfo?.name || "N/A",
        "Quantity": d.distributed_quantity,
        "Receiver": d.receiver_name || teacherInfo?.name || "N/A",
        "Date": d.distribution_date ? new Date(d.distribution_date).toLocaleDateString() : "",
        "Session": sessionInfo?.name || "N/A",
        "Notes": d.notes || "",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Distributions");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `distributions_export_${new Date().toISOString()}.xlsx`);
    toast.success("Excel file exported successfully!");
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
              classTeachers={classTeachers}
              users={users}
            />
          )}

          <DistributionTable
            distributions={filteredDistributions}
            onEdit={handleEdit}
            loading={loading}
            classes={classes}
            inventoryItems={inventoryItems}
            classTeachers={classTeachers}
          />

          <div className="mt-4 flex justify-start">
            <button
              className="px-4 py-2 rounded bg-[#3D4C63] hover:bg-[#495C79] text-white transition flex items-center gap-2"
              onClick={exportToExcel}
            >
              <Download className="w-5 h-5" />
              Export to Excel
            </button>
          </div>

          <DistributionTrend distributions={distributions} />
        </div>
      </Container>
    </div>
  );
}