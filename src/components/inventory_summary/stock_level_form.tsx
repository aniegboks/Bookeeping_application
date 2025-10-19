"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";

interface StockLevelFormProps {
  inventoryId: string;
  currentThreshold: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function StockLevelForm({
  inventoryId,
  currentThreshold,
  onSuccess,
  onCancel,
}: StockLevelFormProps) {
  const [threshold, setThreshold] = useState(currentThreshold.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const thresholdValue = parseFloat(threshold);
    
    if (isNaN(thresholdValue) || thresholdValue < 0) {
      setError("Please enter a valid threshold value");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call your API to update the low stock threshold
      const response = await fetch(`/api/proxy/inventories/${inventoryId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          low_stock_threshold: thresholdValue,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update threshold");
      }

      onSuccess?.();
    } catch (err) {
      console.error("Error updating threshold:", err);
      setError(err instanceof Error ? err.message : "Failed to update threshold");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="threshold" className="block text-sm font-medium text-gray-700 mb-2">
          Low Stock Threshold
        </label>
        <input
          type="number"
          id="threshold"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          min="0"
          step="0.01"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter threshold value"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          You&apos;ll be alerted when stock falls below this level
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Updating..." : "Update Threshold"}
        </button>
      </div>
    </form>
  );
}