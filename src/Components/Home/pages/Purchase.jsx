import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../config"; // Make sure this path is correct
import "./Purchase.css";

// A custom hook to debounce input changes. This prevents API calls on every keystroke.
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value changes before the delay has passed
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

function Purchase() {
  const navigate = useNavigate();

  // State for the search inputs
  const [purchaseOrderSearch, setPurchaseOrderSearch] = useState("");
  const [vendorNameSearch, setVendorNameSearch] = useState("");

  // Debounce the search terms to optimize API calls
  const debouncedPoSearch = useDebounce(purchaseOrderSearch, 500); // 500ms delay
  const debouncedVendorSearch = useDebounce(vendorNameSearch, 500);

  // State to hold the data from the API
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Data Fetching Logic ---
  const fetchPurchaseOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Build query parameters based on debounced search terms
    const params = new URLSearchParams();
    if (debouncedPoSearch) {
      params.append("purchaseOrderNo", debouncedPoSearch);
    }
    if (debouncedVendorSearch) {
      params.append("vendorName", debouncedVendorSearch);
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/PurchaseOrders?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setPurchaseOrders(data);
    } catch (e) {
      console.error("Failed to fetch purchase orders:", e);
      setError("Failed to load data. Please try again.");
      setPurchaseOrders([]); // Clear data on error
    } finally {
      setIsLoading(false);
    }
  }, [debouncedPoSearch, debouncedVendorSearch]); // Effect depends on debounced values

  // useEffect to trigger the data fetch when the component mounts or search terms change
  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  // --- Handlers ---
  const handleAddPurchaseOrderClick = () => {
    navigate("/purchaseorder/add");
  };

  const handlePurchaseOrderNumberLinkClick = (e, poId) => {
    e.preventDefault(); // Prevent full page reload
    navigate(`/purchaseorder/update/${poId}`); // Navigate to the edit page
  };

  // --- Helper Functions ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB"); // Format as DD/MM/YYYY
  };

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
            className="po-overview__filter-input"
            value={purchaseOrderSearch}
            onChange={(e) => setPurchaseOrderSearch(e.target.value)}
            placeholder="Search by PO Number..."
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
            className="po-overview__filter-input"
            value={vendorNameSearch}
            onChange={(e) => setVendorNameSearch(e.target.value)}
            placeholder="Search by Vendor Name..."
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
            {isLoading ? (
              <tr>
                <td colSpan="6" className="po-overview__no-data-cell">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="6" className="po-overview__error-cell">
                  {error}
                </td>
              </tr>
            ) : purchaseOrders.length > 0 ? (
              purchaseOrders.map((po) => (
                <tr key={po.id}>
                  <td>
                    <a
                      href={`/purchaseorder/update/${po.id}`}
                      onClick={(e) =>
                        handlePurchaseOrderNumberLinkClick(e, po.id)
                      }
                      className="po-overview__table-data-link"
                      title={`Edit details for P.O. ${po.purchaseOrderNo}`}
                    >
                      {po.purchaseOrderNo}
                    </a>
                  </td>

                  <td>{formatDate(po.poDate)}</td>
                  <td>{po.vendorCode}</td>
                  <td>{po.vendorName}</td>
                  <td>{formatCurrency(po.orderTotal)}</td>
                  <td>{po.purchaseRemarks}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="po-overview__no-data-cell">
                  No purchase orders found.
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
