import React, { useState, useEffect, useCallback } from "react";
import "./ShippingType.css"; // We'll create this CSS file next

const API_BASE_URL = "https://localhost:7074/api"; // Your API's base URL

// Simple Modal Component for messages
const MessageModal = ({ message, onClose, type = "success", isActive }) => {
  if (!isActive || !message) return null;
  return (
    <div className="st-modal-overlay">
      {" "}
      {/* st for ShippingType */}
      <div className={`st-modal-content ${type}`}>
        <p>{message}</p>
        <button onClick={onClose} className="st-modal-close-button">
          OK
        </button>
      </div>
    </div>
  );
};

const ShippingType = () => {
  const [shippingTypes, setShippingTypes] = useState([]);
  const [newShippingTypeName, setNewShippingTypeName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [modalState, setModalState] = useState({
    message: "",
    type: "info",
    isActive: false,
  });

  const showModal = (message, type = "info") => {
    setModalState({ message, type, isActive: true });
  };

  const closeModal = () => {
    setModalState({ message: "", type: "info", isActive: false });
  };

  const fetchShippingTypes = useCallback(async () => {
    setIsLoading(true);
    try {
      // *** IMPORTANT: Verify this API endpoint for fetching shipping types ***
      const response = await fetch(`${API_BASE_URL}/ShippingType`);
      if (!response.ok) {
        let errorMsg = `Error fetching shipping types: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMsg =
            errorData.title ||
            errorData.detail ||
            errorData.message ||
            (typeof errorData === "string" && errorData) ||
            errorMsg;
        } catch (e) {
          /* ignore parse error, use default */
        }
        throw new Error(errorMsg);
      }
      const data = await response.json();
      setShippingTypes(data);
    } catch (e) {
      console.error("Failed to fetch shipping types:", e);
      showModal(
        e.message || "Failed to load shipping types. Please try refreshing.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShippingTypes();
  }, [fetchShippingTypes]);

  const handleAddShippingType = async () => {
    if (newShippingTypeName.trim() === "") {
      showModal("Shipping Type name cannot be empty.", "error");
      return;
    }

    setIsSubmitting(true);
    closeModal();

    const shippingTypeData = {
      name: newShippingTypeName.trim(),
      // Add other properties if your ShippingType object needs them
    };

    try {
      // *** IMPORTANT: Verify this API endpoint for creating a shipping type ***
      const response = await fetch(`${API_BASE_URL}/ShippingType`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(shippingTypeData),
      });

      if (!response.ok) {
        let apiErrorMessage = `Error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData) {
            if (response.status === 400 || response.status === 409) {
              const nameErrorArray = errorData.Name || errorData.name;
              const title = errorData.title?.toLowerCase();
              const detail = errorData.detail?.toLowerCase();
              const message =
                typeof errorData.message === "string"
                  ? errorData.message.toLowerCase()
                  : null;
              const errorDataStr =
                typeof errorData === "string" ? errorData.toLowerCase() : null;

              if (
                (nameErrorArray &&
                  Array.isArray(nameErrorArray) &&
                  nameErrorArray.some((err) =>
                    err.toLowerCase().includes("already exist")
                  )) ||
                (title && title.includes("already exist")) ||
                (detail && detail.includes("already exist")) ||
                (message && message.includes("already exist")) ||
                (errorDataStr && errorDataStr.includes("already exist"))
              ) {
                apiErrorMessage =
                  "Shipping Type with this name already exists!";
              } else {
                if (nameErrorArray && Array.isArray(nameErrorArray)) {
                  apiErrorMessage = nameErrorArray.join(" ");
                } else if (errorData.title) {
                  apiErrorMessage = errorData.title;
                } else if (errorData.detail) {
                  apiErrorMessage = errorData.detail;
                } else if (
                  errorData.message &&
                  typeof errorData.message === "string"
                ) {
                  apiErrorMessage = errorData.message;
                } else if (errorDataStr) {
                  apiErrorMessage = errorData;
                }
              }
            } else {
              const nameErrorArray = errorData.Name || errorData.name;
              if (nameErrorArray && Array.isArray(nameErrorArray)) {
                apiErrorMessage = nameErrorArray.join(" ");
              } else if (errorData.title) {
                apiErrorMessage = errorData.title;
              } else if (errorData.detail) {
                apiErrorMessage = errorData.detail;
              } else if (
                errorData.message &&
                typeof errorData.message === "string"
              ) {
                apiErrorMessage = errorData.message;
              } else if (typeof errorData === "string") {
                apiErrorMessage = errorData;
              }
            }
          }
        } catch (parseError) {
          /* console.warn("Failed to parse API error response as JSON:", parseError); */
        }
        throw new Error(apiErrorMessage);
      }

      showModal("Shipping Type added successfully!", "success");
      setNewShippingTypeName("");
      fetchShippingTypes(); // Refresh the list
    } catch (e) {
      console.error("Failed to add shipping type:", e);
      showModal(
        e.message || "Failed to add shipping type. Please try again.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="st-page-content">
      {" "}
      {/* st for ShippingType */}
      <MessageModal
        message={modalState.message}
        onClose={closeModal}
        type={modalState.type}
        isActive={modalState.isActive}
      />
      <h1 className="st-main-title">Shipping Type Management</h1>
      {/* Table Section */}
      <div className="table-responsive-container">
        <table className="data-table">
          <thead>
            <tr>
              <th className="st-th-serial">Serial No.</th>
              <th className="st-th-typename">Shipping Type Name</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="2" className="st-loading-cell">
                  Loading shipping types...
                </td>
              </tr>
            )}
            {!isLoading &&
              shippingTypes.map((type, index) => (
                <tr key={type.id || index}>
                  {" "}
                  {/* Prefer backend ID */}
                  <td className="st-td-serial">{index + 1}</td>
                  <td>{type.name}</td> {/* Assuming 'name' property */}
                </tr>
              ))}
            {!isLoading &&
              shippingTypes.length === 0 &&
              !modalState.isActive && (
                <tr>
                  <td colSpan="2" className="no-data-cell">
                    No shipping types found.
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>
      {/* Create Section */}
      <div className="st-create-section">
        <h3 className="st-create-title">Add New Shipping Type</h3>
        <div className="st-form-row">
          <label htmlFor="shippingTypeNameInput" className="st-label">
            Shipping Type Name :
          </label>
          <input
            type="text"
            id="shippingTypeNameInput"
            className="st-input"
            value={newShippingTypeName}
            onChange={(e) => setNewShippingTypeName(e.target.value)}
            placeholder="Enter shipping type name"
            disabled={isSubmitting || isLoading}
          />
        </div>
        <button
          type="button"
          className="st-add-button"
          onClick={handleAddShippingType}
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting ? "Adding..." : "Add Type"}
        </button>
      </div>
    </div>
  );
};

export default ShippingType;
