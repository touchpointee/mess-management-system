"use client";

import { useState, useEffect } from "react";
import { CustomerTable } from "@/components/admin/CustomerTable";
import { AddCustomerModal } from "./AddCustomerModal";

type CustomerRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  planFee: number | null;
  startDate: string | null;
  daysActive: number;
  balanceDue: number;
  dueAmount: number;
  advanceAmount: number;
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then(setCustomers);
  }, []);

  const onAdded = () => {
    setModalOpen(false);
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then(setCustomers);
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-title">Customers</h1>
          <p className="admin-subtitle">Manage customer profiles, plans, and balances.</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="admin-btn-primary w-full sm:w-auto"
        >
          Add Customer
        </button>
      </header>
      <CustomerTable
        customers={customers}
        search={search}
        onSearchChange={setSearch}
      />
      <AddCustomerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdded={onAdded}
      />
    </div>
  );
}
