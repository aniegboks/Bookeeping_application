'use client';

import { useState, useEffect } from 'react';
import { UOM, CreateUOMInput } from '@/lib/types/uom';
import SmallLoader from '../ui/small_loader';

interface UOMFormProps {
  uom?: UOM | null;
  onSubmit: (data: CreateUOMInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function UOMForm({ uom, onSubmit, onCancel, isSubmitting }: UOMFormProps) {
  const [formData, setFormData] = useState<CreateUOMInput>({ name: '', symbol: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (uom) {
      setFormData({ name: uom.name, symbol: uom.symbol });
    }
  }, [uom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await onSubmit(formData);
      if (!uom) setFormData({ name: '', symbol: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-[#171D26] mb-4">
          {uom ? 'Edit Unit of Measure' : 'Create New Unit of Measure'}
        </h3>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              maxLength={100}
              required
              disabled={isSubmitting}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3D4C63] text-[#171D26]"
              placeholder="e.g., Kilogram"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.name.length}/100 characters</p>
          </div>

          <div>
            <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 mb-1">
              Symbol *
            </label>
            <input
              type="text"
              id="symbol"
              name="symbol"
              value={formData.symbol}
              onChange={handleChange}
              maxLength={20}
              required
              disabled={isSubmitting}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3D4C63] text-[#171D26]"
              placeholder="e.g., kg"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.symbol.length}/20 characters</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !formData.name.trim() || !formData.symbol.trim()}
              className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-white transition-all duration-200 ${
                isSubmitting
                  ? 'bg-[#3D4C63]/70 cursor-not-allowed'
                  : 'bg-[#3D4C63] hover:bg-[#495C79]'
              }`}
            >
              {isSubmitting && (
                <div className="w-4 h-4">
                  <SmallLoader />
                </div>
              )}
              <span>
                {isSubmitting
                  ? uom
                    ? 'Updating...'
                    : 'Creating...'
                  : uom
                  ? 'Update'
                  : 'Create'}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
