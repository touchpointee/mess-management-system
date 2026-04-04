"use client";

import { useState, useEffect, useCallback } from "react";
import { CustomerTable } from "@/components/admin/CustomerTable";
import { AddCustomerModal } from "./AddCustomerModal";

type CustomerRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  startDate: string | null;
  daysActive: number;
  balanceDue: number;
  dueAmount: number;
  advanceAmount: number;
};

export default function CustomersClient() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const fetchCustomers = useCallback(() => {
    fetch("/api/admin/customers", { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load customers");
        return r.json();
      })
      .then(setCustomers)
      .catch(() => {
        // ignore
      });
  }, []);

  useEffect(() => {
    fetchCustomers();

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") fetchCustomers();
    }, 5000);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") fetchCustomers();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [fetchCustomers]);

  const onAdded = () => {
    setModalOpen(false);
    fetchCustomers();
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-title">Mess</h1>
          <p className="admin-subtitle">Customers management, billing start dates, and balances.</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="admin-btn-primary w-full sm:w-auto"
        >
          Add Customer
        </button>
      </header>

      <div className="mt-6">
        <h2 className="admin-section-title">Customers</h2>
      </div>

      <CustomerTable customers={customers} search={search} onSearchChange={setSearch} />

      <AddCustomerModal open={modalOpen} onClose={() => setModalOpen(false)} onAdded={onAdded} />
    </div>
  );
}

