"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Phone,
  Globe,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  PenSquare,
  FileText,
  Building2,
  User,
  MapPin,
} from "lucide-react";

// Types
interface Supplier {
  id: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  notes?: string;
  balance?: number;
}

interface Props {
  suppliers: Supplier[];
  searchTerm: string;
  filterCountry: string;
  onEdit: (supplier: Supplier) => void;
  loading: boolean;
  onDelete: (id: string, name?: string) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function SuppliersTable({
  suppliers,
  searchTerm,
  filterCountry,
  onEdit,
  onDelete,
  loading,
  canUpdate = true,
  canDelete = true,
}: Props) {
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [suppliersPerPage, setSuppliersPerPage] = useState(10);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Check if user has any action permissions
  const hasAnyActionPermission = canUpdate || canDelete;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(Math.abs(amount));
  };

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Filtering
  const filteredSuppliers = suppliers.filter((s) => {
    const matchesSearch =
      !searchTerm ||
      (s.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (s.contact_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (s.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (s.city?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesCountry =
      !filterCountry ||
      filterCountry === "all" ||
      s.country === filterCountry;

    return matchesSearch && matchesCountry;
  });

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredSuppliers.length / suppliersPerPage)
  );
  const startIndex = (currentPage - 1) * suppliersPerPage;
  const paginatedSuppliers = filteredSuppliers.slice(
    startIndex,
    startIndex + suppliersPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCountry, suppliersPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handlePrev = useCallback(
    () => setCurrentPage((prev) => Math.max(prev - 1, 1)),
    []
  );

  const handleNext = useCallback(
    () => setCurrentPage((prev) => Math.min(prev + 1, totalPages)),
    [totalPages]
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleNext, handlePrev]);

  if (loading)
    return <p className="text-center py-12">Loading suppliers...</p>;

  return (
    <>
      <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-white border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Supplier Info
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Contact Details
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Balance
                </th>
                {/* Only show Actions column if user has any action permission */}
                {hasAnyActionPermission && (
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {paginatedSuppliers.map((supplier) => {
                const balance = supplier.balance || 0;
                const isExpanded = expandedRow === supplier.id;

                return (
                  <React.Fragment key={supplier.id}>
                    <tr className="hover:bg-slate-50 transition-colors">
                      {/* Supplier Info */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-slate-400" />
                            <span className="font-semibold text-slate-900">
                              {supplier.name}
                            </span>
                          </div>
                          {supplier.contact_name && (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-slate-400" />
                              <span className="text-sm text-slate-600">
                                {supplier.contact_name}
                              </span>
                            </div>
                          )}
                          {supplier.notes && (
                            <button
                              onClick={() => toggleRow(supplier.id)}
                              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                              <FileText className="h-3 w-3" />
                              {isExpanded ? "Hide notes" : "View notes"}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Contact Details */}
                      <td className="px-6 py-4">
                        <div className="space-y-2 text-sm">
                          {supplier.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-slate-400" />
                              <a
                                href={`mailto:${supplier.email}`}
                                className="text-blue-600 hover:text-blue-700 truncate max-w-[200px]"
                              >
                                {supplier.email}
                              </a>
                            </div>
                          )}
                          {supplier.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-700">
                                {supplier.phone}
                              </span>
                            </div>
                          )}
                          {supplier.website && (
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-slate-400" />
                              <a
                                href={`https://${supplier.website.replace(
                                  /^https?:\/\//,
                                  ""
                                )}`}
                                target="_blank"
                                className="text-blue-600 hover:text-blue-700 truncate max-w-[200px]"
                              >
                                {supplier.website.replace(
                                  /^https?:\/\//,
                                  ""
                                )}
                              </a>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm">
                          {supplier.address && (
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                              <div className="text-slate-700">
                                <div>{supplier.address}</div>
                                {(supplier.city || supplier.state) && (
                                  <div className="text-slate-600">
                                    {[supplier.city, supplier.state]
                                      .filter(Boolean)
                                      .join(", ")}
                                  </div>
                                )}
                                {supplier.country && (
                                  <div className="text-slate-500">
                                    {supplier.country}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {!supplier.address &&
                            (supplier.city ||
                              supplier.state ||
                              supplier.country) && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-slate-400" />
                                <div className="text-slate-700">
                                  {[supplier.city, supplier.state, supplier.country]
                                    .filter(Boolean)
                                    .join(", ")}
                                </div>
                              </div>
                            )}
                        </div>
                      </td>

                      {/* Balance → Now Navigates */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            router.push(
                              `/suppliers/${supplier.id}`
                            )
                          }
                          className="flex items-center gap-2 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors"
                        >
                          <span
                            className={`font-semibold ${
                              balance >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {balance >= 0 ? "+" : "-"}
                            {formatCurrency(balance)}
                          </span>
                        </button>
                      </td>

                      {/* Actions → Only show if user has permissions */}
                      {hasAnyActionPermission && (
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                router.push(
                                  `/suppliers/${supplier.id}`
                                )
                              }
                              className="p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150"
                              title="View Supplier Page"
                            >
                              <FileText className="h-4 w-4" />
                            </button>

                            {/* Only show Edit button if user can update */}
                            {canUpdate && (
                              <button
                                onClick={() => onEdit(supplier)}
                                className="p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150"
                                title="Edit Supplier"
                              >
                                <PenSquare className="h-4 w-4" />
                              </button>
                            )}

                            {/* Only show Delete button if user can delete */}
                            {canDelete && (
                              <button
                                onClick={() =>
                                  onDelete(supplier.id, supplier.name)
                                }
                                className="p-2 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all duration-150"
                                title="Delete Supplier"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>

                    {/* Expanded Notes */}
                    {isExpanded && supplier.notes && (
                      <tr className="bg-slate-50">
                        <td colSpan={hasAnyActionPermission ? 5 : 4} className="px-6 py-4">
                          <div className="flex items-start gap-2">
                            <FileText className="h-4 w-4 text-slate-400 mt-1" />
                            <div>
                              <div className="text-xs font-semibold text-slate-500 uppercase mb-1">
                                Notes
                              </div>
                              <p className="text-sm text-slate-700">
                                {supplier.notes}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* No Results */}
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

        {/* Pagination */}
        {filteredSuppliers.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-200 bg-white gap-4">
            <p className="text-sm text-slate-500 order-3 sm:order-1">
              Showing {startIndex + 1}–
              {Math.min(
                startIndex + suppliersPerPage,
                filteredSuppliers.length
              )}{" "}
              of{" "}
              <span className="font-semibold">
                {filteredSuppliers.length}
              </span>{" "}
              suppliers
            </p>

            <div className="flex items-center gap-4 order-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>Rows:</span>
                <select
                  value={suppliersPerPage}
                  onChange={(e) =>
                    setSuppliersPerPage(Number(e.target.value))
                  }
                  className="border border-slate-300 rounded-lg px-2 py-1 text-sm"
                >
                  {[10, 20, 50].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center h-8 w-8 text-slate-600 disabled:text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span className="text-sm text-slate-600 whitespace-nowrap">
                    Page <span className="font-semibold">
                      {currentPage}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold">{totalPages}</span>
                  </span>

                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center h-8 w-8 text-slate-600 disabled:text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}