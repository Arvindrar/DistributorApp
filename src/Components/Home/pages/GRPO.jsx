import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GRPO.css"; // Import the new CSS for GRPO

function GRPO() {
  const navigate = useNavigate();
  const [grpoNumberSearch, setGrpoNumberSearch] = useState(""); // For GRPO Number input
  const [vendorNameSearch, setVendorNameSearch] = useState(""); // For Vendor Name input
  const [poNumberSearch, setPoNumberSearch] = useState(""); // For original PO Number input

  // Sample data - replace with actual data fetching
  const [grpoList, setGrpoList] = useState([
    {
      id: 1,
      grpoNumber: "GRPO2025-001",

      vendorCode: "VEND-001",
      vendorName: "Tech Solutions Inc.",
      grpoDate: "2025-01-18",
      grpoTotal: 50,
      remarks: "Partial receipt against PO2024-001.",
    },
    {
      id: 2,
      grpoNumber: "GRPO2025-002",

      vendorCode: "VEND-002",
      vendorName: "Global Office Supplies",
      grpoDate: "2025-01-30",
      grpoTotal: 100,
      remarks: "Full receipt. All items checked.",
    },
    {
      id: 3,
      grpoNumber: "GRPO2025-003",

      vendorCode: "VEND-001",
      vendorName: "Tech Solutions Inc.",
      grpoDate: "2025-04-20",
      grpoTotal: 10,
      remarks: "Received items for new PO.",
    },
    {
      id: 4,
      grpoNumber: "GRPO2025-004",

      vendorCode: "VEND-005",
      vendorName: "Parts and More",
      grpoDate: "2025-02-20",
      grpoTotal: 25,
      remarks: "Urgent items received.",
    },
  ]);

  const handleGrpoNumberSearchChange = (event) => {
    setGrpoNumberSearch(event.target.value);
  };

  const handleVendorNameSearchChange = (event) => {
    setVendorNameSearch(event.target.value);
  };

  const handlePoNumberSearchChange = (event) => {
    setPoNumberSearch(event.target.value);
  };

  const handleAddGRPOClick = () => {
    console.log("Add GRPO button clicked");
    navigate("/grpo/add"); // Navigate to the "Add GRPO" page
  };

  // Filtering logic
  const filteredGrpoList = grpoList.filter((grpo) => {
    const grpoSearchTerm = grpoNumberSearch.trim().toLowerCase();
    const vendorSearchTerm = vendorNameSearch.trim().toLowerCase();
    const poSearchTerm = poNumberSearch.trim().toLowerCase();

    const grpoNumberMatch = grpoSearchTerm
      ? grpo.grpoNumber.toLowerCase().includes(grpoSearchTerm)
      : true;

    const vendorNameMatch = vendorSearchTerm
      ? grpo.vendorName.toLowerCase().includes(vendorSearchTerm)
      : true;

    const poNumberMatch = poSearchTerm
      ? grpo.poNumber.toLowerCase().includes(poSearchTerm)
      : true;

    return grpoNumberMatch && vendorNameMatch && poNumberMatch;
  });

  return (
    <div className="grpo-overview__page-content">
      {" "}
      {/* Prefixed class */}
      <h1>Goods Receipt PO (GRPO) Overview</h1>
      <div className="grpo-overview__filter-controls">
        {" "}
        {/* Prefixed class */}
        <div className="grpo-overview__filter-item">
          {" "}
          {/* Prefixed class */}
          <label htmlFor="grpoSearch" className="grpo-overview__filter-label">
            {" "}
            {/* Prefixed class */}
            GRPO Number :
          </label>
          <input
            type="text"
            id="grpoSearch"
            name="grpoSearch"
            className="grpo-overview__filter-input" /* Prefixed class */
            value={grpoNumberSearch}
            onChange={handleGrpoNumberSearchChange}
            placeholder="Search by GRPO Number..."
          />
        </div>
        <div className="grpo-overview__filter-item">
          {" "}
          {/* Prefixed class */}
          <label
            htmlFor="vendorNameSearch"
            className="grpo-overview__filter-label" /* Prefixed class */
          >
            Vendor Name :
          </label>
          <input
            type="text"
            id="vendorNameSearch"
            name="vendorNameSearch"
            className="grpo-overview__filter-input" /* Prefixed class */
            value={vendorNameSearch}
            onChange={handleVendorNameSearchChange}
            placeholder="Search by Vendor Name..."
          />
        </div>
        <div className="grpo-overview__add-action-group">
          {" "}
          {/* Prefixed class */}
          <span className="grpo-overview__add-label">Create</span>{" "}
          {/* Prefixed class */}
          <button
            className="grpo-overview__add-button" /* Prefixed class */
            onClick={handleAddGRPOClick}
            title="Add New GRPO"
          >
            +
          </button>
        </div>
      </div>
      <div className="grpo-overview__table-container">
        {" "}
        {/* Prefixed class */}
        <table className="grpo-overview__data-table">
          {" "}
          {/* Prefixed class */}
          <thead>
            <tr>
              <th>GRPO Number</th>
              <th>GRPO Date</th>
              <th>Vendor Code</th>
              <th>Vendor Name</th>
              <th>GRPO Total</th> {/* Example specific to GRPO */}
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {filteredGrpoList.length > 0 ? (
              filteredGrpoList.map((grpo) => (
                <tr key={grpo.id}>
                  <td>{grpo.grpoNumber}</td>
                  <td>{grpo.grpoDate}</td>

                  <td>{grpo.vendorCode}</td>
                  <td>{grpo.vendorName}</td>
                  <td>{grpo.grpoTotal}</td>
                  <td>{grpo.remarks}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="grpo-overview__no-data-cell">
                  {" "}
                  {/* Prefixed class, updated colSpan */}
                  No GRPOs match your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GRPO;
