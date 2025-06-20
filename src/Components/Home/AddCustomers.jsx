import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./AddCustomers.css";

const API_BASE_URL = "https://localhost:7074/api";

const MessageModal = ({ message, onClose, type = "success" }) => {
  if (!message) return null;
  return (
    <div className="ac-modal-overlay">
      <div className={`ac-modal-content ${type}`}>
        <p>{message}</p>
        <button onClick={onClose} className="ac-modal-close-button">
          OK
        </button>
      </div>
    </div>
  );
};

function AddCustomers() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState(null);
  const [modalState, setModalState] = useState({
    message: "",
    type: "info",
    isActive: false,
  });

  const [customerGroupOptions, setCustomerGroupOptions] = useState([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [routeOptions, setRouteOptions] = useState([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(true);
  const [salesEmployeeOptions, setSalesEmployeeOptions] = useState([]);
  const [isLoadingSalesEmployees, setIsLoadingSalesEmployees] = useState(true);
  const [shippingTypeOptions, setShippingTypeOptions] = useState([]);
  const [isLoadingShippingTypes, setIsLoadingShippingTypes] = useState(true);

  const initialFormData = {
    code: "",
    name: "",
    group: "",
    balance: "",
    route: "",
    employee: "",
    remarks: "",
    contactNumber: "",
    mailId: "",
    shippingType: "",
    address1: "",
    address2: "",
    street: "",
    postBox: "",
    city: "",
    state: "",
    country: "",
    gstin: "",
  };
  const [formData, setFormData] = useState(initialFormData);

  const showModal = (message, type = "info") => {
    setModalState({ message, type, isActive: true });
  };

  const closeModal = () => {
    const wasSuccess =
      modalState.type === "success" &&
      modalState.message.includes("Successfully");
    setModalState({ message: "", type: "info", isActive: false });
    if (wasSuccess) {
      navigate("/customers", { state: { refreshCustomers: true } });
    }
  };

  const fetchOptions = useCallback(
    async (endpoint, setOptions, setLoading, resourceName) => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`);
        if (!response.ok) {
          throw new Error(
            `HTTP error fetching ${resourceName}! status: ${response.status}`
          );
        }
        const data = await response.json();
        setOptions(
          data.map((item) => ({ value: item.name, label: item.name }))
        );
      } catch (e) {
        console.error(`Failed to fetch ${resourceName}:`, e);
        showModal(
          `Failed to load ${resourceName}. Some dropdowns might not work.`,
          "error"
        );
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [] // Assuming showModal is stable
  );

  useEffect(() => {
    fetchOptions(
      "CustomerGroup",
      setCustomerGroupOptions,
      setIsLoadingGroups,
      "customer groups"
    );
    fetchOptions("Routes", setRouteOptions, setIsLoadingRoutes, "routes");
    fetchOptions(
      "SalesEmployee",
      setSalesEmployeeOptions,
      setIsLoadingSalesEmployees,
      "sales employees"
    );
    fetchOptions(
      "ShippingType",
      setShippingTypeOptions,
      setIsLoadingShippingTypes,
      "shipping types"
    );
  }, [fetchOptions]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "postBox") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= 6) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
      }
    } else if (name === "contactNumber") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (error) setError(null);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);

    if (!formData.code.trim()) {
      setError("Customer Code is required.");
      showModal("Customer Code is required.", "error");
      setIsSubmitting(false);
      return;
    }
    if (!formData.name.trim()) {
      setError("Customer Name is required.");
      showModal("Customer Name is required.", "error");
      setIsSubmitting(false);
      return;
    }
    if (!formData.group) {
      setError("Please select a Customer Group.");
      showModal("Please select a Customer Group.", "error");
      setIsSubmitting(false);
      return;
    }
    if (!formData.mailId.trim()) {
      setError("Email Address (Mail ID) is required.");
      showModal("Email Address (Mail ID) is required.", "error");
      setIsSubmitting(false);
      return;
    }
    if (formData.mailId.trim() && !/\S+@\S+\.\S+/.test(formData.mailId)) {
      setError("Please enter a valid Email Address.");
      showModal("Please enter a valid Email Address.", "error");
      setIsSubmitting(false);
      return;
    }
    if (!formData.shippingType) {
      setError("Please select a Shipping Type.");
      showModal("Please select a Shipping Type.", "error");
      setIsSubmitting(false);
      return;
    }
    if (
      formData.postBox.trim() !== "" &&
      !/^\d{6}$/.test(formData.postBox.trim())
    ) {
      setError("Post Box must be exactly 6 digits if provided.");
      showModal("Post Box must be exactly 6 digits if provided.", "error");
      setIsSubmitting(false);
      return;
    }
    if (
      formData.contactNumber.trim() !== "" &&
      !/^\d{10}$/.test(formData.contactNumber.trim())
    ) {
      setError("Contact Number must be exactly 10 digits if provided.");
      showModal(
        "Contact Number must be exactly 10 digits if provided.",
        "error"
      );
      setIsSubmitting(false);
      return;
    }

    const customerDataToSave = {
      ...formData,
      balance: parseFloat(formData.balance) || 0,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/Customer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerDataToSave),
      });

      if (!response.ok) {
        let displayErrorMessage = `Error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData) {
            if (errorData.errors) {
              const fieldErrors = errorData.errors;
              const fieldNames = Object.keys(fieldErrors);
              if (fieldNames.length > 0) {
                displayErrorMessage = fieldNames
                  .map(
                    (field) =>
                      `${field}: ${
                        Array.isArray(fieldErrors[field])
                          ? fieldErrors[field].join(", ")
                          : fieldErrors[field]
                      }`
                  )
                  .join("; ");
              } else if (errorData.title) {
                displayErrorMessage = errorData.title;
              }
            } else if (errorData.title) {
              displayErrorMessage = errorData.title;
            } else if (errorData.detail) {
              displayErrorMessage = errorData.detail;
            } else if (
              errorData.message &&
              typeof errorData.message === "string"
            ) {
              displayErrorMessage = errorData.message;
            } else if (
              typeof errorData === "string" &&
              errorData.trim() !== ""
            ) {
              displayErrorMessage = errorData;
            } else if (
              typeof errorData === "object" &&
              Object.keys(errorData).length > 0
            ) {
              const firstErrorKey = Object.keys(errorData)[0];
              if (firstErrorKey && errorData[firstErrorKey]) {
                const messages = errorData[firstErrorKey];
                displayErrorMessage = `${firstErrorKey}: ${
                  Array.isArray(messages) ? messages.join(", ") : messages
                }`;
              }
            }
          }
        } catch (e) {
          console.error("Failed to parse API error response as JSON:", e);
        }
        showModal(displayErrorMessage, "error");
        throw new Error(displayErrorMessage);
      }

      showModal("Customer Added Successfully!", "success");
      setFormData(initialFormData);
    } catch (e) {
      if (!modalState.isActive) {
        showModal(
          e.message || "Failed to save customer. Please try again.",
          "error"
        );
      }
      console.error("Failed to save customer (outer catch):", e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      navigate("/customers");
    }
  };

  const stillLoadingDropdowns =
    isLoadingGroups ||
    isLoadingRoutes ||
    isLoadingSalesEmployees ||
    isLoadingShippingTypes;

  if (
    stillLoadingDropdowns &&
    !customerGroupOptions.length &&
    !routeOptions.length &&
    !salesEmployeeOptions.length &&
    !shippingTypeOptions.length
  ) {
    return (
      <div className="detail-page-container">Loading selection options...</div>
    );
  }

  return (
    <div className="detail-page-container">
      <MessageModal
        message={modalState.message}
        onClose={closeModal}
        type={modalState.type}
      />

      <div className="detail-page-header-bar">
        <h1 className="detail-page-main-title">New Customer</h1>
      </div>

      {error && !modalState.isActive && (
        <div
          className="form-error-message"
          style={{ color: "red", marginBottom: "15px", textAlign: "center" }}
        >
          {error}
        </div>
      )}

      <div className="customer-info-header">
        {/* Column 1 */}
        <div className="customer-info-column">
          <div className="customer-info-field">
            <label htmlFor="code">Customer Code :</label>
            <input
              type="text"
              id="code"
              name="code"
              className="form-input-styled"
              value={formData.code}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="customer-info-field">
            <label htmlFor="name">Name :</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input-styled"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="customer-info-field">
            <label htmlFor="group">Customer group :</label>
            <select
              id="group"
              name="group"
              className="form-input-styled"
              value={formData.group}
              onChange={handleInputChange}
              disabled={isLoadingGroups}
              required
            >
              <option value="">
                {isLoadingGroups && !customerGroupOptions.length
                  ? "Loading..."
                  : "Select group"}
              </option>
              {customerGroupOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="customer-info-field">
            <label htmlFor="contactNumber">Contact Number :</label>
            <div className="compound-input-contact">
              <span className="input-prefix-contact">+91</span>
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                className="form-input-styled form-input-contact-suffix"
                value={formData.contactNumber}
                onChange={handleInputChange}
                placeholder="10 digits"
              />
            </div>
          </div>
          <div className="customer-info-field">
            <label htmlFor="mailId">Mail ID :</label>
            <input
              type="email"
              id="mailId"
              name="mailId"
              className="form-input-styled"
              value={formData.mailId}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="customer-info-field">
            <label htmlFor="shippingType">Shipping Type :</label>
            <select
              id="shippingType"
              name="shippingType"
              className="form-input-styled"
              value={formData.shippingType}
              onChange={handleInputChange}
              disabled={isLoadingShippingTypes}
              required
            >
              <option value="">
                {isLoadingShippingTypes && !shippingTypeOptions.length
                  ? "Loading..."
                  : "Select Shipping Type"}
              </option>{" "}
              {/* THIS LINE WAS THE CULPRIT - CORRECTED */}
              {shippingTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Column 2 */}
        <div className="customer-info-column">
          <div className="customer-info-field">
            <label htmlFor="route">Route :</label>
            <select
              id="route"
              name="route"
              className="form-input-styled"
              value={formData.route}
              onChange={handleInputChange}
              disabled={isLoadingRoutes}
            >
              <option value="">
                {isLoadingRoutes && !routeOptions.length
                  ? "Loading..."
                  : "Select route"}
              </option>
              {routeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="customer-info-field">
            <label htmlFor="employee">Sales Employee :</label>
            <select
              id="employee"
              name="employee"
              className="form-input-styled"
              value={formData.employee}
              onChange={handleInputChange}
              disabled={isLoadingSalesEmployees}
            >
              <option value="">
                {isLoadingSalesEmployees && !salesEmployeeOptions.length
                  ? "Loading..."
                  : "Select employee"}
              </option>
              {salesEmployeeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="customer-info-field">
            <label htmlFor="balance">Account Balance :</label>
            <input
              type="number"
              id="balance"
              name="balance"
              step="0.01"
              className="form-input-styled"
              value={formData.balance}
              onChange={handleInputChange}
            />
          </div>
          <div className="customer-info-field">
            <label htmlFor="remarks">Remarks :</label>
            <textarea
              id="remarks"
              name="remarks"
              className="form-textarea-styled"
              rows={4}
              value={formData.remarks}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>

      <div className="detail-form-content-area">
        <section className="form-section-card">
          <h3 className="form-section-title">Customer Address Information</h3>
          <div className="form-field-group form-field-group-inline">
            <label htmlFor="address1">Address 1 :</label>
            <input
              type="text"
              id="address1"
              name="address1"
              className="form-input-styled"
              value={formData.address1 || ""}
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
              value={formData.address2 || ""}
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
              value={formData.street || ""}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-field-group form-field-group-inline">
            <label htmlFor="postBox">Post Box :</label>
            <input
              type="text"
              inputMode="numeric"
              id="postBox"
              name="postBox"
              className="form-input-styled"
              value={formData.postBox}
              onChange={handleInputChange}
              //placeholder="6 digits"
            />
          </div>
          <div className="form-field-group form-field-group-inline">
            <label htmlFor="city">City :</label>
            <input
              type="text"
              id="city"
              name="city"
              className="form-input-styled"
              value={formData.city || ""}
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
              value={formData.state || ""}
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
              value={formData.country || ""}
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
              value={formData.gstin || ""}
              onChange={handleInputChange}
            />
          </div>
        </section>
      </div>

      <div className="detail-page-footer">
        <div className="footer-actions-main">
          <button
            className="footer-btn primary"
            onClick={handleSave}
            disabled={isSubmitting || stillLoadingDropdowns}
          >
            {isSubmitting ? "Adding..." : "Add Customer"}
          </button>
        </div>
        <button
          className="footer-btn secondary"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default AddCustomers;
