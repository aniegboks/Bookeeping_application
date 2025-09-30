// src/components/debug/ApiDebugHelper.tsx
// Use this component temporarily to verify your API responses
"use client";

import { useEffect, useState } from "react";
import { brandsApi } from "@/lib/brands";
import { categoriesApi } from "@/lib/categories";
import { subCategoryApi } from "@/lib/sub_categories";
import { uomApi } from "@/lib/uom";

export default function ApiDebugHelper() {
  const [debugData, setDebugData] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    async function checkApis() {
      const results: any = {
        brands: { loading: true },
        categories: { loading: true },
        subCategories: { loading: true },
        uoms: { loading: true },
      };

      // Check Brands
      try {
        const brands = await brandsApi.getAll();
        results.brands = {
          success: true,
          count: brands.length,
          sample: brands[0] || null,
          hasIdField: brands[0] ? 'id' in brands[0] : false,
        };
      } catch (error: any) {
        results.brands = { success: false, error: error.message };
      }

      // Check Categories
      try {
        const categories = await categoriesApi.getAll();
        results.categories = {
          success: true,
          count: categories.length,
          sample: categories[0] || null,
          hasIdField: categories[0] ? 'id' in categories[0] : false,
        };
      } catch (error: any) {
        results.categories = { success: false, error: error.message };
      }

      // Check Sub-Categories
      try {
        const subCategories = await subCategoryApi.getAll();
        results.subCategories = {
          success: true,
          count: subCategories.length,
          sample: subCategories[0] || null,
          hasIdField: subCategories[0] ? 'id' in subCategories[0] : false,
          hasCategoryIdField: subCategories[0] ? 'category_id' in subCategories[0] : false,
        };
      } catch (error: any) {
        results.subCategories = { success: false, error: error.message };
      }

      // Check UOMs
      try {
        const uoms = await uomApi.getAll();
        results.uoms = {
          success: true,
          count: uoms.length,
          sample: uoms[0] || null,
          hasIdField: uoms[0] ? 'id' in uoms[0] : false,
        };
      } catch (error: any) {
        results.uoms = { success: false, error: error.message };
      }

      setDebugData(results);
    }

    checkApis();
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-gray-900 text-white p-4 rounded-lg shadow-lg z-50 max-h-96 overflow-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg">API Debug Info</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-red-400 hover:text-red-300 font-bold"
        >
          ✕
        </button>
      </div>

      {!debugData ? (
        <p>Loading debug data...</p>
      ) : (
        <div className="space-y-3 text-xs">
          {Object.entries(debugData).map(([key, value]: [string, any]) => (
            <div key={key} className="border-t border-gray-700 pt-2">
              <h4 className="font-semibold text-yellow-400 mb-1">{key}</h4>
              {value.success ? (
                <div className="space-y-1">
                  <p className="text-green-400">✓ Success</p>
                  <p>Count: {value.count}</p>
                  {value.hasIdField !== undefined && (
                    <p>Has ID field: {value.hasIdField ? "✓" : "✗"}</p>
                  )}
                  {value.hasCategoryIdField !== undefined && (
                    <p>Has category_id: {value.hasCategoryIdField ? "✓" : "✗"}</p>
                  )}
                  {value.sample && (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-blue-400">
                        Sample Data
                      </summary>
                      <pre className="mt-1 p-2 bg-gray-800 rounded overflow-x-auto text-[10px]">
                        {JSON.stringify(value.sample, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-red-400">✗ Failed</p>
                  <p className="text-red-300 text-[10px]">{value.error}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-gray-700 text-[10px] text-gray-400">
        <p>Remove this component before production</p>
      </div>
    </div>
  );
}

// Add this to your inventory page temporarily:
// import ApiDebugHelper from "@/components/debug/ApiDebugHelper";
// 
// Then in your JSX:
// <ApiDebugHelper />