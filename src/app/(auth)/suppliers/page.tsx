'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Supplier } from '@/lib/types/suppliers';
import {
    getAllSuppliers,
    deleteSupplier,
    createSupplier,
    updateSupplier,
    ApiError,
} from '@/lib/suppliers';
import StatsCards from '@/components/suppliers_ui/stats_cards';
import SuppliersFilters from '@/components/suppliers_ui/suppliers_filters';
import SuppliersTable from '@/components/suppliers_ui/suppliers_table';
import SupplierModal from '@/components/suppliers_ui/suppliers_modal';
import Container from '@/components/ui/container';
import Trends from '@/components/suppliers_ui/trends';
import DeleteModal from '@/components/suppliers_ui/delete_modal';
import LoadingSpinner from '@/components/ui/loading_spinner';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
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

    // --- Pagination states ---
    const [currentPage, setCurrentPage] = useState(1);
    const suppliersPerPage = 5;

    // --- Fetch suppliers ---
    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const data = await getAllSuppliers();
            setSuppliers(data);
            toast.success('Suppliers loaded successfully');
        } catch (err) {
            if (err instanceof ApiError) {
                console.error(`API Error (${err.status}): ${err.message}`);
                toast.error(`Failed to fetch suppliers: ${err.message}`);
            } else {
                console.error('Fetch Error:', err);
                toast.error('An unexpected error occurred while fetching suppliers.');
            }
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
            await deleteSupplier(deletingId);
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
                await createSupplier(data);
                toast.success('Supplier created successfully');
            } else if (selectedSupplier) {
                await updateSupplier(selectedSupplier.id, data);
                toast.success(`Supplier "${selectedSupplier.name}" updated successfully`);
            }
            fetchSuppliers(); // Refresh table
        } catch (err) {
            console.error(err);
            if (err instanceof ApiError) {
                toast.error(`Failed to save supplier: ${err.message}`);
            } else {
                toast.error('An unexpected error occurred while saving the supplier.');
            }
        }
    };

    // --- Filter & paginate ---
    const filteredSuppliers = suppliers.filter((s) => {
        const matchesSearch =
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.city.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCountry = filterCountry === 'all' || s.country === filterCountry;
        return matchesSearch && matchesCountry;
    });

    const totalPages = Math.ceil(filteredSuppliers.length / suppliersPerPage);
    const startIndex = (currentPage - 1) * suppliersPerPage;
    const paginatedSuppliers = filteredSuppliers.slice(
        startIndex,
        startIndex + suppliersPerPage
    );

    // Reset to first page when filters/search change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterCountry]);

    const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
    const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

    // --- Export current page as spreadsheet ---
    const handleExport = () => {
        const exportData = paginatedSuppliers.map((s) => ({
            Name: s.name,
            Contact: s.contact_name,
            Email: s.email,
            Phone: s.phone,
            City: s.city,
            Country: s.country,
            Address: s.address,
            'Created At': new Date(s.created_at).toLocaleString(),
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Suppliers');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(blob, `suppliers_page_${currentPage}.xlsx`);
        toast.success('Spreadsheet exported successfully!');
    };

    // --- Render ---
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
                        suppliers={paginatedSuppliers}
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
                                Export

                            </span>
                        </button>
                    </div>
                    <Trends suppliers={suppliers} />


                    {/* Pagination controls */}
                    {filteredSuppliers.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-200 bg-white rounded-b-xl gap-4">
                            <p className="text-sm text-slate-600">
                                Showing <span className="font-semibold">{startIndex + 1}</span>–
                                <span className="font-semibold">
                                    {Math.min(startIndex + suppliersPerPage, filteredSuppliers.length)}
                                </span>{' '}
                                of <span className="font-semibold">{filteredSuppliers.length}</span>{' '}
                                suppliers
                            </p>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handlePrev}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 disabled:text-slate-400 hover:bg-slate-100 rounded-lg"
                                >
                                    <ChevronLeft size={16} /> Prev
                                </button>

                                <span className="text-sm text-slate-600">
                                    Page <span className="font-semibold">{currentPage}</span> of{' '}
                                    <span className="font-semibold">{totalPages}</span>
                                </span>

                                <button
                                    onClick={handleNext}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 disabled:text-slate-400 hover:bg-slate-100 rounded-lg"
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
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
