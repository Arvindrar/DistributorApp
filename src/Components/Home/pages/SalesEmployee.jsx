import React, { useState, useEffect, useCallback } from "react";
import "./SalesEmployee.css"; // We'll create this CSS file next

const API_BASE_URL = "https://localhost:7074/api"; // Your API's base URL

// Simple Modal Component for messages
const MessageModal = ({ message, onClose, type = "success", isActive }) => {
  if (!isActive || !message) return null;
  return (
    <div className="se-modal-overlay">
      {" "}
      {/* se for SalesEmployee */}
      <div className={`se-modal-content ${type}`}>
        <p>{message}</p>
        <button onClick={onClose} className="se-modal-close-button">
          OK
        </button>
      </div>
    </div>
  );
};

const SalesEmployee = () => {
  const [salesEmployees, setSalesEmployees] = useState([]);
  const [newEmployeeName, setNewEmployeeName] = useState(""); // Storing the name of the new employee
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

  const fetchSalesEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      // *** IMPORTANT: Verify this API endpoint for fetching sales employees ***
      const response = await fetch(`${API_BASE_URL}/SalesEmployee`);
      if (!response.ok) {
        let errorMsg = `Error fetching sales employees: ${response.status} ${response.statusText}`;
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
      setSalesEmployees(data);
    } catch (e) {
      console.error("Failed to fetch sales employees:", e);
      showModal(
        e.message || "Failed to load sales employees. Please try refreshing.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  }, []); // Removed showModal from dependencies

  useEffect(() => {
    fetchSalesEmployees();
  }, [fetchSalesEmployees]);

  const handleAddSalesEmployee = async () => {
    if (newEmployeeName.trim() === "") {
      showModal("Sales Employee name cannot be empty.", "error");
      return;
    }

    setIsSubmitting(true);
    closeModal();

    const employeeData = {
      name: newEmployeeName.trim(),
      // Add other properties if your SalesEmployee object needs them (e.g., employeeId, department)
    };

    try {
      // *** IMPORTANT: Verify this API endpoint for creating a sales employee ***
      const response = await fetch(`${API_BASE_URL}/SalesEmployee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employeeData),
      });

      if (!response.ok) {
        let apiErrorMessage = `Error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData) {
            if (response.status === 400 || response.status === 409) {
              // Conflict or Bad Request
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
                  "Sales Employee with this name already exists!";
              } else {
                // Other 400/409 errors
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
              // Other error statuses
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

      showModal("Sales Employee added successfully!", "success");
      setNewEmployeeName("");
      fetchSalesEmployees(); // Refresh the list
    } catch (e) {
      console.error("Failed to add sales employee:", e);
      showModal(
        e.message || "Failed to add sales employee. Please try again.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="se-page-content">
      {" "}
      {/* se for SalesEmployee */}
      <MessageModal
        message={modalState.message}
        onClose={closeModal}
        type={modalState.type}
        isActive={modalState.isActive}
      />
      <h1 className="se-main-title">Sales Employee Management</h1>
      {/* Table Section */}
      <div className="table-responsive-container">
        <table className="data-table">
          <thead>
            <tr>
              <th className="se-th-serial">Serial No.</th>
              <th className="se-th-employeename">Employee Name</th>
              {/* Add more <th> if your SalesEmployee object has more displayable fields */}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="2" className="se-loading-cell">
                  {" "}
                  {/* Adjust colSpan if more columns */}
                  Loading sales employees...
                </td>
              </tr>
            )}
            {!isLoading &&
              salesEmployees.map((employee, index) => (
                <tr key={employee.id || index}>
                  {" "}
                  {/* Prefer backend ID if available */}
                  <td className="se-td-serial">{index + 1}</td>
                  <td>{employee.name}</td> {/* Assuming 'name' property */}
                  {/* Add more <td> for other properties of the employee object */}
                </tr>
              ))}
            {!isLoading &&
              salesEmployees.length === 0 &&
              !modalState.isActive && ( // Don't show "No data" if a modal is active (e.g., error modal)
                <tr>
                  <td colSpan="2" className="no-data-cell">
                    {" "}
                    {/* Adjust colSpan if more columns */}
                    No sales employees found.
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>
      {/* Create Section */}
      <div className="se-create-section">
        <h3 className="se-create-title">Add New Sales Employee</h3>
        <div className="se-form-row">
          <label htmlFor="employeeNameInput" className="se-label">
            Employee Name :
          </label>
          <input
            type="text"
            id="employeeNameInput"
            className="se-input"
            value={newEmployeeName}
            onChange={(e) => setNewEmployeeName(e.target.value)}
            placeholder="Enter employee name"
            disabled={isSubmitting || isLoading}
          />
        </div>
        <button
          type="button"
          className="se-add-button"
          onClick={handleAddSalesEmployee}
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting ? "Adding..." : "Add Employee"}
        </button>
      </div>
    </div>
  );
};

export default SalesEmployee;
