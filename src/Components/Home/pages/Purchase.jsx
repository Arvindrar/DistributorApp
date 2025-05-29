// src/components/Home/pages/Purchase.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Purchase.css"; // Import the CSS for this component

function Purchase() {
  const navigate = useNavigate();
  const [purchaseOrderSearch, setPurchaseOrderSearch] = useState(""); // For PO Number input
  const [vendorNameSearch, setVendorNameSearch] = useState(""); // For Vendor Name input

  // Sample data - replace with actual data fetching in a real application
  const [purchaseOrders, setPurchaseOrders] = useState([
    {
      id: 1,
      vendorCode: "VEND-001",
      vendorName: "Tech Solutions Inc.",
      poNumber: "PO2024-001",
      date: "2025-01-15",
      accountBalance: 12500.5,
      remarks: "Partial shipment received.",
    },
    {
      id: 2,
      vendorCode: "VEND-002",
      vendorName: "Global Office Supplies",
      poNumber: "PO2024-002",
      date: "2025-01-25",
      accountBalance: 8700.0,
      remarks: "Awaiting confirmation.",
    },
    {
      id: 3,
      vendorCode: "VEND-003",
      vendorName: "Creative Designs Ltd.",
      poNumber: "PO2024-003",
      date: "2025-02-15",
      accountBalance: 0.0,
      remarks: "Order fully paid.",
    },
    {
      id: 4,
      vendorCode: "VEND-004",
      vendorName: "Industrial Parts Co.",
      poNumber: "PO2024-004",
      accountBalance: 22350.75,
      date: "2025-03-18",
      remarks: "Backordered items.",
    },
    // Add more sample data to test filtering effectively
    {
      id: 5,
      vendorCode: "VEND-001", // Same vendor, different PO
      vendorName: "Tech Solutions Inc.",
      poNumber: "PO2024-005",
      accountBalance: 500.0,
      date: "2025-04-15",
      remarks: "New order.",
    },
    {
      id: 6,
      vendorCode: "VEND-005",
      vendorName: "Parts and More",
      poNumber: "PO2024-006",
      accountBalance: 1200.0,
      date: "2025-02-15",
      remarks: "Urgent.",
    },
  ]);

  // Handler for the "Purchase Order" search input
  const handlePurchaseOrderSearchChange = (event) => {
    setPurchaseOrderSearch(event.target.value);
  };

  // Handler for the "Vendor Name" search input
  const handleVendorNameSearchChange = (event) => {
    setVendorNameSearch(event.target.value);
  };

  const handleAddPurchaseOrderClick = () => {
    console.log("Add Purchase Order button clicked");
    navigate("/purchaseorder/add");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // --- THIS IS THE CORE SEARCH FILTERING LOGIC ---
  const filteredPurchaseOrders = purchaseOrders.filter((po) => {
    // Trim search terms and convert to lowercase for case-insensitive matching
    const poSearchTerm = purchaseOrderSearch.trim().toLowerCase();
    const vendorSearchTerm = vendorNameSearch.trim().toLowerCase();

    // Check if PO Number matches
    const poNumberMatch = poSearchTerm
      ? po.poNumber.toLowerCase().includes(poSearchTerm)
      : true; // If PO search is empty, this condition is true

    // Check if Vendor Name matches
    const vendorNameMatch = vendorSearchTerm
      ? po.vendorName.toLowerCase().includes(vendorSearchTerm)
      : true; // If Vendor Name search is empty, this condition is true

    // You could also add Vendor Code to the vendor search if desired:
    // const vendorNameOrCodeMatch = vendorSearchTerm
    //   ? po.vendorName.toLowerCase().includes(vendorSearchTerm) ||
    //     po.vendorCode.toLowerCase().includes(vendorSearchTerm)
    //   : true;

    // Return true only if BOTH conditions are met
    return poNumberMatch && vendorNameMatch;
    // If using combined vendor name/code search:
    // return poNumberMatch && vendorNameOrCodeMatch;
  });

  return (
    <div className="po-overview__page-content">
      <h1>Purchase Order Overview</h1>

      <div className="po-overview__filter-controls">
        <div className="po-overview__filter-item">
          <label htmlFor="poSearch" className="po-overview__filter-label">
            Purchase Order :
          </label>
          <input
            type="text"
            id="poSearch"
            name="poSearch"
            className="po-overview__filter-input"
            value={purchaseOrderSearch}
            onChange={handlePurchaseOrderSearchChange} // Correctly updates state
            placeholder="Search by PO Number..." // Added placeholder
          />
        </div>

        <div className="po-overview__filter-item">
          <label
            htmlFor="vendorNameSearch"
            className="po-overview__filter-label"
          >
            Vendor Name :
          </label>
          <input
            type="text"
            id="vendorNameSearch"
            name="vendorNameSearch"
            className="po-overview__filter-input"
            value={vendorNameSearch}
            onChange={handleVendorNameSearchChange} // Correctly updates state
            placeholder="Search by Vendor Name..." // Added placeholder
          />
        </div>

        <div className="po-overview__add-action-group">
          <span className="po-overview__add-label">Create</span>
          <button
            className="po-overview__add-button"
            onClick={handleAddPurchaseOrderClick}
            title="Add New Purchase Order"
          >
            +
          </button>
        </div>
      </div>

      <div className="po-overview__table-container">
        <table className="po-overview__data-table">
          <thead>
            <tr>
              <th>P.O Number</th>
              <th>P.O Date</th>
              <th>Vendor Code</th>
              <th>Vendor Name</th>
              <th>P.O Total</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchaseOrders.length > 0 ? (
              filteredPurchaseOrders.map(
                (
                  po // Renders the filtered list
                ) => (
                  <tr key={po.id}>
                    <td>{po.poNumber}</td>
                    <td>{po.date}</td>
                    <td>{po.vendorCode}</td>
                    <td>{po.vendorName}</td>
                    <td>{formatCurrency(po.accountBalance)}</td>
                    <td>{po.remarks}</td>
                  </tr>
                )
              )
            ) : (
              <tr>
                <td colSpan="5" className="po-overview__no-data-cell">
                  No purchase orders match your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Purchase;
