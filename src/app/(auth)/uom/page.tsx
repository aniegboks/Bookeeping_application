'use client';

import { useState, useEffect } from 'react';
import { UOM } from '@/lib/types/uom';
import { uomApi } from '@/lib/uom';
import StatsCards from '@/components/uom_ui/stats_card';
import UOMList from '@/components/uom_ui/uom_list';
import UOMForm from '@/components/uom_ui/uom_form';
import DeleteUOMModal from '@/components/uom_ui/delete_uom_modal';
import { CreateUOMInput } from '@/lib/types/uom';
import Container from '@/components/ui/container';


export default function UOMsPage() {
  const [uoms, setUoms] = useState<UOM[]>([]);
  const [filteredUOMs, setFilteredUOMs] = useState<UOM[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUOM, setEditingUOM] = useState<UOM | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUOM, setDeletingUOM] = useState<UOM | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUOMs();
  }, []);

  useEffect(() => {
    const filtered = uoms.filter(u =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUOMs(filtered);
  }, [searchTerm, uoms]);

  const fetchUOMs = async () => {
    const data = await uomApi.getAll();
    setUoms(data);
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

  const handleDeleteRequest = (id: string, name: string) => {
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
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Container>
        <div>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#171D26]">Units of Measurment</h1>
          </div>

          {!showForm && <StatsCards uoms={uoms} filteredUOMs={filteredUOMs} />}

          {showForm ? (
            <UOMForm
              uom={editingUOM}
              onSubmit={async (data: CreateUOMInput) => {
                const result = editingUOM
                  ? await uomApi.update(editingUOM.id, data)
                  : await uomApi.create(data);
                handleSuccess();
              }}
              onCancel={handleCancel}
              isSubmitting={false}
            />

          ) : (
            <UOMList
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
        </div>
      </Container>
    </div>
  );
}
