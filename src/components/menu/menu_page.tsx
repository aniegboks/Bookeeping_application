"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useUser } from "@/contexts/UserContext";
import { menusApi, Menu, CreateMenuPayload } from "@/lib/menu";
import MenuStatsCards from "@/components/menu/stats_card";
import MenusTable from "@/components/menu/table";
import MenuModal from "@/components/menu/form";
import DeleteMenuModal from "@/components/menu/delete_modal";
import Container from "@/components/ui/container";
import LoadingSpinner from "@/components/ui/loading_spinner";
import { Download } from "lucide-react";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Safe error message extractor
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export default function MenusManagement() {
  // Get permission checker from UserContext
  const { canPerformAction } = useUser();
  
  // Check permissions for different actions
  const canCreate = canPerformAction("Menus", "create");
  const canUpdate = canPerformAction("Menus", "update");
  const canDelete = canPerformAction("Menus", "delete");
  
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [formData, setFormData] = useState<CreateMenuPayload>({ route: "", caption: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [menuToDelete, setMenuToDelete] =
    useState<{ id: string; route: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredMenus = menus.filter((menu) =>
    menu.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
    menu.caption.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const data = await menusApi.getAll();
      setMenus(data);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || "Failed to load menus");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const resetForm = () => setFormData({ route: "", caption: "" });

  const openCreateModal = () => {
    // Check permission before opening modal
    if (!canCreate) {
      toast.error("You don't have permission to create menus");
      return;
    }
    setEditingMenu(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (menu: Menu) => {
    // Check permission before opening modal
    if (!canUpdate) {
      toast.error("You don't have permission to update menus");
      return;
    }
    setEditingMenu(menu);
    setFormData({ route: menu.route, caption: menu.caption });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.route.trim() || !formData.caption.trim()) {
      return toast.error("Route and caption are required");
    }
    
    // Double-check permissions before submitting
    if (editingMenu && !canUpdate) {
      toast.error("You don't have permission to update menus");
      return;
    }
    if (!editingMenu && !canCreate) {
      toast.error("You don't have permission to create menus");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingMenu) {
        const updated = await menusApi.update(editingMenu.id, {
          route: formData.route.trim(),
          caption: formData.caption.trim(),
        });
        setMenus(menus.map((m) => (m.id === editingMenu.id ? updated : m)));
        toast.success("Menu updated successfully!");
      } else {
        const created = await menusApi.create({ 
          route: formData.route.trim(), 
          caption: formData.caption.trim() 
        });
        setMenus([...menus, created]);
        toast.success("Menu created successfully!");
      }
      setShowModal(false);
      setEditingMenu(null);
      resetForm();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open delete modal
  const openDeleteModal = (id: string, route: string) => {
    // Check permission before opening modal
    if (!canDelete) {
      toast.error("You don't have permission to delete menus");
      return;
    }
    setMenuToDelete({ id, route });
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!menuToDelete) return;
    
    // Double-check permission before deleting
    if (!canDelete) {
      toast.error("You don't have permission to delete menus");
      return;
    }
    
    setIsDeleting(true);
    try {
      await menusApi.delete(menuToDelete.id);
      setMenus(menus.filter((m) => m.id !== menuToDelete.id));
      toast.success("Menu deleted successfully!");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || "Failed to delete menu");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setMenuToDelete(null);
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    if (menus.length === 0) {
      toast.error("No menus to export");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      menus.map((m) => ({
        ID: m.id,
        Route: m.route,
        Caption: m.caption,
        "Created At": m.created_at,
        "Updated At": m.updated_at,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Menus");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "menus.xlsx");
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="px-8">
      <Container>
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-2">
        </div>


        <MenusTable
          menus={filteredMenus}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          openCreateModal={openCreateModal}
          openEditModal={openEditModal}
          handleDelete={openDeleteModal}
          // Pass permissions to the table
          canCreate={canCreate}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />

        <div className="flex items-center justify-start mt-4">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-[#3D4C63] text-white px-4 py-2 rounded-sm text-sm hover:opacity-90 transition"
          >
            <Download className="w-5 h-5" />
            <span>Export</span>
          </button>
        </div>

        {showModal && (
          <MenuModal
            editingMenu={editingMenu}
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            setShowModal={setShowModal}
            isSubmitting={isSubmitting}
            resetForm={resetForm}
          />
        )}

        {showDeleteModal && menuToDelete && (
          <DeleteMenuModal
            menuRoute={menuToDelete.route}
            onCancel={() => setShowDeleteModal(false)}
            onConfirm={confirmDelete}
            isDeleting={isDeleting}
          />
        )}
      </Container>
    </div>
  );
}