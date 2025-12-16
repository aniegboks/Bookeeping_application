// components/suppliers_ui/suppliers_page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useUser } from '@/contexts/UserContext';
import { Supplier } from '@/lib/types/suppliers';
import { supplierApi } from '@/lib/suppliers';

import StatsCards from '@/components/suppliers_ui/stats_cards';
import SuppliersFilters from '@/components/suppliers_ui/suppliers_filters';
import SuppliersTable from '@/components/suppliers_ui/suppliers_table';
import SupplierModal from '@/components/suppliers_ui/suppliers_modal';
import Container from '@/components/ui/container';
import DeleteModal from '@/components/suppliers_ui/delete_modal';
import SmallLoader from '@/components/ui/small_loader';
import LoadingSpinner from '../ui/loading_spinner';
import { Download } from 'lucide-react';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type SupplierPayload = Omit<Supplier, 'id' | 'created_at' | 'updated_at' | 'created_by'>;

export default function SuppliersDashboard() {
  const { canPerformAction } = useUser();
  
  const canCreate = canPerformAction("Suppliers", "create");
  const canUpdate = canPerformAction("Suppliers", "update");
  const canDelete = canPerformAction("Suppliers", "delete");

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedSupplierName, setSelectedSupplierName] = useState<string | null>(null);

  // --- Fetch suppliers ---
  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await supplierApi.getAll();
      setSuppliers(data);
      
      // Only show success on initial load
      if (loading) {
        toast.success(`Successfully loaded ${data.length} supplier${data.length !== 1 ? 's' : ''}`);
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Unable to load suppliers. Please refresh the page or contact support.";
      
      toast.error(errorMessage, {
        duration: 5000,
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // --- Delete ---
  const handleDelete = (id: string, name?: string) => {
    if (!canDelete) {
      toast.error("You don't have permission to delete suppliers");
      return;
    }
    setDeletingId(id);
    setSelectedSupplierName(name || null);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    
    if (!canDelete) {
      toast.error("You don't have permission to delete suppliers");
      return;
    }

    setIsDeleting(true);
    const supplierName = selectedSupplierName || "supplier";
    const loadingToast = toast.loading(`Deleting '${supplierName}'...`);

    try {
      await supplierApi.delete(deletingId);
      setSuppliers((prev) => prev.filter((s) => s.id !== deletingId));
      setShowDeleteModal(false);
      
      toast.dismiss(loadingToast);
      toast.success(`Supplier '${supplierName}' deleted successfully`, {
        duration: 4000,
      });
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error("Delete failed:", err);
      
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Unable to delete supplier. Please try again or contact support.";
      
      toast.error(errorMessage, {
        duration: 6000,
        position: "top-center",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Edit & Add ---
  const handleEdit = (supplier: Supplier) => {
    if (!canUpdate) {
      toast.error("You don't have permission to update suppliers");
      return;
    }
    setSelectedSupplier(supplier);
    setShowEditModal(true);
    toast(`Editing '${supplier.name}'`, { icon: "✏️" });
  };

  const handleAddClick = () => {
    if (!canCreate) {
      toast.error("You don't have permission to create suppliers");
      return;
    }
    setShowAddModal(true);
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedSupplier(null);
  };

  const handleSupplierSubmit = async (data: SupplierPayload) => {
    const isCreating = showAddModal;
    const loadingToast = toast.loading(
      isCreating ? "Creating supplier..." : `Updating '${selectedSupplier?.name}'...`
    );

    try {
      if (isCreating) {
        if (!canCreate) {
          toast.dismiss(loadingToast);
          toast.error("You don't have permission to create suppliers");
          return;
        }
        const created = await supplierApi.create(data);
        
        toast.dismiss(loadingToast);
        toast.success(`Supplier '${created.name}' created successfully`, {
          duration: 4000,
        });
      } else if (selectedSupplier) {
        if (!canUpdate) {
          toast.dismiss(loadingToast);
          toast.error("You don't have permission to update suppliers");
          return;
        }
        const updated = await supplierApi.update(selectedSupplier.id, data);
        
        toast.dismiss(loadingToast);
        toast.success(`Supplier '${updated.name}' updated successfully`, {
          duration: 4000,
        });
      }
      
      await fetchSuppliers();
      handleModalClose();
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error("Form submission failed:", err);
      
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Unable to save supplier. Please check your input and try again.";
      
      toast.error(errorMessage, {
        duration: 6000,
        position: "top-center",
      });
    }
  };

  // --- Export ALL filtered suppliers with balances ---
  const handleExport = async () => {
    const filteredSuppliers = suppliers.filter((s) => {
      const matchesSearch =
        !searchTerm ||
        searchTerm.trim() === '' ||
        (s.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (s.contact_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (s.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (s.city?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      const matchesCountry =
        !filterCountry ||
        filterCountry === 'all' ||
        filterCountry.trim() === '' ||
        s.country === filterCountry;

      return matchesSearch && matchesCountry;
    });

    if (filteredSuppliers.length === 0) {
      toast("No suppliers to export", { icon: "⚠️" });
      return;
    }

    const loadingToast = toast.loading("Preparing export...");

    try {
      // Fetch balances for export
      const balancesResponse = await fetch('/api/proxy/suppliers/balances');
      const balances: Record<string, number> = {};

      if (balancesResponse.ok) {
        const balanceData = await balancesResponse.json();
        balanceData.forEach((b: { supplier_id: string; balance: number }) => {
          balances[b.supplier_id] = b.balance;
        });
      } else {
        // If balances fail, continue without them
        console.warn("Could not load supplier balances for export");
      }

      const exportData = filteredSuppliers.map((s) => ({
        Name: s.name,
        Contact: s.contact_name || '',
        Email: s.email || '',
        Phone: s.phone || '',
        City: s.city || '',
        State: s.state || '',
        Country: s.country || '',
        Address: s.address || '',
        Website: s.website || '',
        Balance: balances[s.id] || 0,
        Notes: s.notes || '',
        'Created At': s.created_at ? new Date(s.created_at).toLocaleString() : '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Suppliers');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      
      const fileName = `suppliers_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, fileName);
      
      toast.dismiss(loadingToast);
      toast.success(
        `Successfully exported ${filteredSuppliers.length} supplier${filteredSuppliers.length !== 1 ? 's' : ''} to ${fileName}`
      );
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Export error:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to export suppliers. Please try again or contact support.";
      
      toast.error(errorMessage, {
        duration: 4000,
      });
    }
  };

  return (
    <div className="relative h-[100dvh] w-full bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {loading && <LoadingSpinner/>}

      <div className="w-full">
        <Container>

          <SuppliersFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterCountry={filterCountry}
            setFilterCountry={setFilterCountry}
            suppliers={suppliers}
            onAddClick={handleAddClick}
            canCreate={canCreate}
          />

          <SuppliersTable
            suppliers={suppliers}
            searchTerm={searchTerm}
            filterCountry={filterCountry}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
            canUpdate={canUpdate}
            canDelete={canDelete}
          />

          <div className="flex justify-start mt-4">
            <button
              onClick={handleExport}
              disabled={suppliers.length === 0}
              className="px-4 py-2 bg-[#3D4C63] hover:bg-[#495C79] text-white rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className='flex gap-2'>
                <Download className='h-5 w-5' />
                Export {suppliers.length > 0 && `(${suppliers.length})`}
              </span>
            </button>
          </div>

          {(showAddModal || showEditModal) && (canCreate || canUpdate) && (
            <SupplierModal
              supplier={selectedSupplier}
              onClose={handleModalClose}
              onSuccess={fetchSuppliers}
              mode={showAddModal ? 'add' : 'edit'}
              onSubmit={handleSupplierSubmit}
            />
          )}

          {showDeleteModal && deletingId && (
            <DeleteModal
              supplierId={deletingId}
              supplierName={selectedSupplierName || ''}
              onConfirm={confirmDelete}
              onCancel={() => {
                setShowDeleteModal(false);
                setDeletingId(null);
                setSelectedSupplierName(null);
                toast("Delete canceled", { icon: "ℹ️" });
              }}
              isDeleting={isDeleting}
            />
          )}
        </Container>
      </div>
    </div>
  );
}