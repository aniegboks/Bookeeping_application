'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { UOM } from '@/lib/types/uom';
import { uomApi } from '@/lib/uom';
import StatsCards from '@/components/uom_ui/stats_card';
import UOMList from '@/components/uom_ui/uom_list';
import UOMForm from '@/components/uom_ui/uom_form';
import DeleteUOMModal from '@/components/uom_ui/delete_uom_modal';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Trends from '@/components/uom_ui/trends';
import { CreateUOMInput } from '@/lib/types/uom';
import Container from '@/components/ui/container';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/loading_spinner';
import { Download } from 'lucide-react';

export default function UOMsPage() {
  const { canPerformAction } = useUser();

  const canCreate = canPerformAction("UOM", "create");
  const canUpdate = canPerformAction("UOM", "update");
  const canDelete = canPerformAction("UOM", "delete");

  const [uoms, setUoms] = useState<UOM[]>([]);
  const [filteredUOMs, setFilteredUOMs] = useState<UOM[]>([]);
  const [searchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingUOM, setEditingUOM] = useState<UOM | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUOM, setDeletingUOM] = useState<UOM | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUOMs();
  }, []);

  useEffect(() => {
    const filtered = uoms.filter(
      u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUOMs(filtered);
  }, [searchTerm, uoms]);

  const fetchUOMs = async () => {
    setLoading(true);
    try {
      const data = await uomApi.getAll();
      setUoms(data);
      
      // Only show success on initial load
      if (initialLoading) {
        toast.success(`Successfully loaded ${data.length} unit${data.length !== 1 ? 's' : ''} of measurement`);
      }
    } catch (err) {
      console.error('Failed to fetch UOMs:', err);
      
      const errorMessage = err instanceof Error
        ? err.message
        : "Unable to load units of measurement. Please refresh the page or contact support.";
      
      toast.error(errorMessage, {
        duration: 5000,
        position: "top-center",
      });
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const handleSuccess = async () => {
    setShowForm(false);
    setEditingUOM(null);
    await fetchUOMs();
  };

  const handleEdit = (uom: UOM) => {
    if (!canUpdate) {
      toast.error("You don't have permission to update units of measurement");
      return;
    }
    setEditingUOM(uom);
    setShowForm(true);
    toast(`Editing '${uom.name}' (${uom.symbol})`, { icon: "✏️" });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUOM(null);
    toast("Form canceled", { icon: "ℹ️" });
  };

  const handleDeleteRequest = (id: string) => {
    if (!canDelete) {
      toast.error("You don't have permission to delete units of measurement");
      return;
    }
    const target = uoms.find(u => u.id === id);
    if (target) {
      setDeletingUOM(target);
      setShowDeleteModal(true);
    }
  };

  const confirmDelete = async () => {
    if (!deletingUOM) return;

    if (!canDelete) {
      toast.error("You don't have permission to delete units of measurement");
      return;
    }

    setIsDeleting(true);
    const uomName = `${deletingUOM.name} (${deletingUOM.symbol})`;
    const loadingToast = toast.loading(`Deleting '${uomName}'...`);

    try {
      await uomApi.remove(deletingUOM.id);
      setUoms(prev => prev.filter(u => u.id !== deletingUOM.id));
      setShowDeleteModal(false);
      setDeletingUOM(null);
      
      toast.dismiss(loadingToast);
      toast.success(`Unit of measurement '${uomName}' deleted successfully!`, {
        duration: 4000,
      });
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error('Delete failed:', err);
      
      const errorMessage = err instanceof Error
        ? err.message
        : "Unable to delete unit of measurement. Please try again or contact support.";
      
      toast.error(errorMessage, {
        duration: 6000,
        position: "top-center",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSubmit = async (data: CreateUOMInput) => {
    if (editingUOM && !canUpdate) {
      toast.error("You don't have permission to update units of measurement");
      return;
    }
    if (!editingUOM && !canCreate) {
      toast.error("You don't have permission to create units of measurement");
      return;
    }

    setIsSubmitting(true);
    const isCreating = !editingUOM;
    const uomIdentifier = editingUOM 
      ? `${editingUOM.name} (${editingUOM.symbol})` 
      : `${data.name} (${data.symbol})`;
    
    const loadingToast = toast.loading(
      isCreating ? "Creating unit of measurement..." : `Updating '${uomIdentifier}'...`
    );

    try {
      if (editingUOM) {
        const updated = await uomApi.update(editingUOM.id, data);
        toast.dismiss(loadingToast);
        toast.success(
          `Unit of measurement '${updated.name} (${updated.symbol})' updated successfully!`,
          { duration: 4000 }
        );
      } else {
        const created = await uomApi.create(data);
        toast.dismiss(loadingToast);
        toast.success(
          `Unit of measurement '${created.name} (${created.symbol})' created successfully!`,
          { duration: 4000 }
        );
      }
      await handleSuccess();
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error('Form submission failed:', err);
      
      const errorMessage = err instanceof Error
        ? err.message
        : "Unable to save unit of measurement. Please check your input and try again.";
      
      toast.error(errorMessage, {
        duration: 6000,
        position: "top-center",
      });
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenCreateModal = () => {
    if (!canCreate) {
      toast.error("You don't have permission to create units of measurement");
      return;
    }
    setShowForm(true);
  };

  const exportToSpreadsheet = () => {
    if (!uoms.length) {
      toast("No units of measurement to export", { icon: "⚠️" });
      return;
    }

    try {
      const exportData = uoms.map(u => ({
        ID: u.id,
        Name: u.name,
        Symbol: u.symbol,
        Description: u.description || '',
        CreatedAt: u.created_at ? new Date(u.created_at).toLocaleString() : '',
        UpdatedAt: u.updated_at ? new Date(u.updated_at).toLocaleString() : '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "UOMs");

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
      
      const fileName = `uoms_${new Date().toISOString().split("T")[0]}.xlsx`;
      saveAs(blob, fileName);

      toast.success(
        `Successfully exported ${uoms.length} unit${uoms.length !== 1 ? 's' : ''} of measurement to ${fileName}`
      );
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export units of measurement. Please try again or contact support.", {
        duration: 4000,
      });
    }
  };

  if (initialLoading) {
    return (
      <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#F3F4F7] z-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="w-full">
      <Container>
        <div className="mt-4 px-8">
          {!showForm && (
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Units of Measurement</h2>
            </div>
          )}

          {showForm ? (
            <UOMForm
              uom={editingUOM}
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          ) : (
            <UOMList
              uoms={filteredUOMs}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
              openCreateModal={handleOpenCreateModal}
              canCreate={canCreate}
              canUpdate={canUpdate}
              canDelete={canDelete}
            />
          )}

          {!showForm && (
            <div className="flex justify-start rounded-sm mt-4">
              <button
                onClick={exportToSpreadsheet}
                disabled={uoms.length === 0}
                className="bg-[#3D4C63] hover:bg-[#495C79] text-white px-4 py-2 rounded-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className='flex gap-2'>
                  <Download className="w-5 h-5" />
                  Export {uoms.length > 0 && `(${uoms.length})`}
                </span>
              </button>
            </div>
          )}

          {showDeleteModal && deletingUOM && (
            <DeleteUOMModal
              uomName={`${deletingUOM.name} (${deletingUOM.symbol})`}
              onConfirm={confirmDelete}
              onCancel={() => {
                setShowDeleteModal(false);
                setDeletingUOM(null);
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