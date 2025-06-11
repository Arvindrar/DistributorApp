import React, { useState, useEffect, useCallback } from "react";
import "./CustomerGroup.css"; // Your existing CSS for this component

const API_BASE_URL = "https://localhost:7074/api"; // Your API's base URL

// Simple Modal Component for messages
const MessageModal = ({ message, onClose, type = "success", isActive }) => {
  if (!isActive || !message) return null;
  return (
    <div className="cg-modal-overlay">
      <div className={`cg-modal-content ${type}`}>
        <p>{message}</p>
        <button onClick={onClose} className="cg-modal-close-button">
          OK
        </button>
      </div>
    </div>
  );
};

const CustomerGroup = () => {
  const [customerGroups, setCustomerGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
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

  const fetchGroups = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/CustomerGroup`);
      if (!response.ok) {
        let errorMsg = `Error fetching groups: ${response.status} ${response.statusText}`;
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
      setCustomerGroups(data);
    } catch (e) {
      console.error("Failed to fetch customer groups:", e);
      showModal(
        e.message || "Failed to load customer groups. Please try refreshing.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  }, []); // Removed showModal from dependencies as it doesn't change

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleAddGroup = async () => {
    if (newGroupName.trim() === "") {
      showModal("Customer group name cannot be empty.", "error");
      return;
    }

    setIsSubmitting(true);
    closeModal(); // Clear previous modal messages

    const groupData = {
      name: newGroupName.trim(),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/CustomerGroup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(groupData),
      });

      if (!response.ok) {
        let apiErrorMessage = `Error: ${response.status} ${response.statusText}`; // Default message
        try {
          const errorData = await response.json();
          // You can uncomment this to see the exact error structure from your API
          // console.log("DEBUG: API Error Response Data:", JSON.stringify(errorData, null, 2));

          if (errorData) {
            // Priority: If status is 400 (Bad Request) or 409 (Conflict), check for "already exists"
            if (response.status === 400 || response.status === 409) {
              // Directly check errorData.Name (or .name) as per your console output
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
                apiErrorMessage = "Customer Group Already Exists!";
              } else {
                // If it's 400/409 but not "already exists", try to get a more specific message
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
                  apiErrorMessage = errorData; // Use the original string if it was just a string
                }
                // If no specific message found for 400/409, it will retain the default
              }
            } else {
              // For other error statuses (not 400 or 409)
              const nameErrorArray = errorData.Name || errorData.name; // Check directly here too
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
          // console.warn("Failed to parse API error response as JSON:", parseError);
        }
        throw new Error(apiErrorMessage);
      }

      showModal("Customer Group added successfully!", "success");
      setNewGroupName("");
      fetchGroups(); // Refresh the list
    } catch (e) {
      console.error("Failed to add customer group:", e);
      showModal(e.message || "Failed to add group. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cg-page-content">
      <MessageModal
        message={modalState.message}
        onClose={closeModal}
        type={modalState.type}
        isActive={modalState.isActive}
      />

      <h1 className="cg-main-title">Customer Group Management</h1>

      {/* Table Section */}
      <div className="table-responsive-container">
        <table className="data-table">
          <thead>
            <tr>
              <th className="cg-th-serial">Serial No.</th>
              <th className="cg-th-groupname">Customer Group</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="2" className="cg-loading-cell">
                  Loading customer groups...
                </td>
              </tr>
            )}
            {!isLoading &&
              customerGroups.map((group, index) => (
                <tr key={group.id || index}>
                  {" "}
                  {/* Prefer backend ID */}
                  <td className="cg-td-serial">{index + 1}</td>
                  <td>{group.name}</td>
                </tr>
              ))}
            {!isLoading &&
              customerGroups.length === 0 &&
              !modalState.isActive && (
                <tr>
                  <td colSpan="2" className="no-data-cell">
                    No customer groups found.
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>

      {/* Create Section */}
      <div className="cg-create-section">
        <h3 className="cg-create-title">Create New Group</h3>
        <div className="cg-form-row">
          <label htmlFor="customerGroupNameInput" className="cg-label">
            Customer Group :
          </label>
          <input
            type="text"
            id="customerGroupNameInput"
            className="cg-input" // Use this class for styling
            value={newGroupName}
            onChange={(e) => {
              setNewGroupName(e.target.value);
              // if (modalState.isActive && modalState.type === "error") {
              //   closeModal(); // Optionally close error modal on typing
              // }
            }}
            placeholder="Enter group name"
            disabled={isSubmitting || isLoading}
          />
        </div>
        <button
          type="button"
          className="cg-add-button" // Use this class for styling
          onClick={handleAddGroup}
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting ? "Adding..." : "Add"}
        </button>
      </div>
    </div>
  );
};

export default CustomerGroup;
