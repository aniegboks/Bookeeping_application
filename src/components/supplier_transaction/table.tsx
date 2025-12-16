"use client";

import { useState, useEffect, useMemo } from "react";
import { Eye, RefreshCw, CheckCircle, Clock, Package, X, FileText, Calendar, DollarSign, User } from "lucide-react";
import { SupplierTransaction } from "@/lib/types/supplier_transactions";
import { InventoryTransaction } from "@/lib/types/inventory_transactions";
import { Supplier } from "@/lib/types/suppliers";
import { InventoryItem } from "@/lib/types/inventory_item";

interface TransactionTableProps {
  transactions: SupplierTransaction[];
  inventoryItem: InventoryItem[];
  inventoryTransactions: InventoryTransaction[];
  loading?: boolean;
  suppliers: Supplier[];
  onRefresh?: () => void;
}

interface ItemSummary {
  itemId: string;
  itemName: string;
  quantity: number;
  transactionType: string;
  status: string;
}

interface ItemDetailWithPrice extends ItemSummary {
  unitPrice: number;
  totalPrice: number;
}

// Invoice Modal Component (defined before TransactionTable)
function TransactionInvoiceModal({
  transaction,
  supplierName,
  itemDetails,
  onClose,
}: {
  transaction: SupplierTransaction;
  supplierName: string;
  itemDetails: ItemDetailWithPrice[];
  onClose: () => void;
}) {
  const totalAmount = transaction.debit || transaction.credit || 0;
  const amountPaid = transaction.credit || 0;
  const amountOwed = transaction.debit || 0;
  const balance = amountOwed - amountPaid;
  
  const transactionType = transaction.credit > 0 ? "Payment" : "Purchase";
  const transactionStatus = transaction.credit > 0 ? "Completed" : "Pending";
  
  const totalQuantity = itemDetails.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = itemDetails.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header - Changed from dark gradient to white */}
        <div className="bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Transaction Invoice</h2>
              <p className="text-sm text-gray-600 mt-1">Reference: {transaction.reference_no || "N/A"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6 space-y-6">
            {/* Transaction Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Type Card */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-purple-700 mb-2">
                  <Package className="w-5 h-5" />
                  <span className="text-sm font-medium">Type</span>
                </div>
                <p className="text-xl font-bold text-purple-900">{transactionType}</p>
              </div>

              {/* Status Card */}
              <div className={`${transactionStatus === "Completed" ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"} border rounded-lg p-4`}>
                <div className={`flex items-center gap-2 ${transactionStatus === "Completed" ? "text-green-700" : "text-yellow-700"} mb-2`}>
                  {transactionStatus === "Completed" ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  <span className="text-sm font-medium">Status</span>
                </div>
                <p className={`text-xl font-bold ${transactionStatus === "Completed" ? "text-green-900" : "text-yellow-900"}`}>
                  {transactionStatus}
                </p>
              </div>

              {/* Date Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-700 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm font-medium">Date</span>
                </div>
                <p className="text-xl font-bold text-blue-900">
                  {new Date(transaction.transaction_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Supplier Information */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Supplier Information</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Supplier Name:</span>
                  <span className="font-semibold text-gray-900">{supplierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Supplier ID:</span>
                  <span className="font-mono text-sm text-gray-700">{transaction.supplier_id}</span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            {itemDetails.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Items Purchased ({itemDetails.length})
                </h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Item Name</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Unit Price</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {itemDetails.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{item.itemName}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 text-center">
                            <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                            ₦{item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right font-semibold">
                            ₦{item.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {itemDetails.length === 0 && (
              <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No items found for this transaction</p>
                <p className="text-sm text-gray-500 mt-1">Items may not be linked or this is a payment transaction</p>
              </div>
            )}

            {/* Financial Summary - Changed from dark gradient to light */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-gray-700" />
                <h3 className="font-semibold text-lg text-gray-900">Financial Summary</h3>
              </div>
              <div className="space-y-3">
                {transaction.debit > 0 && (
                  <>
                    <div className="flex justify-between items-center pb-2">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-xl font-semibold text-gray-900">
                        ₦{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                      <span className="text-gray-600">Total Amount Owed:</span>
                      <span className="text-2xl font-bold text-gray-900">
                        ₦{amountOwed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </>
                )}
                
                {transaction.credit > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="text-2xl font-bold text-green-700">
                      ₦{amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                {balance > 0 && (
                  <div className="flex justify-between items-center bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                    <span className="font-medium text-yellow-900">Outstanding Balance:</span>
                    <span className="text-xl font-bold text-yellow-900">
                      ₦{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {transaction.notes && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-900 mb-2">Notes</h3>
                <p className="text-sm text-amber-800">{transaction.notes}</p>
              </div>
            )}

            {/* Transaction Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
              <div>
                <span className="font-medium text-gray-700">Created:</span>
                <p className="mt-1">{new Date(transaction.created_at).toLocaleString()}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Last Updated:</span>
                <p className="mt-1">{new Date(transaction.updated_at).toLocaleString()}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Transaction ID:</span>
                <p className="mt-1 font-mono text-xs break-all">{transaction.id}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Created By:</span>
                <p className="mt-1">{transaction.created_by}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Close
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TransactionTable({
  transactions,
  inventoryTransactions,
  inventoryItem,
  loading = false,
  suppliers,
  onRefresh,
}: TransactionTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedTransaction, setSelectedTransaction] = useState<SupplierTransaction | null>(null);
  const [selectedItemDetails, setSelectedItemDetails] = useState<ItemDetailWithPrice[]>([]);

  const totalPages = Math.max(1, Math.ceil(transactions.length / rowsPerPage));
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [transactions.length]);

  // Build mappings for efficient lookups
  const { transactionToItemsMap, itemIdToNameMap, transactionSummaryMap, supplierMap, supplierIdToItemsMap } = useMemo(() => {
    console.log('=== BUILDING MAPPINGS ===');
    console.log('inventoryItem count:', inventoryItem.length);
    console.log('inventoryTransactions count:', inventoryTransactions.length);
    console.log('suppliers count:', suppliers.length);
    
    // Create item ID to item object mapping
    const itemIdMap: Record<string, InventoryItem> = {};
    inventoryItem.forEach((item) => {
      itemIdMap[item.id] = item;
    });
    console.log('Item ID Map created with', Object.keys(itemIdMap).length, 'items');

    // Create item ID to name mapping
    const itemNameMap: Record<string, string> = {};
    inventoryItem.forEach((item) => {
      itemNameMap[item.id] = item.name;
    });

    // Create supplier ID to name mapping
    const supMap: Record<string, string> = {};
    suppliers.forEach((supplier) => {
      supMap[supplier.id] = supplier.name;
    });

    // Check if inventory transactions have supplier_transaction_id field
    type InventoryTransactionWithOptionalSupplierTxnId = InventoryTransaction & {
      supplier_transaction_id?: string;
    };
    
    const sampleInvTxn = inventoryTransactions[0] as InventoryTransactionWithOptionalSupplierTxnId | undefined;
    const hasSupplierTxnId = sampleInvTxn && 'supplier_transaction_id' in sampleInvTxn;
    
    console.log('Linking method available:', hasSupplierTxnId ? 'supplier_transaction_id' : 'reference_no or supplier_id');

    // Create transaction ID to items mapping
    const txMap: Record<string, string[]> = {};
    const summaryMap: Record<string, ItemSummary[]> = {};
    
    // FALLBACK: Group by supplier_id and transaction_date for unlinked transactions
    const supplierDateMap: Record<string, ItemSummary[]> = {};

    inventoryTransactions.forEach((invTxn) => {
      const inv = invTxn as InventoryTransactionWithOptionalSupplierTxnId;
      
      // Get item name using item_id from inventory items
      const item = itemIdMap[inv.item_id];
      const itemName = item?.name || "Unknown Item";
      
      const summary: ItemSummary = {
        itemId: inv.item_id,
        itemName: itemName,
        quantity: inv.qty_in || 0,
        transactionType: inv.transaction_type,
        status: inv.status,
      };

      // Strategy 1: Link by supplier_transaction_id (if exists)
      if (hasSupplierTxnId && inv.supplier_transaction_id) {
        const linkKey = String(inv.supplier_transaction_id).trim();
        
        if (!txMap[linkKey]) {
          txMap[linkKey] = [];
        }
        if (!txMap[linkKey].includes(itemName)) {
          txMap[linkKey].push(itemName);
        }
        
        if (!summaryMap[linkKey]) {
          summaryMap[linkKey] = [];
        }
        summaryMap[linkKey].push(summary);
      }
      // Strategy 2: Link by reference_no
      else if (inv.reference_no) {
        const linkKey = String(inv.reference_no).trim();
        
        if (!txMap[linkKey]) {
          txMap[linkKey] = [];
        }
        if (!txMap[linkKey].includes(itemName)) {
          txMap[linkKey].push(itemName);
        }
        
        if (!summaryMap[linkKey]) {
          summaryMap[linkKey] = [];
        }
        summaryMap[linkKey].push(summary);
      }
      
      // Strategy 3 (FALLBACK): Group by supplier_id + date for matching later
      if (inv.supplier_id && inv.transaction_date) {
        const fallbackKey = `${inv.supplier_id}|${inv.transaction_date}`;
        if (!supplierDateMap[fallbackKey]) {
          supplierDateMap[fallbackKey] = [];
        }
        supplierDateMap[fallbackKey].push(summary);
      }
    });

    console.log('Transaction to Items Map keys (first 10):', Object.keys(txMap).slice(0, 10));
    console.log('Total mapped keys:', Object.keys(txMap).length);
    console.log('Fallback supplier-date groups:', Object.keys(supplierDateMap).length);
    
    // Log supplier transaction IDs/references for comparison
    const supplierKeys = transactions.map(t => t.id || t.reference_no).filter(Boolean);
    console.log('Supplier transaction keys (first 10):', supplierKeys.slice(0, 10));
    console.log('Total supplier transactions:', transactions.length);
    
    // Check for matches
    let matchCount = 0;
    transactions.forEach(t => {
      const hasIdMatch = t.id && txMap[t.id];
      const hasRefMatch = t.reference_no && txMap[String(t.reference_no).trim()];
      const hasFallbackMatch = t.supplier_id && t.transaction_date && 
        supplierDateMap[`${t.supplier_id}|${t.transaction_date}`];
      
      if (hasIdMatch || hasRefMatch || hasFallbackMatch) matchCount++;
    });
    console.log(`Matching: ${matchCount} out of ${transactions.length} supplier transactions have items`);

    return { 
      transactionToItemsMap: txMap, 
      itemIdToNameMap: itemNameMap, 
      transactionSummaryMap: summaryMap,
      supplierMap: supMap,
      supplierIdToItemsMap: supplierDateMap
    };
  }, [inventoryItem, inventoryTransactions, suppliers, transactions]);

  // Helper functions
  const getSupplierName = (supplierId: string) => {
    return supplierMap[supplierId] || "Unknown Supplier";
  };

  const getItemNames = (transaction: SupplierTransaction): string => {
    // Try multiple linking strategies in order of reliability
    let linkKey = '';
    
    // Strategy 1: Direct ID match (if supplier_transaction_id exists in inventory)
    if (transaction.id && transactionToItemsMap[transaction.id]) {
      linkKey = transaction.id;
    } 
    // Strategy 2: Reference number match
    else if (transaction.reference_no && transactionToItemsMap[String(transaction.reference_no).trim()]) {
      linkKey = String(transaction.reference_no).trim();
    }
    // Strategy 3 (FALLBACK): Match by supplier_id + date
    else if (transaction.supplier_id && transaction.transaction_date) {
      const fallbackKey = `${transaction.supplier_id}|${transaction.transaction_date}`;
      const fallbackItems = supplierIdToItemsMap[fallbackKey];
      
      if (fallbackItems && fallbackItems.length > 0) {
        const uniqueNames = [...new Set(fallbackItems.map(item => item.itemName))];
        if (uniqueNames.length === 1) return uniqueNames[0];
        return `${uniqueNames[0]} (+${uniqueNames.length - 1} more)`;
      }
    }
    
    if (!linkKey) {
      return "No Items";
    }
    
    const items = transactionToItemsMap[linkKey];
    
    if (!items || items.length === 0) {
      return "No Items";
    }
    
    if (items.length === 1) return items[0];
    return `${items[0]} (+${items.length - 1} more)`;
  };

  const getItemDetails = (transaction: SupplierTransaction): ItemDetailWithPrice[] => {
    // Try multiple linking strategies
    let linkKey = '';
    let relatedItems: ItemSummary[] = [];
    
    // Strategy 1: Direct ID match
    if (transaction.id && transactionSummaryMap[transaction.id]) {
      linkKey = transaction.id;
      relatedItems = transactionSummaryMap[linkKey];
    } 
    // Strategy 2: Reference number match
    else if (transaction.reference_no && transactionSummaryMap[String(transaction.reference_no).trim()]) {
      linkKey = String(transaction.reference_no).trim();
      relatedItems = transactionSummaryMap[linkKey];
    }
    // Strategy 3 (FALLBACK): Match by supplier_id + date
    else if (transaction.supplier_id && transaction.transaction_date) {
      const fallbackKey = `${transaction.supplier_id}|${transaction.transaction_date}`;
      relatedItems = supplierIdToItemsMap[fallbackKey] || [];
    }

    const totalAmount = transaction.debit || 0;
    const totalQuantity = relatedItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

    return relatedItems.map((item) => {
      const unitPrice = totalQuantity > 0 
        ? totalAmount / totalQuantity 
        : (relatedItems.length > 0 ? totalAmount / relatedItems.length : 0);
      const totalPrice = item.quantity * unitPrice;
      return { ...item, unitPrice, totalPrice };
    });
  };

  const getTransactionStatus = (transaction: SupplierTransaction): "completed" | "pending" => {
    return transaction.credit > 0 ? "completed" : "pending";
  };

  const getTransactionType = (transaction: SupplierTransaction): "payment" | "purchase" => {
    return transaction.credit > 0 ? "payment" : "purchase";
  };

  const getStatusBadge = (transaction: SupplierTransaction) => {
    const status = getTransactionStatus(transaction);
    const statusConfig = {
      completed: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle, label: "Completed" },
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", icon: Clock, label: "Pending" },
    };
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getTransactionTypeBadge = (transaction: SupplierTransaction) => {
    const type = getTransactionType(transaction);
    const typeConfig = {
      payment: { bg: "bg-blue-100", text: "text-blue-800", label: "Payment" },
      purchase: { bg: "bg-purple-100", text: "text-purple-800", label: "Purchase" },
    };
    const config = typeConfig[type];
    return (
      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3D4C63] mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading transactions...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No transactions found</p>
        {onRefresh && (
          <button 
            onClick={onRefresh} 
            className="mt-4 flex items-center gap-2 px-4 py-2 text-sm bg-[#E8EBF0] hover:bg-[#D8DCE3] rounded-lg transition-colors mx-auto"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b bg-gray-50">
        <h2 className="font-semibold text-[#171D26] text-lg">Supplier Transactions</h2>
        {onRefresh && (
          <button 
            onClick={onRefresh} 
            className="flex items-center gap-2 text-sm px-3 py-1.5 bg-[#E8EBF0] hover:bg-[#D8DCE3] rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item(s)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedTransactions.map((transaction) => {
              const itemDetails = getItemDetails(transaction);
              const totalQuantity = itemDetails.reduce((sum, item) => sum + (item.quantity || 0), 0);
              const itemNames = getItemNames(transaction);

              return (
                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{transaction.reference_no || "N/A"}</div>
                      {transaction.notes && (
                        <div className="text-xs text-gray-500 mt-1 line-clamp-1">{transaction.notes}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(transaction.transaction_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="relative group">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span>{itemNames}</span>
                        {totalQuantity > 0 && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            Qty: {totalQuantity}
                          </span>
                        )}
                      </div>
                      {/* Tooltip showing all items on hover */}
                      {itemDetails.length > 1 && (
                        <div className="absolute left-0 top-full mt-2 hidden group-hover:block z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[250px]">
                          <div className="text-xs font-semibold text-gray-700 mb-2">All Items:</div>
                          {itemDetails.map((item, idx) => (
                            <div key={idx} className="text-xs text-gray-600 py-1 flex justify-between">
                              <span>{item.itemName}</span>
                              <span className="text-gray-500">Qty: {item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">{getTransactionTypeBadge(transaction)}</td>
                  <td className="px-6 py-4">{getStatusBadge(transaction)}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right whitespace-nowrap">
                    ₦{(transaction.credit || transaction.debit).toLocaleString(undefined, { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center justify-center">
                      <button 
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setSelectedItemDetails(itemDetails);
                        }}
                        className="flex items-center gap-2 transition-colors font-medium text-sm hover:text-blue-900"
                        title="View invoice details"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, transactions.length)} of {transactions.length} transactions
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        </div>
      )}
      
      {/* Invoice Modal */}
      {selectedTransaction && (
        <TransactionInvoiceModal
          transaction={selectedTransaction}
          supplierName={getSupplierName(selectedTransaction.supplier_id)}
          itemDetails={selectedItemDetails}
          onClose={() => {
            setSelectedTransaction(null);
            setSelectedItemDetails([]);
          }}
        />
      )}
    </div>
  );
}