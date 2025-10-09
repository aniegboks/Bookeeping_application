"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
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

// safe error message extractor
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export default function BrandsManagement() {
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
      toast.error(getErrorMessage(error) || "Failed to load brands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const resetForm = () => setFormData({ name: "" });

  const openCreateModal = () => {
    setEditingBrand(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({ name: brand.name });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return toast.error("Brand name is required");
    setIsSubmitting(true);

    try {
      if (editingBrand) {
        const updated = await brandsApi.update(editingBrand.id, {
          name: formData.name.trim(),
        });
        setBrands(brands.map((b) => (b.id === editingBrand.id ? updated : b)));
        toast.success("Brand updated successfully!");
      } else {
        const created = await brandsApi.create({ name: formData.name.trim() });
        setBrands([...brands, created]);
        toast.success("Brand created successfully!");
      }
      setShowModal(false);
      setEditingBrand(null);
      resetForm();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open delete modal
  const openDeleteModal = (id: string, name: string) => {
    setBrandToDelete({ id, name });
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!brandToDelete) return;
    setIsDeleting(true);
    try {
      await brandsApi.delete(brandToDelete.id);
      setBrands(brands.filter((b) => b.id !== brandToDelete.id));
      toast.success("Brand deleted successfully!");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || "Failed to delete brand");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setBrandToDelete(null);
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    if (brands.length === 0) {
      toast.error("No brands to export");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      brands.map((b) => ({
        ID: b.id,
        Name: b.name,
        "Created At": b.created_at,
        "Updated At": b.updated_at,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Brands");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "brands.xlsx");
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="px-8">
      <Container>
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-2">
        </div>

        <StatsCards brands={brands} filteredBrands={filteredBrands} />
        <Trends brands={brands} />

        <BrandsTable
          brands={filteredBrands}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          openCreateModal={openCreateModal}
          openEditModal={openEditModal}
          handleDelete={openDeleteModal} // now opens modal
        />

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

        <div className="flex items-center justify-start mt-4">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-[#3D4C63] text-white px-4 py-2 rounded-sm text-sm hover:opacity-90 transition"
          >
            <Download className="w-5 h-5" />
            <span>Export</span>
          </button>
        </div>
      </Container>
    </div>
  );
}
