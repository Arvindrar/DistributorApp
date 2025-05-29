// src/components/Home/Customers.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./Customers.css";

function Customers() {
  const navigate = useNavigate(); // Initialize useNavigate
  const [selectedGroup, setSelectedGroup] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [customers, setCustomers] = useState([
    // ... your customer data
    {
      id: 1,
      code: "CUST-001",
      name: "Acme Corp",
      group: "Wholesale",

      address: "123 Tech Road, Silicon Valley, CA",
      route: "Route-2NH3",
      employee: "Harsh Gowda",
      balance: 15025.5,
      remarks: "Primary Technology Supplier",
    },
    {
      id: 2,
      code: "CUST-002",
      name: "Beta Solutions",
      group: "Retail",

      address: "456 Code Lane, Austin, TX",
      route: "Route-2N4H",
      employee: "Adharsh kumar",
      balance: 8750.0,
      remarks: "Software Development Partner",
    },
    {
      id: 3,
      code: "CUST-003",
      name: "Gianna Corp",
      group: "Wholesale",

      address: " Tech Road, Silicon Valley, NY",
      route: "Route-NH36",
      employee: "kashish Gowda",
      balance: 1025.5,
      remarks: "property Supplier",
    },
    {
      id: 4,
      code: "CUST-004",
      name: "Davis Solutions",
      group: "Retail",

      address: "201 Code Lane, Austin, TX",
      route: "Route-KH63",
      employee: "Muthu kumar",
      balance: 870.0,
      remarks: "hardware Development Partner",
    },
  ]);

  const customerGroupOptions = [
    // ... your group options
    { value: "Wholesale", label: "Wholesale Clients" },
    { value: "Retail", label: "Retail Customers" },
  ];

  const handleGroupChange = (event) => {
    setSelectedGroup(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Updated Add Button Click Handler
  const handleAddClick = () => {
    console.log("Add button clicked, navigating to Add Customer page...");
    navigate("/customers/add"); // Navigate to the AddCustomers route
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleCustomerCodeClick = (e, customerCode, customerId) => {
    e.preventDefault();
    // Example: navigate to a detail page for a specific customer
    // navigate(`/customers/view/${customerId}`);
    console.log(`Customer Code clicked: ${customerCode}, ID: ${customerId}`);
  };

  const filteredCustomers = customers.filter((customer) => {
    const groupMatch = selectedGroup ? customer.group === selectedGroup : true;
    const searchMatch = searchTerm
      ? customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.code.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return groupMatch && searchMatch;
  });

  return (
    <div className="page-content">
      <h1>Customer Master Data</h1>
      <div className="filter-controls-container-inline">
        <div className="filter-item-inline">
          <span className="filter-label-inline">Customer group:</span>
          <select
            name="customerGroup"
            className="filter-select-inline"
            value={selectedGroup}
            onChange={handleGroupChange}
          >
            <option value="">All Groups</option>
            {customerGroupOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item-inline">
          <span className="filter-label-inline">Search:</span>
          <input
            type="text"
            name="customerSearch"
            className="filter-input-inline"
            placeholder="Enter search term..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="add-new-action-group">
          <span className="add-new-label">Add</span>
          <button
            className="add-new-plus-button"
            onClick={handleAddClick}
            title="Add New Customer"
          >
            +
          </button>
        </div>
      </div>
      <div className="table-responsive-container">
        {/* ... your table JSX ... */}
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer Code</th>
              <th>Name</th>

              <th>Address</th>
              <th>Route</th>
              <th>Sales Employee</th>
              <th>Account Balance</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <a
                      href={`#`} // Can be # if navigation is handled by onClick
                      onClick={(e) =>
                        handleCustomerCodeClick(e, customer.code, customer.id)
                      }
                      className="table-data-link"
                    >
                      {customer.code}
                    </a>
                  </td>
                  <td>{customer.name}</td>

                  <td>{customer.address}</td>
                  <td>{customer.route}</td>
                  <td>{customer.employee}</td>
                  <td>{formatCurrency(customer.balance)}</td>
                  <td>{customer.remarks}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data-cell">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Customers;
