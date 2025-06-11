import React, { useState, useEffect, useCallback } from "react";
import "./Routess.css"; // We'll create this CSS file next

const API_BASE_URL = "https://localhost:7074/api"; // Your API's base URL

// Simple Modal Component for messages
const MessageModal = ({ message, onClose, type = "success", isActive }) => {
  if (!isActive || !message) return null;
  return (
    <div className="rt-modal-overlay">
      {" "}
      {/* rt for Route */}
      <div className={`rt-modal-content ${type}`}>
        <p>{message}</p>
        <button onClick={onClose} className="rt-modal-close-button">
          OK
        </button>
      </div>
    </div>
  );
};

const Routess = () => {
  const [routes, setRoutes] = useState([]);
  const [newRouteName, setNewRouteName] = useState("");
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

  const fetchRoutes = useCallback(async () => {
    setIsLoading(true);
    try {
      // *** CHANGE API ENDPOINT FOR ROUTES ***
      const response = await fetch(`${API_BASE_URL}/Routes`);
      if (!response.ok) {
        let errorMsg = `Error fetching routes: ${response.status} ${response.statusText}`;
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
      setRoutes(data);
    } catch (e) {
      console.error("Failed to fetch routes:", e);
      showModal(
        e.message || "Failed to load routes. Please try refreshing.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const handleAddRoute = async () => {
    if (newRouteName.trim() === "") {
      showModal("Route name cannot be empty.", "error");
      return;
    }

    setIsSubmitting(true);
    closeModal(); // Clear previous modal messages

    const routeData = {
      name: newRouteName.trim(),
      // Add other properties if your Route object needs them
    };

    try {
      // *** CHANGE API ENDPOINT FOR ROUTES ***
      const response = await fetch(`${API_BASE_URL}/Routes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(routeData),
      });

      if (!response.ok) {
        let apiErrorMessage = `Error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          // This error handling is copied from CustomerGroup,
          // you might need to adjust it based on your /Route API's error response structure
          if (errorData) {
            if (response.status === 400 || response.status === 409) {
              const nameErrorArray = errorData.Name || errorData.name; // Check for 'Name' or 'name'
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
                apiErrorMessage = "Route Already Exists!"; // Changed message
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

      showModal("Route added successfully!", "success"); // Changed message
      setNewRouteName("");
      fetchRoutes(); // Refresh the list
    } catch (e) {
      console.error("Failed to add route:", e);
      showModal(e.message || "Failed to add route. Please try again.", "error"); // Changed message
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rt-page-content">
      {/* rt for Route */}
      <MessageModal
        message={modalState.message}
        onClose={closeModal}
        type={modalState.type}
        isActive={modalState.isActive}
      />
      <h1 className="rt-main-title">Route Management</h1> {/* Changed title */}
      {/* Table Section */}
      <div className="table-responsive-container">
        <table className="data-table">
          <thead>
            <tr>
              <th className="rt-th-serial">Serial No.</th>
              <th className="rt-th-routename">Route Name</th>
              {/* Changed column header */}
              {/* Add more <th> if your Route object has more displayable fields */}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="2" className="rt-loading-cell">
                  {/* Adjust colSpan if more columns */}
                  Loading routes...
                </td>
              </tr>
            )}
            {!isLoading &&
              routes.map((route, index) => (
                <tr key={route.id || index}>
                  <td className="rt-td-serial">{index + 1}</td>
                  <td>{route.name}</td>
                </tr>
              ))}
            {!isLoading && routes.length === 0 && !modalState.isActive && (
              <tr>
                <td colSpan="2" className="no-data-cell">
                  {/* Adjust colSpan if more columns */}
                  No routes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Create Section */}
      <div className="rt-create-section">
        <h3 className="rt-create-title">Create New Route</h3>{" "}
        {/* Changed title */}
        <div className="rt-form-row">
          <label htmlFor="routeNameInput" className="rt-label">
            Route Name : {/* Changed label */}
          </label>
          <input
            type="text"
            id="routeNameInput" // Changed id
            className="rt-input"
            value={newRouteName}
            onChange={(e) => {
              setNewRouteName(e.target.value);
            }}
            placeholder="Enter route name" // Changed placeholder
            disabled={isSubmitting || isLoading}
          />
        </div>
        <button
          type="button"
          className="rt-add-button"
          onClick={handleAddRoute}
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting ? "Adding..." : "Add Route"} {/* Changed button text */}
        </button>
      </div>
    </div>
  );
};

export default Routess;
