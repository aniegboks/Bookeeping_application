"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useUser } from "@/contexts/UserContext";
import { brandsApi, Brand, CreateBrandData } from "@/lib/brands";
import StatsCards from "@/components/brands_ui/stats_cards";
import BrandsTable from "@/components/brands_ui/brands_table";
import BrandModal from "@/components/brands_ui/brands_modal";
import DeleteBrandModal from "@/components/brands_ui/delete_brand_modal";
import Container from "@/components/ui/container";
import LoadingSpinner from "@/components/ui/loading_spinner";
import { Download } from "lucide-react";
import Trends from "@/components/brands_ui/trends";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Enhanced error message extractor
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Return the error message directly (already user-friendly from API layer)
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  // Fallback for unknown error types
  return "An unexpected error occurred. Please try again.";
}

export default function BrandsManagement() {
  const { canPerformAction } = useUser();
  
  const canCreate = canPerformAction("Brands", "create");
  const canUpdate = canPerformAction("Brands", "update");
  const canDelete = canPerformAction("Brands", "delete");
  
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState<CreateBrandData>({ name: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [brandToDelete, setBrandToDelete] =
    useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const data = await brandsApi.getAll();
      setBrands(data);
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error);
      toast.error(errorMsg, {
        duration: 5000,
        position: 'top-right',
      });
      console.error('Failed to fetch brands:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const resetForm = () => setFormData({ name: "" });

  const openCreateModal = () => {
    if (!canCreate) {
      toast.error("You don't have permission to create brands", {
        duration: 4000,
      });
      return;
    }
    setEditingBrand(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (brand: Brand) => {
    if (!canUpdate) {
      toast.error("You don't have permission to update brands", {
        duration: 4000,
      });
      return;
    }
    setEditingBrand(brand);
    setFormData({ name: brand.name });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    // Client-side validation
    const trimmedName = formData.name.trim();
    
    if (!trimmedName) {
      toast.error("Brand name is required and cannot be empty");
      return;
    }
    
    if (trimmedName.length < 2) {
      toast.error("Brand name must be at least 2 characters long");
      return;
    }
    
    if (trimmedName.length > 100) {
      toast.error("Brand name cannot exceed 100 characters");
      return;
    }
    
    // Permission check
    if (editingBrand && !canUpdate) {
      toast.error("You don't have permission to update brands");
      return;
    }
    if (!editingBrand && !canCreate) {
      toast.error("You don't have permission to create brands");
      return;
    }

    // Check for duplicate names (case-insensitive)
    const isDuplicate = brands.some(
      b => 
        b.name.toLowerCase() === trimmedName.toLowerCase() && 
        b.id !== editingBrand?.id
    );
    
    if (isDuplicate) {
      toast.error(`A brand named "${trimmedName}" already exists. Please use a different name.`);
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingBrand) {
        const updated = await brandsApi.update(editingBrand.id, {
          name: trimmedName,
        });
        setBrands(brands.map((b) => (b.id === editingBrand.id ? updated : b)));
        toast.success(`Brand "${updated.name}" updated successfully!`, {
          duration: 3000,
        });
      } else {
        const created = await brandsApi.create({ name: trimmedName });
        setBrands([...brands, created]);
        toast.success(`Brand "${created.name}" created successfully!`, {
          duration: 3000,
        });
      }
      setShowModal(false);
      setEditingBrand(null);
      resetForm();
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error);
      toast.error(errorMsg, {
        duration: 5000,
        position: 'top-right',
      });
      console.error('Failed to save brand:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (id: string, name: string) => {
    if (!canDelete) {
      toast.error("You don't have permission to delete brands", {
        duration: 4000,
      });
      return;
    }
    setBrandToDelete({ id, name });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!brandToDelete) return;
    
    if (!canDelete) {
      toast.error("You don't have permission to delete brands");
      return;
    }
    
    setIsDeleting(true);
    try {
      await brandsApi.delete(brandToDelete.id);
      setBrands(brands.filter((b) => b.id !== brandToDelete.id));
      toast.success(`Brand "${brandToDelete.name}" deleted successfully!`, {
        duration: 3000,
      });
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error);
      toast.error(errorMsg, {
        duration: 5000,
        position: 'top-center',
      });
      console.error('Failed to delete brand:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setBrandToDelete(null);
    }
  };

  const exportToExcel = () => {
    try {
      if (brands.length === 0) {
        toast.error("No brands available to export");
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(
        brands.map((b) => ({
          ID: b.id,
          Name: b.name,
          "Created At": new Date(b.created_at).toLocaleString(),
          "Updated At": new Date(b.updated_at).toLocaleString(),
        }))
      );
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Brands");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      
      const data = new Blob([excelBuffer], { 
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
      });
      
      const fileName = `brands_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(data, fileName);
      
      toast.success(`Exported ${brands.length} brand(s) successfully!`, {
        duration: 3000,
      });
    } catch (error) {
      toast.error("Failed to export brands. Please try again.", {
        duration: 4000,
      });
      console.error('Export error:', error);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="px-8">
      <Container>
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-2">
        </div>

        <BrandsTable
          brands={filteredBrands}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          openCreateModal={openCreateModal}
          openEditModal={openEditModal}
          handleDelete={openDeleteModal}
          canCreate={canCreate}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />

        <div className="flex items-center justify-start mt-4">
          <button
            onClick={exportToExcel}
            disabled={brands.length === 0}
            className={`flex items-center gap-2 bg-[#3D4C63] text-white px-4 py-2 rounded-sm text-sm hover:opacity-90 transition ${
              brands.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Download className="w-5 h-5" />
            <span>Export to Excel</span>
          </button>
        </div>
        
        {showModal && (
          <BrandModal
            editingBrand={editingBrand}
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            setShowModal={setShowModal}
            isSubmitting={isSubmitting}
            resetForm={resetForm}
          />
        )}

        {showDeleteModal && brandToDelete && (
          <DeleteBrandModal
            brandName={brandToDelete.name}
            onCancel={() => setShowDeleteModal(false)}
            onConfirm={confirmDelete}
            isDeleting={isDeleting}
          />
        )}
      </Container>
    </div>
  );
}