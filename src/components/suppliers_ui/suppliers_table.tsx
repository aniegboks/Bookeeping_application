import React from 'react';
import { Supplier } from '@/lib/types/suppliers';
import { Mail, Phone, Globe, Edit2, Trash2, Search } from 'lucide-react';

interface Props {
  suppliers: Supplier[];
  searchTerm: string;
  filterCountry: string;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
  loading: boolean;
}

export default function SuppliersTable({ suppliers, searchTerm, filterCountry, onEdit, onDelete, loading }: Props) {
  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = filterCountry === 'all' || s.country === filterCountry;
    return matchesSearch && matchesCountry;
  });

  if (loading) return <p className="text-center py-12">Loading suppliers...</p>;

  return (
    <div className="bg-white rounded-2x border border-slate-200 overflow-hidden">
        
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-slate-50 sticky top-0 z-10 ">
          <tr>
            {["Supplier", "Contact", "Location", "Website", "Notes", "Actions"].map((header, i) => (
              <th
                key={header}
                className={`
                  px-6 py-4 text-left text-sm font-semibold text-slate-700
                  ${i === 0 ? "rounded-tl-2xl" : ""}
                  ${i === 5 ? "text-right rounded-tr-2xl" : ""}
                `}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filteredSuppliers.map((supplier, idx) => (
            <tr
              key={supplier.id}
              className={`hover:bg-slate-50 transition-colors ${
                idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
              }`}
            >
              {/* Supplier */}
              <td className="px-6 py-4">
                <div className="font-medium text-slate-900">{supplier.name}</div>
                <div className="text-sm text-slate-500">{supplier.contact_name}</div>
              </td>
  
              {/* Contact */}
              <td className="px-6 py-4">
                <div className="space-y-1 text-sm text-slate-600">
                  {supplier.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-slate-400" />
                      <span className="truncate max-w-[180px]" title={supplier.email}>
                        {supplier.email}
                      </span>
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-slate-400" />
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
                    <Globe size={14} />
                    <span className="truncate max-w-[150px]" title={supplier.website}>
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
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(supplier.id)}
                    className="p-2 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all duration-150"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  
    {/* Empty state */}
    {filteredSuppliers.length === 0 && (
      <div className="text-center py-12">
        <div className="text-slate-400 mb-2">
          <Search size={48} className="mx-auto" />
        </div>
        <p className="text-slate-600 font-medium">No suppliers found</p>
        <p className="text-slate-500 text-sm mt-1">Try adjusting your search or filters</p>
      </div>
    )}
  </div>
  
  );
}
