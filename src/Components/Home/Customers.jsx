import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Customers.css";

const API_BASE_URL = "https://localhost:7074/api";

function Customers() {
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [customerGroupOptions, setCustomerGroupOptions] = useState([]);

  // isLoading is specifically for the customer list fetching
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [error, setError] = useState(null);

  const searchTimeout = useRef(null);

  const fetchCustomerGroups = useCallback(async () => {
    setIsLoadingGroups(true);
    //setError(null); // Clear group-specific error if you had one
    try {
      const response = await fetch(`${API_BASE_URL}/CustomerGroup`);
      if (!response.ok) {
        throw new Error(
          `HTTP error fetching groups! status: ${response.status}`
        );
      }
      const data = await response.json();
      const options = data.map((group) => ({
        value: group.name,
        label: group.name,
      }));
      setCustomerGroupOptions(options);
    } catch (e) {
      console.error("Failed to fetch customer groups:", e);
      // Set error state if group fetching fails and it's critical
      // setError("Failed to load customer groups. Filtering by group may not work.");
      setCustomerGroupOptions([]);
    } finally {
      setIsLoadingGroups(false);
    }
  }, []);

  const fetchCustomers = useCallback(async (group, search) => {
    setIsLoading(true); // Indicates customer list is loading/re-loading
    setError(null); // Clear previous customer fetch errors
    let url = `${API_BASE_URL}/Customer?`;
    const params = new URLSearchParams();
    if (group) params.append("group", group);
    if (search) params.append("searchTerm", search);
    url += params.toString();

    try {
      const response = await fetch(url);
      if (!response.ok) {
        let errorMessage = `HTTP error fetching customers! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (
            errorData?.message ||
            errorData?.title ||
            typeof errorData === "string"
          ) {
            errorMessage = errorData.message || errorData.title || errorData;
          }
        } catch {}
        throw new Error(errorMessage);
      }
      const data = await response.json();
      setCustomers(data);
    } catch (e) {
      console.error("Failed to fetch customers:", e);
      setError(
        e.message || "Failed to load customers. Please try again later."
      );
      setCustomers([]); // Clear customers on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomerGroups();
  }, [fetchCustomerGroups]);

  useEffect(() => {
    // This effect will also trigger an initial fetch when the component mounts
    // as selectedGroup and searchTerm are initially ""
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchCustomers(selectedGroup, searchTerm);
    }, 400); // Debounce time
    return () => clearTimeout(searchTimeout.current);
  }, [searchTerm, selectedGroup, fetchCustomers]);

  const handleGroupChange = (event) => {
    setSelectedGroup(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAddClick = () => {
    navigate("/customers/add");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  const handleCustomerCodeClick = (e, customerId) => {
    e.preventDefault();
    console.log(`Customer: ${customerId}`);
    navigate(`/customers/update/${customerId}`); // Ensure this route is correct
  };

  const getDisplayAddress = (customer) => {
    const parts = [
      customer.address1,
      customer.address2,
      customer.street,
      customer.city,
      customer.state,
      customer.postBox,
      customer.country,
    ];
    return parts.filter(Boolean).join(", ");
  };

  // Render the main page structure.
  // Conditional rendering will happen for the table area.
  return (
    <div className="page-content">
      <h1>Customer Master Data</h1>
      <div className="filter-controls-container-inline">
        <div className="filter-item-inline">
          <span className="filter-label-inline">Customer Group:</span>
          <select
            name="customerGroup"
            className="filter-select-inline"
            value={selectedGroup}
            onChange={handleGroupChange}
            disabled={isLoadingGroups} // Disable select while groups are loading
          >
            <option value="">
              {isLoadingGroups ? "Loading groups..." : "All Groups"}
            </option>
            {!isLoadingGroups &&
              customerGroupOptions.map((option) => (
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
            placeholder="Enter name or code..."
            value={searchTerm}
            onChange={handleSearchChange}
            autoComplete="off"
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

      {/* Table Area: Handles its own loading and error states */}
      {error && (
        <div
          className="error-message"
          style={{ color: "red", marginTop: "20px" }}
        >
          Error: {error}
        </div>
      )}

      {!error &&
        isLoading && ( // Show loading indicator for the table if customers are being fetched
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            Loading customer data...
          </div>
        )}

      {!error &&
        !isLoading && ( // Display table or "no data" message
          <div className="table-responsive-container">
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
                {customers.length > 0 ? (
                  customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <a
                          href="#"
                          onClick={(e) =>
                            handleCustomerCodeClick(e, customer.id)
                          }
                          className="table-data-link"
                          title="Click to update customer"
                        >
                          {customer.code}
                        </a>
                      </td>
                      <td>{customer.name}</td>
                      <td>{getDisplayAddress(customer)}</td>
                      <td>{customer.route || "N/A"}</td>
                      <td>{customer.employee || "N/A"}</td>
                      <td>{formatCurrency(customer.balance)}</td>
                      <td>{customer.remarks || "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-data-cell">
                      No customers found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}

export default Customers;
