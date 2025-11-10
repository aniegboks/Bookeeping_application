'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Supplier } from '@/lib/types/suppliers';
import { supplierApi } from '@/lib/suppliers'; // ✅ updated import

import StatsCards from '@/components/suppliers_ui/stats_cards';
import SuppliersFilters from '@/components/suppliers_ui/suppliers_filters';
import SuppliersTable from '@/components/suppliers_ui/suppliers_table';
import SupplierModal from '@/components/suppliers_ui/suppliers_modal';
import Container from '@/components/ui/container';
import Trends from '@/components/suppliers_ui/trends';
import DeleteModal from '@/components/suppliers_ui/delete_modal';
import LoadingSpinner from '@/components/ui/loading_spinner';
import SupplierBalances from '@/components/suppliers_ui/supplier_balance';
import { Download } from 'lucide-react';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type SupplierPayload = Omit<Supplier, 'id' | 'created_at' | 'updated_at' | 'created_by'>;

export default function SuppliersDashboard() {
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
      const data = await supplierApi.getAll(); // ✅ updated
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
    setDeletingId(id);
    setSelectedSupplierName(name || null);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await supplierApi.delete(deletingId); // ✅ updated
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
    setSelectedSupplier(supplier);
    setShowEditModal(true);
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedSupplier(null);
  };

  const handleSupplierSubmit = async (data: SupplierPayload) => {
    try {
      if (showAddModal) {
        await supplierApi.create(data); // ✅ updated
        toast.success('Supplier created successfully');
      } else if (selectedSupplier) {
        await supplierApi.update(selectedSupplier.id, data); // ✅ updated
        toast.success(`Supplier "${selectedSupplier.name}" updated successfully`);
      }
      fetchSuppliers();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save supplier');
    }
  };

  // --- Export ALL filtered suppliers ---
  const handleExport = () => {
    const filteredSuppliers = suppliers.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCountry = filterCountry === 'all' || s.country === filterCountry;
      return matchesSearch && matchesCountry;
    });

    const exportData = filteredSuppliers.map((s) => ({
      Name: s.name,
      Contact: s.contact_name,
      Email: s.email,
      Phone: s.phone,
      City: s.city,
      State: s.state,
      Country: s.country,
      Address: s.address,
      Website: s.website,
      Notes: s.notes,
      'Created At': new Date(s.created_at).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Suppliers');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `suppliers_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success(`Exported ${filteredSuppliers.length} suppliers successfully!`);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {loading && <LoadingSpinner />}

      <div className="w-full">
        <Container>
          <StatsCards suppliers={suppliers} />

          <SuppliersFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterCountry={filterCountry}
            setFilterCountry={setFilterCountry}
            suppliers={suppliers}
            setShowAddModal={setShowAddModal}
          />

          <SuppliersTable
            suppliers={suppliers}
            searchTerm={searchTerm}
            filterCountry={filterCountry}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
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

          <Trends suppliers={suppliers} />

          <div className="mt-8">
            <SupplierBalances />
          </div>

          {(showAddModal || showEditModal) && (
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
