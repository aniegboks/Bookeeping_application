'use client';

import { useState, useEffect } from 'react';
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
  const [uoms, setUoms] = useState<UOM[]>([]);
  const [filteredUOMs, setFilteredUOMs] = useState<UOM[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

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
    } catch (err) {
      console.error('Failed to fetch UOMs:', err);
      toast.error('Failed to load units of measurement');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = async () => {
    setShowForm(false);
    setEditingUOM(null);
    await fetchUOMs();
  };

  const handleEdit = (uom: UOM) => {
    setEditingUOM(uom);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUOM(null);
  };

  const handleDeleteRequest = (id: string) => {
    const target = uoms.find(u => u.id === id);
    if (target) {
      setDeletingUOM(target);
      setShowDeleteModal(true);
    }
  };

  const confirmDelete = async () => {
    if (!deletingUOM) return;
    setIsDeleting(true);
    try {
      await uomApi.remove(deletingUOM.id);
      setUoms(prev => prev.filter(u => u.id !== deletingUOM.id));
      setShowDeleteModal(false);
      setDeletingUOM(null);
      toast.success('Unit of measurement deleted successfully!');
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Failed to delete unit of measurement');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSubmit = async (data: CreateUOMInput) => {
    setIsSubmitting(true);
    try {
      if (editingUOM) {
        await uomApi.update(editingUOM.id, data);
        toast.success('Unit of measurement updated successfully!');
      } else {
        await uomApi.create(data);
        toast.success('Unit of measurement created successfully!');
      }
      await handleSuccess();
    } catch (err) {
      console.error('Form submission failed:', err);
      toast.error(editingUOM ? 'Failed to update unit of measurement' : 'Failed to create unit of measurement');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportToSpreadsheet = () => {
    if (!uoms.length) {
      toast.error("No data to export");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(uoms.map(u => ({
      ID: u.id,
      Name: u.name,
      Symbol: u.symbol,
      Description: u.description || '',
      CreatedAt: u.created_at ? new Date(u.created_at).toLocaleString() : '',
      UpdatedAt: u.updated_at ? new Date(u.updated_at).toLocaleString() : '',
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "UOMs");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `uoms_${new Date().toISOString().split("T")[0]}.xlsx`);

    toast.success("Exported as spreadsheet!");
  };

  return (
    <div className="w-full">
      <Container>
        {loading ? (
          <div className="flex justify-center items-center h-[70vh] w-full">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="mt-4 px-8">
            {!showForm && (
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Units of Measurement</h2>
              </div>
            )}

            {!showForm && <StatsCards uoms={uoms} filteredUOMs={filteredUOMs} />}

            <Trends uoms={uoms} />

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
                openCreateModal={() => setShowForm(true)}
              />
            )}

            {showDeleteModal && deletingUOM && (
              <DeleteUOMModal
                uomName={deletingUOM.name}
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteModal(false)}
                isDeleting={isDeleting}
              />
            )}

            {!showForm && (
              <div className="flex justify-start rounded-sm mt-4">
                <button
                  onClick={exportToSpreadsheet}
                  className="bg-[#3D4C63] hover:bg-[#495C79] text-white px-4 py-2 rounded-sm  transition"
                >
                  <span className='flex gap-2'>
                    <Download className="w-5 h-5" />
                    Export
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}
