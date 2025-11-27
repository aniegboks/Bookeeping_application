
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
import LoadingSpinner from '@/components/ui/loading_spinner';
import { Download } from 'lucide-react';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import SmallLoader from '@/components/ui/small_loader';

type SupplierPayload = Omit<Supplier, 'id' | 'created_at' | 'updated_at' | 'created_by'>;

export default function SuppliersDashboard() {
  // Get permission checker from UserContext
  const { canPerformAction } = useUser();
  
  // Check permissions for different actions
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
      toast.success('Suppliers loaded successfully');
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      toast.error('Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // --- Delete ---
  const handleDelete = (id: string, name?: string) => {
    // Check permission before opening delete modal
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
    
    // Double-check permission before deleting
    if (!canDelete) {
      toast.error("You don't have permission to delete suppliers");
      return;
    }

    setIsDeleting(true);
    try {
      await supplierApi.delete(deletingId);
      setSuppliers((prev) => prev.filter((s) => s.id !== deletingId));
      setShowDeleteModal(false);
      toast.success(`Supplier "${selectedSupplierName}" deleted successfully`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete supplier');
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Edit & Add ---
  const handleEdit = (supplier: Supplier) => {
    // Check permission before opening edit modal
    if (!canUpdate) {
      toast.error("You don't have permission to update suppliers");
      return;
    }
    setSelectedSupplier(supplier);
    setShowEditModal(true);
  };

  const handleAddClick = () => {
    // Check permission before opening add modal
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
    try {
      if (showAddModal) {
        // Double-check permission before creating
        if (!canCreate) {
          toast.error("You don't have permission to create suppliers");
          return;
        }
        await supplierApi.create(data);
        toast.success('Supplier created successfully');
      } else if (selectedSupplier) {
        // Double-check permission before updating
        if (!canUpdate) {
          toast.error("You don't have permission to update suppliers");
          return;
        }
        await supplierApi.update(selectedSupplier.id, data);
        toast.success(`Supplier "${selectedSupplier.name}" updated successfully`);
      }
      fetchSuppliers();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save supplier');
    }
  };

  // --- Export ALL filtered suppliers with balances ---
  const handleExport = async () => {
    try {
      // Fetch balances for export
      const balancesResponse = await fetch('/api/proxy/suppliers/balances');
      let balances: Record<string, number> = {};

      if (balancesResponse.ok) {
        const balanceData = await balancesResponse.json();
        balanceData.forEach((b: { supplier_id: string; balance: number }) => {
          balances[b.supplier_id] = b.balance;
        });
      }

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
      saveAs(blob, `suppliers_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success(`Exported ${filteredSuppliers.length} suppliers successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export suppliers');
    }
  };

  return (
    <div className="relative h-[100dvh] w-full bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {loading && <SmallLoader/>}

      <div className="w-full">
        <Container>
          <StatsCards suppliers={suppliers} />

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
              className="px-4 py-2 bg-[#3D4C63] hover:bg-[#495C79] text-white rounded-sm transition-all"
            >
              <span className='flex gap-2'>
                <Download className='h-5 w-5' />
                Export All
              </span>
            </button>
          </div>

          {/* Only show modals if user has appropriate permissions */}
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
              onCancel={() => setShowDeleteModal(false)}
              isDeleting={isDeleting}
            />
          )}
        </Container>
      </div>
    </div>
  );
}
