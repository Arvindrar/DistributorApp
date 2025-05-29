import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Sales.css"; // Import the new CSS for Sales

function Sales() {
  const navigate = useNavigate();
  const [salesOrderSearch, setSalesOrderSearch] = useState(""); // For SO Number input
  const [customerNameSearch, setCustomerNameSearch] = useState(""); // For Customer Name input

  // Sample data - replace with actual data fetching
  const [salesOrders, setSalesOrders] = useState([
    {
      id: 1,
      customerCode: "CUST-001",
      customerName: "Alpha Retailers",
      soNumber: "SO2024-101",
      date: "2025-01-20",
      orderTotal: 7500.75,
      remarks: "Awaiting payment.",
    },
    {
      id: 2,
      customerCode: "CUST-002",
      customerName: "Beta Goods Co.",
      soNumber: "SO2024-102",
      date: "2025-02-05",
      orderTotal: 15200.0,
      remarks: "Shipped.",
    },
    {
      id: 3,
      customerCode: "CUST-003",
      customerName: "Gamma Services",
      soNumber: "SO2024-103",
      date: "2025-02-28",
      orderTotal: 350.0,
      remarks: "Delivered and paid.",
    },
    {
      id: 4,
      customerCode: "CUST-001", // Same customer, different SO
      customerName: "Alpha Retailers",
      soNumber: "SO2024-104",
      orderTotal: 1200.0,
      date: "2025-03-10",
      remarks: "Processing.",
    },
    {
      id: 5,
      customerCode: "CUST-004",
      customerName: "Delta Supplies",
      soNumber: "SO2024-105",
      orderTotal: 980.5,
      date: "2025-04-01",
      remarks: "New customer order.",
    },
  ]);

  const handleSalesOrderSearchChange = (event) => {
    setSalesOrderSearch(event.target.value);
  };

  const handleCustomerNameSearchChange = (event) => {
    setCustomerNameSearch(event.target.value);
  };

  const handleAddSalesOrderClick = () => {
    console.log("Add Sales Order button clicked");
    navigate("/salesorder/add"); // Navigate to the "Add Sales Order" page
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const filteredSalesOrders = salesOrders.filter((so) => {
    const soSearchTerm = salesOrderSearch.trim().toLowerCase();
    const customerSearchTerm = customerNameSearch.trim().toLowerCase();

    const soNumberMatch = soSearchTerm
      ? so.soNumber.toLowerCase().includes(soSearchTerm)
      : true;

    const customerNameMatch = customerSearchTerm
      ? so.customerName.toLowerCase().includes(customerSearchTerm)
      : true;

    return soNumberMatch && customerNameMatch;
  });

  return (
    <div className="so-overview__page-content">
      {" "}
      {/* Prefixed class */}
      <h1>Sales Order Overview</h1>
      <div className="so-overview__filter-controls">
        {" "}
        {/* Prefixed class */}
        <div className="so-overview__filter-item">
          {" "}
          {/* Prefixed class */}
          <label htmlFor="soSearch" className="so-overview__filter-label">
            {" "}
            {/* Prefixed class */}
            Sales Order :
          </label>
          <input
            type="text"
            id="soSearch"
            name="soSearch"
            className="so-overview__filter-input" /* Prefixed class */
            value={salesOrderSearch}
            onChange={handleSalesOrderSearchChange}
            placeholder="Search by SO Number..."
          />
        </div>
        <div className="so-overview__filter-item">
          {" "}
          {/* Prefixed class */}
          <label
            htmlFor="customerNameSearch"
            className="so-overview__filter-label" /* Prefixed class */
          >
            Customer Name :
          </label>
          <input
            type="text"
            id="customerNameSearch"
            name="customerNameSearch"
            className="so-overview__filter-input" /* Prefixed class */
            value={customerNameSearch}
            onChange={handleCustomerNameSearchChange}
            placeholder="Search by Customer Name..."
          />
        </div>
        <div className="so-overview__add-action-group">
          {" "}
          {/* Prefixed class */}
          <span className="so-overview__add-label">Create</span>{" "}
          {/* Prefixed class */}
          <button
            className="so-overview__add-button" /* Prefixed class */
            onClick={handleAddSalesOrderClick}
            title="Add New Sales Order"
          >
            +
          </button>
        </div>
      </div>
      <div className="so-overview__table-container">
        {" "}
        {/* Prefixed class */}
        <table className="so-overview__data-table">
          {" "}
          {/* Prefixed class */}
          <thead>
            <tr>
              <th>S.O Number</th>
              <th>S.O Date</th>
              <th>Customer Code</th>
              <th>Customer Name</th>
              <th>S.O Total</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {filteredSalesOrders.length > 0 ? (
              filteredSalesOrders.map((so) => (
                <tr key={so.id}>
                  <td>{so.soNumber}</td>
                  <td>{so.date}</td>
                  <td>{so.customerCode}</td>
                  <td>{so.customerName}</td>
                  <td>{formatCurrency(so.orderTotal)}</td>
                  <td>{so.remarks}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="so-overview__no-data-cell">
                  {" "}
                  {/* Prefixed class, updated colSpan */}
                  No sales orders match your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Sales;
