import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddCustomers.css";

// Icons
const DropdownArrowIcon = ({ color = "#333" }) => (
  <svg
    width="10"
    height="6"
    viewBox="0 0 10 6"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ marginLeft: "5px" }}
  >
    <path
      d="M1 1L5 5L9 1"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Up arrow for tab expander
const UpArrowIcon = () => (
  <svg
    width="12"
    height="8"
    viewBox="0 0 12 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11 7L6 2L1 7"
      stroke="#6c757d"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function AddCustomers() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Fields for the new header section from the image
    headerCustomerCode: "",
    headerName: "",
    headerCustomerGroup: "",
    headerAccountBalance: "",
    headerRoute: "",
    headerSales: "",
    headerRemarks: "",

    contactNumber: "",
    mailId: "",
    shippingType: "Own Vehicle",

    // Fields for the "Addresses" tab
    address1: "",
    address2: "",
    street: "",
    postBox: "",
    city: "",
    state: "",
    country: "",
    gstin: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log("Saving new customer:", formData);
    // navigate('/customers'); // Example navigation
  };

  const handleCancel = () => {
    navigate("/customers"); // Example navigation
  };

  return (
    <div className="detail-page-container">
      {/* Top Header Bar */}
      <div className="detail-page-header-bar">
        <h1 className="detail-page-main-title">New Customer</h1>
        <div className="detail-header-actions"></div>
      </div>

      {/* New Customer Info Header (replaces detail-page-info-bar) */}
      <div className="customer-info-header">
        <div className="customer-info-column">
          <div className="customer-info-field">
            <label htmlFor="headerCustomerCode">Customer Code :</label>
            <input
              type="text"
              id="headerCustomerCode"
              name="headerCustomerCode"
              className="form-input-styled"
              value={formData.headerCustomerCode}
              onChange={handleInputChange}
            />
          </div>
          <div className="customer-info-field">
            <label htmlFor="headerName">Name :</label>
            <input
              type="text"
              id="headerName"
              name="headerName"
              className="form-input-styled"
              value={formData.headerName}
              onChange={handleInputChange}
            />
          </div>
          <div className="customer-info-field">
            <label htmlFor="headerCustomerGroup">Customer group :</label>
            <input
              type="text"
              id="headerCustomerGroup"
              name="headerCustomerGroup"
              className="form-input-styled"
              value={formData.headerCustomerGroup}
              onChange={handleInputChange}
            />
          </div>
          <div className="customer-info-field">
            <label htmlFor="contactNumber">Contact Number :</label>
            <input
              type="text"
              id="contactNumber"
              name="contactNumber"
              className="form-input-styled"
              value={formData.contactNumber}
              onChange={handleInputChange}
            />
          </div>
          <div className="customer-info-field">
            <label htmlFor="mailId">Mail ID :</label>
            <input
              type="text"
              id="mailId"
              name="mailId"
              className="form-input-styled"
              value={formData.mailId}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="customer-info-column">
          <div className="customer-info-field">
            <label htmlFor="shippingType">Shipping Type :</label>
            <select
              id="shippingType"
              name="shippingType"
              className="form-input-styled" // You might want a different class for select styling
              value={formData.shippingType}
              onChange={handleInputChange}
            >
              {/* Optional: Add a default, unselectable, or placeholder option */}

              <option value="own_vehicle">Own Vehicle</option>
              <option value="cargo">Cargo</option>
              <option value="courier_service">Courier Service</option>
            </select>
          </div>
          <div className="customer-info-field">
            <label htmlFor="headerRoute">Route :</label>
            <input
              type="text"
              id="headerRoute"
              name="headerRoute"
              className="form-input-styled"
              value={formData.headerRoute}
              onChange={handleInputChange}
            />
          </div>
          <div className="customer-info-field">
            <label htmlFor="headerSales">Sales Employee :</label>
            <input
              type="text"
              id="headerSales"
              name="headerSales"
              className="form-input-styled"
              value={formData.headerSales}
              onChange={handleInputChange}
            />
          </div>
          <div className="customer-info-field">
            <label htmlFor="headerAccountBalance">Account Balance :</label>
            <input
              type="text"
              id="headerAccountBalance"
              name="headerAccountBalance"
              className="form-input-styled"
              value={formData.headerAccountBalance}
              onChange={handleInputChange}
            />
          </div>
          <div className="customer-info-field">
            <label htmlFor="headerRemarks">Remarks :</label>
            <input
              type="text"
              id="headerRemarks"
              name="headerRemarks"
              className="form-input-styled"
              value={formData.headerRemarks}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}

      {/* Form Content Area */}
      <div className="detail-form-content-area">
        <div className="addresses-tab-content">
          <section className="form-section-card">
            <h3 className="form-section-title">Address Information</h3>
            <div className="form-field-group form-field-group-inline">
              <label htmlFor="address1">Address 1 :</label>
              <input
                type="text"
                id="address1"
                name="address1"
                className="form-input-styled"
                value={formData.address1}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-field-group form-field-group-inline">
              <label htmlFor="address2">Address 2 :</label>
              <input
                type="text"
                id="address2"
                name="address2"
                className="form-input-styled"
                value={formData.address2}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-field-group form-field-group-inline">
              <label htmlFor="street">Street :</label>
              <input
                type="text"
                id="street"
                name="street"
                className="form-input-styled"
                value={formData.street}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-field-group form-field-group-inline">
              <label htmlFor="postBox">Post Box :</label>
              <input
                type="text"
                id="postBox"
                name="postBox"
                className="form-input-styled"
                value={formData.postBox}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-field-group form-field-group-inline">
              <label htmlFor="city">City :</label>
              <input
                type="text"
                id="city"
                name="city"
                className="form-input-styled"
                value={formData.city}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-field-group form-field-group-inline">
              <label htmlFor="state">State :</label>
              <input
                type="text"
                id="state"
                name="state"
                className="form-input-styled"
                value={formData.state}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-field-group form-field-group-inline">
              <label htmlFor="country">Country :</label>
              <input
                type="text"
                id="country"
                name="country"
                className="form-input-styled"
                value={formData.country}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-field-group form-field-group-inline">
              <label htmlFor="gstin">GSTIN :</label>
              <input
                type="text"
                id="gstin"
                name="gstin"
                className="form-input-styled"
                value={formData.gstin}
                onChange={handleInputChange}
              />
            </div>
          </section>
        </div>
      </div>

      {/* Page Footer Actions (Sticky) */}
      <div className="detail-page-footer">
        <div className="footer-actions-main">
          <button className="footer-btn primary" onClick={handleSave}>
            Add Customer
          </button>
        </div>
        <button className="footer-btn primary" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default AddCustomers;
