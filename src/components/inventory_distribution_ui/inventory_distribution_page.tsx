"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useUser } from "@/contexts/UserContext";

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
  const { canPerformAction } = useUser();
  
  const canCreate = canPerformAction("Distributions", "create");
  const canUpdate = canPerformAction("Distributions", "update");

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

  // Filter distributions by general search term
  const filteredDistributions = distributions.filter((distribution) => {
    const searchLower = searchTerm.toLowerCase();
    
    // Get related information for better search
    const classInfo = classes.find((c) => c.id === distribution.class_id);
    const itemInfo = inventoryItems.find((i) => i.id === distribution.inventory_item_id);
    const sessionInfo = academicSessions.find((s) => s.id === distribution.session_term_id);
    const teacherInfo = classTeachers.find((t) => t.id === distribution.received_by);
    
    const className = classInfo?.name || "";
    const itemName = itemInfo?.name || "";
    const sessionName = sessionInfo?.name || "";
    const teacherName = teacherInfo?.name || "";
    
    return (
      className.toLowerCase().includes(searchLower) ||
      itemName.toLowerCase().includes(searchLower) ||
      sessionName.toLowerCase().includes(searchLower) ||
      distribution.receiver_name.toLowerCase().includes(searchLower) ||
      teacherName.toLowerCase().includes(searchLower) ||
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
        
        toast.success("Distribution records loaded successfully", { 
          duration: 2000,
          icon: "✓" 
        });
      } catch (err) {
        console.error("Failed to load initial data:", err);
        
        if (err instanceof Error) {
          toast.error(err.message, { duration: 5000 });
        } else {
          toast.error(
            "Unable to load distribution information. Please refresh the page or contact support if the problem continues.",
            { duration: 5000 }
          );
        }
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle form submission (create/update)
  const handleFormSubmit = async (data: CreateInventoryDistributionInput | UpdateInventoryDistributionInput) => {
    // Double-check permissions
    if (editingDistribution && !canUpdate) {
      toast.error("You don't have permission to update distributions. Please contact your administrator.", {
        duration: 4000,
      });
      return;
    }
    if (!editingDistribution && !canCreate) {
      toast.error("You don't have permission to create distributions. Please contact your administrator.", {
        duration: 4000,
      });
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading(
      editingDistribution 
        ? "Updating distribution record..." 
        : "Creating new distribution record..."
    );

    try {
      if (editingDistribution) {
        const updated = await inventoryDistributionApi.update(
          editingDistribution.id, 
          data as UpdateInventoryDistributionInput
        );
        
        toast.dismiss(loadingToast);
        
        // Get item name for better message
        const itemInfo = inventoryItems.find((i) => i.id === updated.inventory_item_id);
        const itemName = itemInfo?.name || "item";
        
        toast.success(`Distribution record for "${itemName}" has been updated successfully!`, {
          duration: 3000,
        });
        
        setDistributions((prev) =>
          prev.map((d) => (d.id === updated.id ? updated : d))
        );
      } else {
        const created = await inventoryDistributionApi.create(data as CreateInventoryDistributionInput);
        
        toast.dismiss(loadingToast);
        
        // Get item and class names for better message
        const itemInfo = inventoryItems.find((i) => i.id === created.inventory_item_id);
        const classInfo = classes.find((c) => c.id === created.class_id);
        const itemName = itemInfo?.name || "item";
        const className = classInfo?.name || "class";
        
        toast.success(
          `Successfully distributed ${created.distributed_quantity} ${itemName}(s) to ${className}!`,
          { duration: 3000 }
        );
        
        setDistributions((prev) => [...prev, created]);
      }

      setShowForm(false);
      setEditingDistribution(null);
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error("Form submission failed:", err);
      
      if (err instanceof Error) {
        toast.error(err.message, { duration: 5000 });
      } else {
        toast.error(
          editingDistribution 
            ? "Unable to update the distribution record. Please check your input and try again."
            : "Unable to create the distribution record. Please verify all information and try again.",
          { duration: 5000 }
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (distribution: InventoryDistribution) => {
    if (!canUpdate) {
      toast.error("You don't have permission to update distributions. Please contact your administrator.", {
        duration: 4000,
      });
      return;
    }
    setEditingDistribution(distribution);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDistribution(null);
    toast("Distribution form has been closed", { 
      icon: "ℹ️",
      duration: 2000,
    });
  };

  const handleAdd = () => {
    if (!canCreate) {
      toast.error("You don't have permission to create distributions. Please contact your administrator.", {
        duration: 4000,
      });
      return;
    }
    setEditingDistribution(null);
    setShowForm(true);
  };

  // --- Export to Excel ---
  const exportToExcel = () => {
    if (filteredDistributions.length === 0) {
      toast("No distribution data available to export. Try adjusting your search filters.", { 
        icon: "ℹ️",
        duration: 3000,
      });
      return;
    }

    try {
      const data = filteredDistributions.map((d) => {
        const classInfo = classes.find((c) => c.id === d.class_id);
        const itemInfo = inventoryItems.find((i) => i.id === d.inventory_item_id);
        const sessionInfo = academicSessions.find((s) => s.id === d.session_term_id);
        const teacherInfo = classTeachers.find((t) => t.id === d.received_by);

        return {
          "Class": classInfo?.name || "N/A",
          "Item": itemInfo?.name || "N/A",
          "Academic Session": sessionInfo?.name || "N/A",
          "Quantity Distributed": d.distributed_quantity,
          "Receiver": d.receiver_name || teacherInfo?.name || "N/A",
          "Distribution Date": d.distribution_date 
            ? new Date(d.distribution_date).toLocaleDateString() 
            : "Not specified",
          "Notes": d.notes || "No notes",
          "Created At": new Date(d.created_at).toLocaleString(),
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // Auto-size columns for better readability
      const maxWidth = 50;
      const colWidths = Object.keys(data[0] || {}).map(key => ({
        wch: Math.min(
          Math.max(
            key.length,
            ...data.map(row => String(row[key as keyof typeof row] || "").length)
          ),
          maxWidth
        )
      }));
      worksheet['!cols'] = colWidths;
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Distributions");

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
      const fileName = `Inventory_Distributions_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, fileName);
      
      toast.success(
        `Successfully exported ${filteredDistributions.length} distribution record${filteredDistributions.length !== 1 ? 's' : ''} to Excel!`,
        { duration: 3000 }
      );
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export data to Excel. Please try again or contact support.", {
        duration: 4000,
      });
    }
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
  
          <Controls
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAdd={handleAdd}
            canCreate={canCreate}
          />

          {showForm && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#171D26] mb-4">
                {editingDistribution 
                  ? "Edit Distribution Record" 
                  : "Create New Distribution"}
              </h2>
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
            </div>
          )}

          <DistributionTable
            distributions={filteredDistributions}
            onEdit={handleEdit}
            loading={loading}
            classes={classes}
            inventoryItems={inventoryItems}
            classTeachers={classTeachers}
            academicSessions={academicSessions}
            canUpdate={canUpdate}
          />

          <div className="mt-4 flex justify-start">
            <button
              className="px-4 py-2 rounded bg-[#3D4C63] hover:bg-[#495C79] text-white transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={exportToExcel}
              disabled={filteredDistributions.length === 0}
              title={filteredDistributions.length === 0 ? "No data to export" : "Export to Excel"}
            >
              <Download className="w-5 h-5" />
              Export to Excel
            </button>
            {filteredDistributions.length > 0 && (
              <span className="ml-3 text-sm text-gray-600 self-center">
                {filteredDistributions.length} record{filteredDistributions.length !== 1 ? 's' : ''} ready to export
              </span>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}