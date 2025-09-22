"use client";

import { PenSquare, Trash2, Plus, Search } from "lucide-react";
import { Brand } from "@/lib/brands";

interface BrandsTableProps {
    brands: Brand[];
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    openCreateModal: () => void;
    openEditModal: (brand: Brand) => void;
    handleDelete: (id: string, name: string) => void;
}

export default function BrandsTable({ brands, searchTerm, setSearchTerm, openCreateModal, openEditModal, handleDelete }: BrandsTableProps) {
    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
            <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-[#171D26]">All Brands</h2>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search brands..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63] focus:border-transparent text-[#171D26]"
                        />
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="bg-[#3D4C63] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#495C79] transition-colors whitespace-nowrap"
                    >
                        <Plus size={16} /> Add Brand
                    </button>
                </div>
            </div>

            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {brands.map(brand => (
                        <tr key={brand.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-[#171D26]">{brand.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(brand.created_at)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(brand.updated_at)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                                <button onClick={() => openEditModal(brand)} className="text-[#3D4C63] hover:text-[#495C79] p-2 rounded hover:bg-blue-50">
                                    <PenSquare size={16} />
                                </button>
                                <button onClick={() => handleDelete(brand.id, brand.name)} className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50">
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>

                {brands.length === 0 && (
                    <div className="text-center py-12">
                        <p className="mt-2 text-sm font-medium text-gray-900">No brands found</p>
                    </div>
                )}
            </table>
        </div>
    );
}
