// utils/inventory-helpers.ts

export const calculateProfit = (costPrice: number, sellingPrice: number): number => {
  return sellingPrice - costPrice;
};

export const calculateMargin = (costPrice: number, sellingPrice: number): number => {
  // Check against sellingPrice to prevent division by zero
  if (sellingPrice === 0) return 0; 
  
  // Margin = (Profit / Selling Price) * 100
  return ((sellingPrice - costPrice) / sellingPrice) * 100;
};

export const formatCurrency = (amount: number, currency = "NGN"): string => {
  return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
  }).format(amount);
};

export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
  });
};