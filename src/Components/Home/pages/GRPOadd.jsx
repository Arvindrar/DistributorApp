import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./GRPOadd.css"; // Import the NEW CSS

// Placeholder for a lookup icon
const LookupIcon = () => (
  <span className="lookup-indicator-icon" title="Lookup value">
    ○ {/* Unicode white circle */}
  </span>
);

// Icons (Ideally, move these to a shared components/icons.jsx file)
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

function GRPOadd() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    grpoNumber: "",
    originalPoNumber: "",
    vendorCode: "",
    vendorName: "",
    vendorRefNumber: "",
    grpoDate: "",
    dueDate: "", // As per your inclusion
    deliveryNote: "",

    billToAddress: "",
    grpoRemarks: "",
    uploadedFile: null,
  });

  // Updated to match the table headers you provided
  const initialEmptyItem = (id) => ({
    id: id,
    productCode: "",
    productName: "",
    quantity: "", // This will be the "Received Quantity"
    uom: "",
    price: "", // For "Prize" header
    stockLocation: "", // For "Stock Location" header
    taxCode: "",
    taxPrice: "",
    total: "", // For "Total" header (calculated)
    showProductCodeLookup: false,
    showProductNameLookup: false,
    showTaxLookup: false, // Added for consistency if Tax needs lookup
  });

  const [grpoItems, setGrpoItems] = useState([
    initialEmptyItem(1),
    initialEmptyItem(2),
    initialEmptyItem(3),
    initialEmptyItem(4),
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, uploadedFile: file }));
      console.log("Selected file:", file.name);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleItemChange = (e, itemId, fieldName) => {
    const { value } = e.target;
    setGrpoItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, [fieldName]: value } : item
      )
    );
    // Recalculate total if quantity, price, or tax changes
    if (
      fieldName === "quantity" ||
      fieldName === "price" ||
      fieldName === "tax"
    ) {
      calculateItemTotalOnItemChange(itemId);
    }
  };

  // Calculates total for a specific item after a change
  const calculateItemTotalOnItemChange = (itemId) => {
    setGrpoItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          const numQuantity = parseFloat(item.quantity) || 0;
          const numPrice = parseFloat(item.price) || 0;
          const numTax = parseFloat(item.tax) || 0; // Assuming tax is an amount
          // If tax is a rate (e.g., 0.1 for 10%), calculation would be:
          // const calculatedTotal = (numQuantity * numPrice) * (1 + numTax);
          const calculatedTotal = numQuantity * numPrice + numTax;
          return { ...item, total: calculatedTotal.toFixed(2) };
        }
        return item;
      })
    );
  };

  const toggleLookupIndicator = (itemId, fieldName, show) => {
    setGrpoItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          const updates = {
            showProductCodeLookup: false,
            showProductNameLookup: false,
            showTaxLookup: false,
            [`show${
              fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
            }Lookup`]: show,
          };
          return { ...item, ...updates };
        }
        return {
          // Hide indicators for other rows
          ...item,
          showProductCodeLookup: false,
          showProductNameLookup: false,
          showTaxLookup: false,
        };
      })
    );
  };

  const handleLookupClick = (itemId, fieldType) => {
    console.log(`Lookup clicked for item ${itemId}, field: ${fieldType}`);
    toggleLookupIndicator(itemId, fieldType, false);
  };

  const handleSave = () => {
    const dataToSave = new FormData();
    for (const key in formData) {
      if (key === "uploadedFile" && formData[key]) {
        dataToSave.append(key, formData[key], formData[key].name);
      } else if (formData[key] !== null) {
        dataToSave.append(key, formData[key]);
      }
    }
    const validGrpoItems = grpoItems.filter(
      (item) => item.productCode || item.productName || item.quantity
    );
    dataToSave.append("grpoItems", JSON.stringify(validGrpoItems));

    console.log("Saving new GRPO data:");
    for (let [key, value] of dataToSave.entries()) {
      console.log(key, value);
    }
    // navigate('/grpo');
  };

  const handleCancel = () => {
    navigate("/grpo");
  };

  // No handleAddItemRow as per your request

  return (
    <div className="detail-page-container">
      <div className="detail-page-header-bar">
        <h1 className="detail-page-main-title">
          Create Goods Receipt PO (GRPO)
        </h1>
      </div>
      <div className="grpo-add__form-header">
        <div className="entry-header-column">
          <div className="entry-header-field">
            <label htmlFor="vendorCode">Vendor Code :</label>
            <input
              type="text"
              id="vendorCode"
              name="vendorCode"
              className="form-input-styled"
              value={formData.vendorCode}
              onChange={handleInputChange}
            />
          </div>
          <div className="entry-header-field">
            <label htmlFor="vendorName">Vendor Name :</label>
            <input
              type="text"
              id="vendorName"
              name="vendorName"
              className="form-input-styled"
              value={formData.vendorName}
              onChange={handleInputChange}
            />
          </div>
          <div className="entry-header-field">
            <label htmlFor="vendorRefNumber">Vendor Ref No. :</label>
            <input
              type="text"
              id="vendorRefNumber"
              name="vendorRefNumber"
              className="form-input-styled"
              value={formData.vendorRefNumber}
              onChange={handleInputChange}
            />
          </div>

          <div className="entry-header-field">
            <label htmlFor="billToAddress">Pay To Address :</label>
            <input
              type="text"
              id="billToAddress"
              name="billToAddress"
              className="form-input-styled"
              value={formData.billToAddress}
              onChange={handleInputChange}
            />
          </div>
          <div className="entry-header-field">
            <label htmlFor="grpoRemarks">Remarks :</label>
            <input
              type="text"
              id="grpoRemarks"
              name="grpoRemarks"
              className="form-input-styled"
              value={formData.grpoRemarks}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="entry-header-column">
          <div className="entry-header-field">
            <label htmlFor="grpoNumber">GRPO Number :</label>
            <input
              type="text"
              id="grpoNumber"
              name="grpoNumber"
              className="form-input-styled"
              value={formData.grpoNumber}
              onChange={handleInputChange}
            />
          </div>

          <div className="entry-header-field">
            <label htmlFor="grpoDate">GRPO Date :</label>
            <input
              type="date"
              id="grpoDate"
              name="grpoDate"
              className="form-input-styled"
              value={formData.grpoDate}
              onChange={handleInputChange}
            />
          </div>
          <div className="entry-header-field">
            <label htmlFor="dueDate">Due Date :</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              className="form-input-styled"
              value={formData.dueDate}
              onChange={handleInputChange}
            />
          </div>
          <div className="entry-header-field file-input-container">
            <label htmlFor="uploadImageFile">Attach Document :</label>
            <input
              type="file"
              id="uploadImageFile"
              name="uploadImageFile"
              ref={fileInputRef}
              className="form-input-file-hidden"
              onChange={handleFileInputChange}
            />
            <button
              type="button"
              className="browse-files-btn"
              onClick={handleBrowseClick}
            >
              Browse files
            </button>
            {formData.uploadedFile && (
              <span className="file-name-display">
                {formData.uploadedFile.name}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="detail-form-content-area">
        <div className="grpo-add__items-section">
          <div className="product-details-header">
            <h3 className="form-section-title">Received Items Details</h3>
          </div>
          <div className="table-responsive-container">
            <table className="grpo-add__items-table">
              <thead>
                <tr>
                  <th>Product Code</th>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>UOM</th>
                  <th>Price</th> {/* Changed from Prize */}
                  <th>Stock Location</th>
                  <th>Tax Code</th>
                  <th>Tax Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {grpoItems.map((item) => (
                  <tr key={item.id}>
                    <td className="editable-cell product-code-cell">
                      <input
                        type="text"
                        className="grpo-add__table-input"
                        value={item.productCode}
                        onChange={(e) =>
                          handleItemChange(e, item.id, "productCode")
                        }
                        onFocus={() =>
                          toggleLookupIndicator(item.id, "ProductCode", true)
                        }
                        onBlur={() =>
                          setTimeout(() => {
                            if (
                              !document.activeElement.classList.contains(
                                "grpo-add__lookup-indicator"
                              )
                            ) {
                              toggleLookupIndicator(
                                item.id,
                                "ProductCode",
                                false
                              );
                            }
                          }, 150)
                        }
                      />
                      {item.showProductCodeLookup && (
                        <button
                          type="button"
                          className="grpo-add__lookup-indicator"
                          onClick={() =>
                            handleLookupClick(item.id, "ProductCode")
                          }
                          title="Lookup Product Code"
                        >
                          <LookupIcon />
                        </button>
                      )}
                    </td>
                    <td className="editable-cell product-name-cell">
                      <input
                        type="text"
                        className="grpo-add__table-input"
                        value={item.productName}
                        onChange={(e) =>
                          handleItemChange(e, item.id, "productName")
                        }
                        onFocus={() =>
                          // Added onFocus for ProductName lookup consistency
                          toggleLookupIndicator(item.id, "ProductName", true)
                        }
                        onBlur={() =>
                          setTimeout(() => {
                            if (
                              !document.activeElement.classList.contains(
                                "grpo-add__lookup-indicator"
                              )
                            ) {
                              toggleLookupIndicator(
                                item.id,
                                "ProductName",
                                false
                              );
                            }
                          }, 150)
                        }
                      />
                      {item.showProductNameLookup && (
                        <button
                          type="button"
                          className="grpo-add__lookup-indicator"
                          onClick={() =>
                            handleLookupClick(item.id, "ProductName")
                          }
                          title="Lookup Product Name"
                        >
                          <LookupIcon />
                        </button>
                      )}
                    </td>
                    <td className="editable-cell">
                      {" "}
                      {/* This is for "Received Quantity" */}
                      <input
                        type="number"
                        className="grpo-add__table-input grpo-add__quantity-input"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(e, item.id, "quantity")
                        }
                      />
                    </td>
                    <td className="editable-cell">
                      <input
                        type="text"
                        className="grpo-add__table-input grpo-add__uom-input"
                        value={item.uom}
                        onChange={(e) => handleItemChange(e, item.id, "uom")}
                      />
                    </td>
                    <td className="editable-cell">
                      <input
                        type="number"
                        className="grpo-add__table-input grpo-add__price-input"
                        value={item.price}
                        step="0.01"
                        onChange={(e) => handleItemChange(e, item.id, "price")}
                      />
                    </td>
                    <td className="editable-cell">
                      <input
                        type="text"
                        className="grpo-add__table-input"
                        value={item.stockLocation} // Was warehouseLocation in state, matching to header
                        onChange={(e) =>
                          handleItemChange(e, item.id, "stockLocation")
                        }
                      />
                    </td>
                    <td className="editable-cell tax-cell">
                      <input
                        type="number"
                        className="grpo-add__table-input grpo-add__tax-input"
                        value={item.taxCode}
                        step="0.01"
                        onChange={(e) =>
                          handleItemChange(e, item.id, "taxCode")
                        }
                        onFocus={() =>
                          toggleLookupIndicator(item.id, "TaxCode", true)
                        }
                        onBlur={() =>
                          setTimeout(() => {
                            if (
                              !document.activeElement.classList.contains(
                                "grpo-add__lookup-indicator"
                              )
                            ) {
                              toggleLookupIndicator(item.id, "TaxCode", false);
                            }
                          }, 150)
                        }
                      />
                      {item.showTaxLookup && (
                        <button
                          type="button"
                          className="grpo-add__lookup-indicator"
                          onClick={() => handleLookupClick(item.id, "TaxCode")}
                          title="Lookup Tax"
                        >
                          <LookupIcon />
                        </button>
                      )}
                    </td>
                    <td className="editable-cell tax-cell">
                      <input
                        type="number"
                        className="grpo-add__table-input grpo-add__tax-input"
                        value={item.taxPrice}
                        step="0.01"
                        onChange={(e) =>
                          handleItemChange(e, item.id, "taxPrice")
                        }
                        onFocus={() =>
                          toggleLookupIndicator(item.id, "TaxPtaxPrice", true)
                        }
                        onBlur={() =>
                          setTimeout(() => {
                            if (
                              !document.activeElement.classList.contains(
                                "grpo-add__lookup-indicator"
                              )
                            ) {
                              toggleLookupIndicator(
                                item.id,
                                "TaxPtaxPrice",
                                false
                              );
                            }
                          }, 150)
                        }
                      />
                      {item.showTaxLookup && (
                        <button
                          type="button"
                          className="grpo-add__lookup-indicator"
                          onClick={() =>
                            handleLookupClick(item.id, "TaxPtaxPrice")
                          }
                          title="Lookup Tax"
                        >
                          <LookupIcon />
                        </button>
                      )}
                    </td>
                    <td className="total-cell">{item.total || "0.00"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="tax-summary-container">
            {" "}
            {/* Was "tax-total" */}
            <div className="summary-item">
              <label htmlFor="quantityTotalSummary" className="summary-label">
                Product Total :
              </label>
              <input
                type="text"
                id="quantityTotalSummary"
                className="summary-input"
                readOnly // Assuming these are calculated
                // value={calculatedQuantityTotal} // You'll need to calculate and set this
              />
            </div>
            <div className="summary-item">
              <label htmlFor="taxTotalSummary" className="summary-label">
                Tax Total :
              </label>
              <input
                type="text"
                id="taxTotalSummary"
                className="summary-input"
                readOnly // Assuming these are calculated
                // value={calculatedTaxTotal} // You'll need to calculate and set this
              />
            </div>
            <div className="summary-item">
              <label htmlFor="grandTotalSummary" className="summary-label">
                Net Total :
              </label>
              <input
                type="text"
                id="grandTotalSummary"
                className="summary-input"
                readOnly // Assuming these are calculated
                // value={calculatedGrandTotal} // You'll need to calculate and set this
              />
            </div>
          </div>
          {/* "Add Item Row" button is intentionally removed as per your request */}
        </div>
      </div>
      <div className="detail-page-footer">
        <div className="footer-actions-main">
          <button className="footer-btn primary" onClick={handleSave}>
            Create GRPO
          </button>
          <button className="footer-btn primary">Remove</button>
        </div>
        <button className="footer-btn primary" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default GRPOadd;
