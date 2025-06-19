import React, { useState, useEffect, useCallback } from "react";
import "./VendorGroup.css"; // MODIFIED: CSS import

const API_BASE_URL = "https://localhost:7074/api";

// Simple Modal Component for messages
const MessageModal = ({ message, onClose, type = "success", isActive }) => {
  if (!isActive || !message) return null;
  return (
    <div className="vg-modal-overlay">
      {" "}
      {/* MODIFIED: Class prefix */}
      <div className={`vg-modal-content ${type}`}>
        {" "}
        {/* MODIFIED: Class prefix */}
        <p>{message}</p>
        <button onClick={onClose} className="vg-modal-close-button">
          {" "}
          {/* MODIFIED: Class prefix */}
          OK
        </button>
      </div>
    </div>
  );
};

const VendorGroup = () => {
  // MODIFIED: Component name
  const [vendorGroups, setVendorGroups] = useState([]); // MODIFIED: State name
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
      // IMPORTANT: Update this endpoint if your API for Vendor Groups is different
      const response = await fetch(`${API_BASE_URL}/VendorGroup`); // MODIFIED: API Endpoint (ASSUMPTION)
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
      setVendorGroups(data); // MODIFIED: State setter
    } catch (e) {
      console.error("Failed to fetch vendor groups:", e); // MODIFIED: Log message
      showModal(
        e.message || "Failed to load vendor groups. Please try refreshing.", // MODIFIED: Modal message
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleAddGroup = async () => {
    if (newGroupName.trim() === "") {
      showModal("Vendor group name cannot be empty.", "error"); // MODIFIED: Modal message
      return;
    }

    setIsSubmitting(true);
    closeModal();

    const groupData = {
      name: newGroupName.trim(),
      // Add other properties if your VendorGroup model requires them
    };

    try {
      // IMPORTANT: Update this endpoint if your API for Vendor Groups is different
      const response = await fetch(`${API_BASE_URL}/VendorGroup`, {
        // MODIFIED: API Endpoint (ASSUMPTION)
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(groupData),
      });

      if (!response.ok) {
        let apiErrorMessage = `Error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
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
              apiErrorMessage = "Vendor Group Already Exists!"; // MODIFIED: Message
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
        } catch (parseError) {
          // console.warn("Failed to parse API error response as JSON:", parseError);
        }
        throw new Error(apiErrorMessage);
      }

      showModal("Vendor Group added successfully!", "success"); // MODIFIED: Message
      setNewGroupName("");
      fetchGroups();
    } catch (e) {
      console.error("Failed to add vendor group:", e); // MODIFIED: Log message
      showModal(e.message || "Failed to add group. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="vg-page-content">
      {" "}
      {/* MODIFIED: Class prefix */}
      <MessageModal
        message={modalState.message}
        onClose={closeModal}
        type={modalState.type}
        isActive={modalState.isActive}
      />
      <h1 className="vg-main-title">Vendor Group Management</h1>{" "}
      {/* MODIFIED: Title & Class prefix */}
      {/* Table Section */}
      <div className="vg-table-responsive-container">
        {" "}
        {/* MODIFIED: Class prefix */}
        <table className="vg-data-table">
          {" "}
          {/* MODIFIED: Class prefix */}
          <thead>
            <tr>
              <th className="vg-th-serial">Serial No.</th>{" "}
              {/* MODIFIED: Class prefix */}
              <th className="vg-th-groupname">Vendor Group</th>{" "}
              {/* MODIFIED: Text & Class prefix */}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="2" className="vg-loading-cell">
                  {" "}
                  {/* MODIFIED: Class prefix */}
                  Loading vendor groups... {/* MODIFIED: Text */}
                </td>
              </tr>
            )}
            {!isLoading &&
              vendorGroups.map(
                (
                  group,
                  index // MODIFIED: Variable name
                ) => (
                  <tr key={group.id || index}>
                    <td className="vg-td-serial">{index + 1}</td>{" "}
                    {/* MODIFIED: Class prefix */}
                    <td>{group.name}</td>
                  </tr>
                )
              )}
            {!isLoading &&
              vendorGroups.length === 0 && // MODIFIED: Variable name
              !modalState.isActive && (
                <tr>
                  <td colSpan="2" className="vg-no-data-cell">
                    {" "}
                    {/* MODIFIED: Class prefix */}
                    No vendor groups found. {/* MODIFIED: Text */}
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>
      {/* Create Section */}
      <div className="vg-create-section">
        {" "}
        {/* MODIFIED: Class prefix */}
        <h3 className="vg-create-title">Create New Group</h3>{" "}
        {/* MODIFIED: Class prefix */}
        <div className="vg-form-row">
          {" "}
          {/* MODIFIED: Class prefix */}
          <label htmlFor="vendorGroupNameInput" className="vg-label">
            {" "}
            {/* MODIFIED: Text & Class prefix */}
            Vendor Group :
          </label>
          <input
            type="text"
            id="vendorGroupNameInput" // MODIFIED: ID
            className="vg-input" // MODIFIED: Class prefix
            value={newGroupName}
            onChange={(e) => {
              setNewGroupName(e.target.value);
            }}
            placeholder="Enter group name"
            disabled={isSubmitting || isLoading}
          />
        </div>
        <button
          type="button"
          className="vg-add-button" // MODIFIED: Class prefix
          onClick={handleAddGroup}
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting ? "Adding..." : "Add"}
        </button>
      </div>
    </div>
  );
};

export default VendorGroup; // MODIFIED: Export name
