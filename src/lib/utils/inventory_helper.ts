// utils/inventory-helpers.ts

export const calculateProfit = (costPrice: number, sellingPrice: number): number => {
    return sellingPrice - costPrice;
  };
  
  export const calculateMargin = (costPrice: number, sellingPrice: number): number => {
    if (costPrice === 0) return 0;
    return ((sellingPrice - costPrice) / costPrice) * 100;
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
  