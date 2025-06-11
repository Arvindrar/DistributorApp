import React, { useState, useEffect, useCallback } from "react";
import "./UOMGroup.css"; // Styles specific to this component
import { API_UOM_GROUP_ENDPOINT } from "../../../config"; // Adjust path and ensure this endpoint exists in config.js

// Simple Modal Component
const MessageModal = ({ message, onClose, type = "success" }) => {
  if (!message) return null;
  return (
    <div className="uomg-modal-overlay">
      {" "}
      {/* Using uomg- prefix for UOM Group */}
      <div className={`uomg-modal-content ${type}`}>
        <p>{message}</p>
        <button onClick={onClose} className="uomg-modal-close-button">
          OK
        </button>
      </div>
    </div>
  );
};

const UOMGroup = () => {
  const [uomGroups, setUomGroups] = useState([]);
  const [newUomGroupName, setNewUomGroupName] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch UOM Groups from the backend
  const fetchUomGroups = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_UOM_GROUP_ENDPOINT); // Using new endpoint
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      setUomGroups(data);
    } catch (e) {
      console.error("Failed to fetch UOM Groups:", e);
      setError(
        e.message || "Failed to load UOM Groups. Please try refreshing."
      );
    } finally {
      setIsLoading(false);
    }
  }, []); // API_UOM_GROUP_ENDPOINT is a constant

  useEffect(() => {
    fetchUomGroups();
  }, [fetchUomGroups]);

  const handleAddUomGroup = async () => {
    if (newUomGroupName.trim() === "") {
      setFormError("UOM Group name cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    setError(null);
    setSuccessMessage("");

    const uomGroupData = {
      name: newUomGroupName.trim(),
    };

    try {
      const response = await fetch(API_UOM_GROUP_ENDPOINT, {
        // Using new endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(uomGroupData),
      });

      if (!response.ok) {
        let errorMessage = `Error: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.errors && errorData.errors.Name) {
            errorMessage = errorData.errors.Name.join(" ");
          } else if (errorData.title) {
            errorMessage = errorData.title;
          } else if (
            typeof errorData === "string" &&
            errorData.includes("already exists")
          ) {
            errorMessage = errorData;
          } else if (typeof errorData === "string" && errorData.trim() !== "") {
            errorMessage = errorData;
          } else {
            errorMessage =
              response.statusText ||
              `Request failed with status ${response.status}`;
          }
        } catch (e) {
          errorMessage =
            response.statusText ||
            `Request failed with status ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      setSuccessMessage("UOM Group added successfully!");
      setNewUomGroupName("");
      fetchUomGroups();
    } catch (e) {
      console.error("Failed to add UOM Group:", e);
      setFormError(
        e.message || "UOM Group Already Exists or another error occurred!"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setSuccessMessage("");
    setFormError("");
    setError("");
  };

  return (
    <div className="uomg-page-content">
      {" "}
      {/* uomg- prefix */}
      <MessageModal
        message={successMessage}
        onClose={closeModal}
        type="success"
      />
      <MessageModal message={formError} onClose={closeModal} type="error" />
      {error && !formError && (
        <MessageModal message={error} onClose={closeModal} type="error" />
      )}
      <h1 className="uomg-main-title">UOM Groups</h1> {/* Changed title */}
      {isLoading && (
        <p className="uomg-loading-message">Loading UOM Groups...</p>
      )}
      {!isLoading && error && !formError && (
        <p className="uomg-fetch-error-message">{error}</p>
      )}
      <div className="table-responsive-container">
        <table className="data-table">
          <thead>
            <tr>
              <th className="uomg-th-serial">Serial No</th>
              <th className="uomg-th-groupname">UOM Group Name</th>{" "}
              {/* Changed header */}
            </tr>
          </thead>
          <tbody>
            {!isLoading &&
              uomGroups.length > 0 &&
              uomGroups.map((group, index) => (
                <tr key={group.id}>
                  {" "}
                  {/* Assuming UOM Group objects have an 'id' */}
                  <td className="uomg-td-serial">{index + 1}</td>
                  <td>{group.name}</td>
                </tr>
              ))}
            {!isLoading && uomGroups.length === 0 && !error && (
              <tr>
                <td colSpan="2" className="no-data-cell">
                  No UOM Groups found. Add one below.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="uomg-create-section">
        <h3 className="uomg-create-title">Create New UOM Group</h3>{" "}
        {/* Changed title */}
        <div className="uomg-form-row">
          <label htmlFor="uomGroupNameInput" className="uomg-label">
            UOM Group Name : {/* Changed label */}
          </label>
          <input
            type="text"
            id="uomGroupNameInput"
            className="uomg-input"
            value={newUomGroupName}
            onChange={(e) => {
              setNewUomGroupName(e.target.value);
              if (formError) setFormError(null);
            }}
            placeholder="Enter UOM Group name (e.g., Weight, Length, Count)" // Changed placeholder
            disabled={isSubmitting}
          />
        </div>
        <button
          type="button"
          className="uomg-add-button"
          onClick={handleAddUomGroup}
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting ? "Adding..." : "Add"}
        </button>
      </div>
    </div>
  );
};

export default UOMGroup;
