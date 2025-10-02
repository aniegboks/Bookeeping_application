// src/app/(auth)/suppliers/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Download, Upload } from 'lucide-react';
import { Supplier } from '@/lib/types/suppliers';
import {
    getAllSuppliers,
    deleteSupplier,
    createSupplier,
    updateSupplier,
    ApiError
} from '@/lib/suppliers';
import StatsCards from '@/components/suppliers_ui/stats_cards';
import SuppliersFilters from '@/components/suppliers_ui/suppliers_filters';
import SuppliersTable from '@/components/suppliers_ui/suppliers_table';
import SupplierModal from '@/components/suppliers_ui/suppliers_modal';
import Container from '@/components/ui/container';

// NOTE: Since the API schema includes 'created_by' but the client form does not,
// we must include 'created_by' in the Omit for correct typing.
type SupplierPayload = Omit<Supplier, 'id' | 'created_at' | 'updated_at' | 'created_by'>;

export default function SuppliersDashboard() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCountry, setFilterCountry] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

    // Function to fetch suppliers (used on mount and for onSuccess refresh)
    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const data = await getAllSuppliers();
            setSuppliers(data);
        } catch (err) {
            if (err instanceof ApiError) {
                console.error(`API Error (${err.status}): ${err.message}`);
                alert(`Failed to fetch suppliers: ${err.message}`);
            } else {
                console.error("Fetch Error:", err);
                alert("An unexpected error occurred while fetching suppliers.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this supplier?')) {
            try {
                await deleteSupplier(id);
                setSuppliers(prev => prev.filter(s => s.id !== id));
            } catch (err) {
                console.error(err);
                alert('Failed to delete supplier');
            }
        }
    };

    const handleEdit = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setShowEditModal(true);
    };

    const handleModalClose = () => {
        setShowAddModal(false);
        setShowEditModal(false);
        setSelectedSupplier(null);
    }

    // This is the core logic that executes the API call for create/update
    const handleSupplierSubmit = async (data: SupplierPayload) => {
        try {
            if (showAddModal) {
                // NOTE: You may need to add 'created_by' to the data object if the API requires it
                await createSupplier(data);
            } else if (selectedSupplier) {
                await updateSupplier(selectedSupplier.id, data);
            }
        } catch (err) {
            console.error(err);

            // Re-throw the error so the modal can handle closing/not closing, 
            // but also show a user-friendly alert.
            if (err instanceof ApiError) {
                alert(`Failed to save supplier: ${err.message}`);
            } else {
                alert('An unexpected error occurred while saving the supplier.');
            }
            throw err; // Re-throw to stop onSuccess and onClose from running in the modal
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">

            <div className='w-full'>
                <Container>
                    <div className="">
                        {/* Header */}
                        <div className="flex justify-between items-center">
                            <div className='mt-18 mb-8'>
                                <h1 className="text-2xl font-bold text-slate-900">Suppliers</h1>
                                <p className="text-slate-600 mt-1">Manage your supplier relationships</p>
                            </div>
                        </div>

                        {/* Stats & Filters */}
                        <StatsCards suppliers={suppliers} />
                        <SuppliersFilters
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            filterCountry={filterCountry}
                            setFilterCountry={setFilterCountry}
                            suppliers={suppliers}
                            setShowAddModal={setShowAddModal}
                        />

                        {/* Table */}
                        <SuppliersTable
                            suppliers={suppliers}
                            searchTerm={searchTerm}
                            filterCountry={filterCountry}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            loading={loading}
                        />

                        {/* Modal */}
                        {(showAddModal || showEditModal) && (
                            <SupplierModal
                                supplier={selectedSupplier}
                                onClose={handleModalClose}
                                onSuccess={fetchSuppliers} 
                                mode={showAddModal ? 'add' : 'edit'}
                                onSubmit={handleSupplierSubmit} 
                            />
                        )}
                    </div>
                </Container>
            </div>
        </div>
    );
}