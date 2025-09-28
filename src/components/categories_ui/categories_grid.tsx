"use client";

import { FolderOpen, PenSquare, Trash2 } from "lucide-react";

interface CategoriesGridProps {
    categories: any[];
    openEditModal: (cat: any) => void;
    openDeleteModal: (id: string, name: string) => void;
    formatDate: (date: string) => string;
}

export default function CategoriesGrid({
    categories,
    openEditModal,
    openDeleteModal,
    formatDate,
}: CategoriesGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((c) => (
                <div
                    key={c.id}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="p-2 rounded-full bg-purple-100">
                            <FolderOpen className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => openEditModal(c)}
                                className="text-[#3D4C63] hover:text-[#495C79] p-1 rounded hover:bg-blue-50 transition-colors"
                            >
                                <PenSquare className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => openDeleteModal(c.id, c.name)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>

                        </div>
                    </div>
                    <h3 className="font-medium text-[#171D26] mb-2 truncate">{c.name}</h3>
                    <p className="text-xs text-gray-500">
                        Created {formatDate(c.created_at)}
                    </p>
                </div>
            ))}
        </div>
    );
}
