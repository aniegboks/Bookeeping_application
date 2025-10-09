"use client";

import { useState } from "react";
import TransactionForm from "./form";
import DistributionForm from "./distrbution_form";
import { InventoryTransaction, CreateInventoryTransactionInput } from "@/lib/types/inventory_transactions";
import { CreateInventoryDistributionInput } from "@/lib/types/inventory_distribution";
import { InventoryItem } from "@/lib/types/inventory_item";
import { Supplier } from "@/lib/types/suppliers";
import { User } from "@/lib/types/user";
import { SchoolClass } from "@/lib/types/classes";
import { AcademicSession } from "@/lib/types/academic_session";

type FormType = "transaction" | "distribution" | null;

interface InventoryFormManagerProps {
  inventoryItems: InventoryItem[];
  suppliers: Supplier[];
  users: User[];
  classes: SchoolClass[];
  academicSessions: AcademicSession[];
  currentUser: User;
}

export default function InventoryFormManager({
  inventoryItems,
  suppliers,
  users,
  classes,
  academicSessions,
  currentUser,
}: InventoryFormManagerProps) {
  const [activeForm, setActiveForm] = useState<FormType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTransactionSubmit = async (data: CreateInventoryTransactionInput) => {
    setIsSubmitting(true);
    try {
      console.log("Transaction Submitted:", data);
      // Call API here
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
      setActiveForm(null);
    }
  };

  const handleDistributionSubmit = async (data: CreateInventoryDistributionInput) => {
    setIsSubmitting(true);
    try {
      console.log("Distribution Submitted:", data);
      // Call API here
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
      setActiveForm(null);
    }
  };

  return (
    <div>
      {/* Buttons to choose form */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveForm("transaction")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Transaction
        </button>
        <button
          onClick={() => setActiveForm("distribution")}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Distribution
        </button>
      </div>

      {/* Render active form */}
      {activeForm === "transaction" && (
        <TransactionForm
          onSubmit={handleTransactionSubmit}
          onCancel={() => setActiveForm(null)}
          isSubmitting={isSubmitting}
          inventoryItems={inventoryItems}
          suppliers={suppliers}
          users={users}
          currentUserId={currentUser.id}
        />
      )}

      {activeForm === "distribution" && (
        <DistributionForm
          onSubmit={handleDistributionSubmit}
          onCancel={() => setActiveForm(null)}
          isSubmitting={isSubmitting}
          inventoryItems={inventoryItems}
          classes={classes}
          academicSessions={academicSessions}
          users={users}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
