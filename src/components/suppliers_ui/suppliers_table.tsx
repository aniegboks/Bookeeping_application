"use client";
import React, { useState, useEffect } from "react";
import { Supplier } from "@/lib/types/suppliers";
import {
  Mail,
  Phone,
  Globe,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  PenSquare,
} from "lucide-react";

interface Props {
  suppliers: Supplier[];
  searchTerm: string;
  filterCountry: string;
  onEdit: (supplier: Supplier) => void;
  loading: boolean;
  onDelete: (id: string, name?: string) => void;
}

export default function SuppliersTable({
  suppliers,
  searchTerm,
  filterCountry,
  onEdit,
  onDelete,
  loading,
}: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [suppliersPerPage, setSuppliersPerPage] = useState(5);

  // --- Filtering ---
  const filteredSuppliers = suppliers.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry =
      filterCountry === "all" || s.country === filterCountry;
    return matchesSearch && matchesCountry;
  });

  // Reset to first page when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCountry, suppliersPerPage]);

  const totalPages = Math.ceil(filteredSuppliers.length / suppliersPerPage);
  const startIndex = (currentPage - 1) * suppliersPerPage;
  const paginatedSuppliers = filteredSuppliers.slice(
    startIndex,
    startIndex + suppliersPerPage
  );

  // --- Pagination Handlers ---
  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  // --- Keyboard Navigation ---
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentPage, totalPages, handleNext]);

  // --- Loading ---
  if (loading) return <p className="text-center py-12">Loading suppliers...</p>;

  return (
    <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <tr>
              {[
                "Supplier",
                "Contact",
                "Location",
                "Website",
                "Notes",
                "Actions",
              ].map((header, i) => (
                <th
                  key={header}
                  className={`px-6 py-4 text-left text-sm font-semibold text-slate-700 ${
                    i === 0 ? "rounded-tl-2xl" : ""
                  } ${i === 5 ? "text-right rounded-tr-2xl" : ""}`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {paginatedSuppliers.map((supplier, idx) => (
              <tr
                key={supplier.id}
                className={`hover:bg-slate-50 transition-colors ${
                  idx % 2 === 0 ? "bg-white" : "bg-white"
                }`}
              >
                {/* Supplier */}
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">
                    {supplier.name}
                  </div>
                  <div className="text-sm text-slate-500">
                    {supplier.contact_name}
                  </div>
                </td>

                {/* Contact */}
                <td className="px-6 py-4">
                  <div className="space-y-1 text-sm text-slate-600">
                    {supplier.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-slate-400" />
                        <span
                          className="truncate max-w-[180px]"
                          title={supplier.email}
                        >
                          {supplier.email}
                        </span>
                      </div>
                    )}
                    {supplier.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="text-slate-400 w-4 h-4" />
                        {supplier.phone}
                      </div>
                    )}
                  </div>
                </td>

                {/* Location */}
                <td className="px-6 py-4 text-sm">
                  <div className="text-slate-700">
                    {supplier.city}, {supplier.state}
                  </div>
                  <div className="text-slate-500">{supplier.country}</div>
                </td>

                {/* Website */}
                <td className="px-6 py-4">
                  {supplier.website ? (
                    <a
                      href={`https://${supplier.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Globe className="w-4 h-4" />
                      <span
                        className="truncate max-w-[150px]"
                        title={supplier.website}
                      >
                        {supplier.website}
                      </span>
                    </a>
                  ) : (
                    <span className="text-slate-400 text-sm">-</span>
                  )}
                </td>

                {/* Notes */}
                <td className="px-6 py-4">
                  <span
                    className="text-sm text-slate-600 line-clamp-1 max-w-xs block"
                    title={supplier.notes || ""}
                  >
                    {supplier.notes || "-"}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(supplier)}
                      className="p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150"
                    >
                      <PenSquare className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(supplier.id, supplier.name)}
                      className="p-2 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all duration-150"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredSuppliers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-2">
            <Search size={48} className="mx-auto" />
          </div>
          <p className="text-slate-600 font-medium">No suppliers found</p>
          <p className="text-slate-500 text-sm mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Pagination Controls */}
      {filteredSuppliers.length > suppliersPerPage && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-200 bg-white gap-4">
          {/* Rows per page */}
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Rows per page:</span>
            <select
              value={suppliersPerPage}
              onChange={(e) => {
                setSuppliersPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-slate-300 rounded-lg px-2 py-1 text-sm focus:outline-none"
            >
              {[5, 10, 20, 50].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          {/* Page info + buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 disabled:text-slate-400 hover:bg-slate-100 rounded-lg"
            >
              <ChevronLeft size={16} /> Prev
            </button>

            <span className="text-sm text-slate-600">
              Page <span className="font-semibold">{currentPage}</span> of{" "}
              <span className="font-semibold">{totalPages}</span>
            </span>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 disabled:text-slate-400 hover:bg-slate-100 rounded-lg"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>

          {/* Total count */}
          <p className="text-sm text-slate-500">
            Showing {startIndex + 1}–
            {Math.min(startIndex + suppliersPerPage, filteredSuppliers.length)} of{" "}
            {filteredSuppliers.length} suppliers
          </p>
        </div>
      )}
    </div>
  );
}
