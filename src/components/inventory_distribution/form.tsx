// components/inventory_distribution_ui/distribution_form.tsx

import { useState, useEffect } from "react";
import { 
  InventoryDistribution, 
  CreateInventoryDistributionInput 
} from "@/lib/types/inventory_distribution";

interface DistributionFormProps {
  distribution?: InventoryDistribution;
  onSubmit: (data: CreateInventoryDistributionInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function DistributionForm({
  distribution,
  onSubmit,
  onCancel,
  isSubmitting,
}: DistributionFormProps) {
  const [formData, setFormData] = useState<CreateInventoryDistributionInput>({
    class_id: "",
    inventory_item_id: "",
    session_term_id: "",
    distributed_quantity: 0,
    distribution_date: new Date().toISOString(),
    received_by: "",
    receiver_name: "",
    notes: "",
    created_by: "",
  });

  useEffect(() => {
    if (distribution) {
      setFormData({
        class_id: distribution.class_id,
        inventory_item_id: distribution.inventory_item_id,
        session_term_id: distribution.session_term_id,
        distributed_quantity: distribution.distributed_quantity,
        distribution_date: distribution.distribution_date,
        received_by: distribution.received_by,
        receiver_name: distribution.receiver_name,
        notes: distribution.notes || "",
        created_by: distribution.created_by,
      });
    }
  }, [distribution]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.class_id}
            onChange={(e) =>
              setFormData({ ...formData, class_id: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
            required
            disabled={isSubmitting}
            placeholder="Class UUID"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Inventory Item ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.inventory_item_id}
            onChange={(e) =>
              setFormData({ ...formData, inventory_item_id: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
            required
            disabled={isSubmitting}
            placeholder="Item UUID"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Session Term ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.session_term_id}
            onChange={(e) =>
              setFormData({ ...formData, session_term_id: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
            required
            disabled={isSubmitting}
            placeholder="Term UUID"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            value={formData.distributed_quantity}
            onChange={(e) =>
              setFormData({ 
                ...formData, 
                distributed_quantity: parseInt(e.target.value) || 0 
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Distribution Date <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={
              formData.distribution_date 
                ? new Date(formData.distribution_date).toISOString().slice(0, 16) 
                : ""
            }
            onChange={(e) =>
              setFormData({ 
                ...formData, 
                distribution_date: new Date(e.target.value).toISOString() 
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Received By (ID) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.received_by}
            onChange={(e) =>
              setFormData({ ...formData, received_by: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
            required
            disabled={isSubmitting}
            placeholder="Receiver UUID"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Receiver Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.receiver_name}
            onChange={(e) =>
              setFormData({ ...formData, receiver_name: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
            required
            disabled={isSubmitting}
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Created By (User ID) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.created_by}
            onChange={(e) =>
              setFormData({ ...formData, created_by: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
            required
            disabled={isSubmitting}
            placeholder="User UUID"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) =>
            setFormData({ ...formData, notes: e.target.value })
          }
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
          disabled={isSubmitting}
          placeholder="Additional notes about this distribution..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-[#3D4C63] text-white rounded-lg hover:bg-[#495C79] transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            distribution ? "Update Distribution" : "Create Distribution"
          )}
        </button>
      </div>
    </form>
  );
}