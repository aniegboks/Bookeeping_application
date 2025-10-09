"use client";

import { useState, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { UOM } from "@/lib/types/uom";
import UOMListItem from "@/components/uom_ui/uom_list_item";
import SmallLoader from "../ui/small_loader";

interface UOMListProps {
  uoms: UOM[];
  loading?: boolean;
  onEdit: (uom: UOM) => void;
  onDelete: (id: string, name: string) => void;
  openCreateModal: () => void;
}

export default function UOMList({
  uoms,
  loading = false,
  onEdit,
  onDelete,
  openCreateModal,
}: UOMListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 🔍 Filter UOMs by search term
  const filteredUOMs = useMemo(() => {
    return uoms.filter(
      (u) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, uoms]);

  // 🧮 Pagination calculations
  const totalPages = Math.ceil(filteredUOMs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredUOMs.slice(startIndex, startIndex + itemsPerPage);

  // 🧭 Navigation handlers
  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Reset to first page when search changes
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="bg-white rounded-sm border border-gray-200 overflow-x-auto">
      {/* Header */}
      <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 tracking-tighter">
        <h2 className="text-lg font-semibold text-[#171D26]">
          All Units of Measure
        </h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search UOMs..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63] text-[#171D26] text-sm"
            />
          </div>
          <button
            onClick={openCreateModal}
            className="bg-[#3D4C63] text-white px-4 py-2 rounded-sm flex items-center gap-2 hover:bg-[#495C79] transition-colors text-sm"
          >
            <Plus size={16} /> Add UOM
          </button>
        </div>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Symbol
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={4} className="text-center py-12 text-gray-500">
                <SmallLoader />
              </td>
            </tr>
          ) : currentItems.length > 0 ? (
            currentItems.map((uom) => (
              <UOMListItem
                key={uom.id}
                uom={uom}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center py-12 text-gray-500">
                {searchTerm
                  ? "No UOMs found matching your search"
                  : "No UOMs found"}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {!loading && filteredUOMs.length > 0 && (
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
          <p>
            Showing {startIndex + 1}–
            {Math.min(startIndex + itemsPerPage, filteredUOMs.length)} of{" "}
            {filteredUOMs.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-lg border ${
                currentPage === 1
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-[#3D4C63] border-gray-300 hover:bg-gray-100"
              }`}
            >
              Previous
            </button>
            <span className="text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-lg border ${
                currentPage === totalPages
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-[#3D4C63] border-gray-300 hover:bg-gray-100"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
