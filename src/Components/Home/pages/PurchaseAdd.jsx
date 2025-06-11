import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./PurchaseAdd.css"; // Import the CSS

// Placeholder for a lookup icon
const LookupIcon = () => (
  <span className="lookup-indicator-icon" title="Lookup value">
    ○ {/* Unicode white circle */}
  </span>
);

// Icons (Ideally, move these to a shared components/icons.jsx file)
// ... (DropdownArrowIcon, UpArrowIcon - kept as is)

function PurchaseAdd() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    purchaseOrderNo: "",
    vendorCode: "",
    vendorName: "",
    poDate: "",
    dueDate: "",
    documentDetails: "", // This might be used for general document notes
    vendorRefNumber: "",
    payToAddress: "",
    purchaseRemarks: "",
    uploadedFiles: [], // MODIFIED: Store an array of files
  });

  const initialEmptyItem = (id) => ({
    id: id,
    productCode: "",
    productName: "",
    quantity: "",
    uom: "",
    price: "",
    stockLocation: "",
    taxCode: "",
    taxPrice: "",
    total: "",
    showProductCodeLookup: false,
    showProductNameLookup: false,
    showTaxLookup: false,
  });

  const [purchaseItems, setPurchaseItems] = useState([
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
    const files = Array.from(e.target.files); // Convert FileList to Array
    if (files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        // Append new files to existing ones, or replace if you prefer that behavior
        // For appending:
        uploadedFiles: [...prev.uploadedFiles, ...files],
        // For replacing:
        // uploadedFiles: files,
      }));
      console.log(
        "Selected files:",
        files.map((f) => f.name)
      );
    }
    // It's important to clear the input value so the onChange event fires
    // even if the same file(s) are selected again after removing some.
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (fileNameToRemove) => {
    setFormData((prev) => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter(
        (file) => file.name !== fileNameToRemove
      ),
    }));
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleItemChange = (e, itemId, fieldName) => {
    const { value } = e.target;
    setPurchaseItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, [fieldName]: value } : item
      )
    );
    if (
      fieldName === "quantity" ||
      fieldName === "price" ||
      fieldName === "taxPrice" // Assuming taxPrice is the direct tax amount
    ) {
      calculateItemTotal(itemId); // Recalculate based on current item state
    }
  };

  // Simplified calculateItemTotal, assumes values are already in the item object
  const calculateItemTotal = (itemId) => {
    setPurchaseItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          const numQuantity = parseFloat(item.quantity) || 0;
          const numPrice = parseFloat(item.price) || 0;
          const numTaxPrice = parseFloat(item.taxPrice) || 0; // Use taxPrice directly

          // Total for one item = (Quantity * Price) + Tax Amount for that item
          // If taxPrice is a rate, the calculation would be:
          // const taxAmount = (numQuantity * numPrice) * (numTaxRate / 100);
          // const calculatedTotal = (numQuantity * numPrice) + taxAmount;
          // Assuming taxPrice IS the tax amount for the item:
          const calculatedTotal = numQuantity * numPrice + numTaxPrice;

          return { ...item, total: calculatedTotal.toFixed(2) };
        }
        return item;
      })
    );
  };

  const toggleLookupIndicator = (itemId, fieldName, show) => {
    setPurchaseItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          const lookupsToShow = {
            showProductCodeLookup: false,
            showProductNameLookup: false,
            showTaxLookup: false, // General tax lookup, or remove if taxCode/taxPrice are separate
          };
          // Dynamically set the specific lookup field to true
          if (fieldName === "ProductCode")
            lookupsToShow.showProductCodeLookup = show;
          else if (fieldName === "ProductName")
            lookupsToShow.showProductNameLookup = show;
          else if (fieldName === "taxCode" || fieldName === "taxPrice")
            lookupsToShow.showTaxLookup = show; // Or specific ones

          return { ...item, ...lookupsToShow };
        }
        // Hide lookups in other rows when a new one is focused/blurred
        return {
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
    // Implement your lookup logic here (e.g., open modal)
    // For now, just hide the indicator
    // Note: The specific lookup state (e.g., showProductCodeLookup) will be set to false by onBlur
    // or when another lookup is focused. So, we might not need to explicitly hide it here
    // unless the modal interaction doesn't trigger blur.
  };

  const handleSave = () => {
    const dataToSend = new FormData(); // Use a different variable name to avoid confusion with component's formData state

    // Append non-file formData fields
    for (const key in formData) {
      if (key !== "uploadedFiles" && formData[key] !== null) {
        dataToSend.append(key, formData[key]);
      }
    }

    // Append each uploaded file
    // The backend will receive these as multiple form parts with the same key "uploadedFiles"
    if (formData.uploadedFiles && formData.uploadedFiles.length > 0) {
      formData.uploadedFiles.forEach((file) => {
        dataToSend.append("uploadedFiles", file, file.name); // Key can be e.g., "attachments[]" or just "attachments"
      });
    }

    const validPurchaseItems = purchaseItems.filter(
      (item) =>
        item.productCode || item.productName || item.quantity || item.price
    );
    dataToSend.append("purchaseItems", JSON.stringify(validPurchaseItems));

    console.log("Saving new purchase order data (FormData entries):");
    for (let [key, value] of dataToSend.entries()) {
      if (value instanceof File) {
        console.log(key, value.name, value.type, value.size);
      } else {
        console.log(key, value);
      }
    }
    // navigate('/purchases'); // Uncomment when API call is ready
  };

  const handleCancel = () => {
    navigate("/purchaseorder");
  };

  const handleAddItemRow = () => {
    setPurchaseItems((prevItems) => [
      ...prevItems,
      initialEmptyItem(
        prevItems.length > 0 ? Math.max(...prevItems.map((i) => i.id)) + 1 : 1
      ),
    ]);
  };

  // Calculate totals for summary (basic example)
  const productTotalSummary = purchaseItems
    .reduce(
      (sum, item) =>
        sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0),
      0
    )
    .toFixed(2);
  const taxTotalSummary = purchaseItems
    .reduce((sum, item) => sum + (parseFloat(item.taxPrice) || 0), 0)
    .toFixed(2);
  const grandTotalSummary = purchaseItems
    .reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0)
    .toFixed(2);

  return (
    <div className="detail-page-container">
      {/* Top Header Bar */}
      <div className="detail-page-header-bar">
        <h1 className="detail-page-main-title">Create Purchase Order</h1>
      </div>

      {/* New Purchase Info Header */}
      <div className="record-entry-header">
        <div className="entry-header-column">
          {/* Vendor Code, Name, Ref No, Pay to Address, Remarks */}
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
            <label htmlFor="payToAddress">Pay to Address :</label>
            <textarea // Changed to textarea for more space
              id="payToAddress"
              name="payToAddress"
              className="form-textarea-styled" // Use textarea specific style
              rows="2"
              value={formData.payToAddress}
              onChange={handleInputChange}
            />
          </div>

          <div className="entry-header-field">
            <label htmlFor="purchaseRemarks">Remarks :</label>
            <textarea // Changed to textarea
              id="purchaseRemarks"
              name="purchaseRemarks"
              className="form-textarea-styled" // Use textarea specific style
              rows="2"
              value={formData.purchaseRemarks}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="entry-header-column">
          {/* PO Number, PO Date, Due Date, Attachment */}
          <div className="entry-header-field">
            <label htmlFor="purchaseOrderNo">PO Number :</label>
            <input
              type="text"
              id="purchaseOrderNo"
              name="purchaseOrderNo"
              className="form-input-styled"
              value={formData.purchaseOrderNo}
              onChange={handleInputChange}
            />
          </div>
          <div className="entry-header-field">
            <label htmlFor="poDate">PO Date :</label>
            <input
              type="date"
              id="poDate"
              name="poDate"
              className="form-input-styled"
              value={formData.poDate}
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
            <label htmlFor="uploadImageFile">Attachment(s) :</label>
            <input
              type="file"
              id="uploadImageFile"
              name="uploadImageFile" // This name doesn't matter much when using ref
              ref={fileInputRef}
              className="form-input-file-hidden"
              onChange={handleFileInputChange}
              accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt" // Specify accepted file types
              multiple // MODIFIED: Allow multiple file selection
            />
            <button
              type="button"
              className="browse-files-btn"
              onClick={handleBrowseClick}
            >
              Browse files
            </button>
            {/* MODIFIED: Display multiple file names */}
            {formData.uploadedFiles.length > 0 && (
              <div className="file-names-display-area">
                {formData.uploadedFiles.map((file, index) => (
                  <div key={index} className="file-name-entry">
                    <span className="file-name-display">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file.name)}
                      className="remove-file-btn"
                      title="Remove file"
                    >
                      × {/* Simple 'x' for remove */}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Details Table Section */}
      <div className="detail-form-content-area">
        <div className="purchase-order-items-section">
          <div className="product-details-header">
            <h3 className="form-section-title">Product Details</h3>
            <button
              type="button"
              className="add-item-row-btn" // You'll need to style this button
              onClick={handleAddItemRow}
            >
              + Add Row
            </button>
          </div>
          <div className="table-responsive-container">
            <table className="po-items-table">
              <thead>
                <tr>
                  <th>Product Code</th>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>UOM</th>
                  <th>Price</th>
                  <th>Stock Location</th>
                  <th>Tax Code</th>
                  <th>Tax Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {purchaseItems.map((item) => (
                  <tr key={item.id}>
                    <td className="editable-cell product-code-cell">
                      <input
                        type="text"
                        className="po-table-input"
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
                              !document.activeElement?.classList.contains(
                                "po-lookup-indicator"
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
                          className="po-lookup-indicator"
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
                        className="po-table-input"
                        value={item.productName}
                        onChange={(e) =>
                          handleItemChange(e, item.id, "productName")
                        }
                        onFocus={() =>
                          toggleLookupIndicator(item.id, "ProductName", true)
                        }
                        onBlur={() =>
                          setTimeout(() => {
                            if (
                              !document.activeElement?.classList.contains(
                                "po-lookup-indicator"
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
                          className="po-lookup-indicator"
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
                      <input
                        type="number"
                        className="po-table-input po-quantity-input"
                        value={item.quantity}
                        min="0" // Prevent negative quantities
                        onChange={(e) =>
                          handleItemChange(e, item.id, "quantity")
                        }
                        onBlur={() =>
                          toggleLookupIndicator(
                            item.id,
                            "anyFieldToHideAll",
                            false
                          )
                        }
                      />
                    </td>
                    <td className="editable-cell">
                      <input
                        type="text"
                        className="po-table-input po-uom-input"
                        value={item.uom}
                        onChange={(e) => handleItemChange(e, item.id, "uom")}
                        onBlur={() =>
                          toggleLookupIndicator(
                            item.id,
                            "anyFieldToHideAll",
                            false
                          )
                        }
                      />
                    </td>
                    <td className="editable-cell">
                      <input
                        type="number"
                        className="po-table-input po-price-input"
                        value={item.price}
                        step="0.01"
                        min="0" // Prevent negative prices
                        onChange={(e) => handleItemChange(e, item.id, "price")}
                        onBlur={() =>
                          toggleLookupIndicator(
                            item.id,
                            "anyFieldToHideAll",
                            false
                          )
                        }
                      />
                    </td>
                    <td className="editable-cell">
                      <input
                        type="text"
                        className="po-table-input"
                        value={item.stockLocation}
                        onChange={(e) =>
                          handleItemChange(e, item.id, "stockLocation")
                        }
                        onBlur={() =>
                          toggleLookupIndicator(
                            item.id,
                            "anyFieldToHideAll",
                            false
                          )
                        }
                      />
                    </td>
                    <td className="editable-cell tax-cell">
                      <input
                        type="text" // Changed to text to allow % or fixed value input
                        className="po-table-input po-tax-input"
                        value={item.taxCode}
                        onChange={(e) =>
                          handleItemChange(e, item.id, "taxCode")
                        }
                        onFocus={() =>
                          toggleLookupIndicator(item.id, "taxCode", true)
                        }
                        onBlur={() =>
                          setTimeout(() => {
                            if (
                              !document.activeElement?.classList.contains(
                                "po-lookup-indicator"
                              )
                            ) {
                              toggleLookupIndicator(item.id, "taxCode", false);
                            }
                          }, 150)
                        }
                      />
                      {item.showTaxLookup && ( // Assuming one general tax lookup state
                        <button
                          type="button"
                          className="po-lookup-indicator"
                          onClick={() => handleLookupClick(item.id, "taxCode")}
                          title="Lookup Tax"
                        >
                          <LookupIcon />
                        </button>
                      )}
                    </td>
                    <td className="editable-cell">
                      {" "}
                      {/* Tax Price - direct amount */}
                      <input
                        type="number"
                        className="po-table-input po-tax-input"
                        value={item.taxPrice}
                        step="0.01"
                        min="0"
                        onChange={(e) =>
                          handleItemChange(e, item.id, "taxPrice")
                        }
                        onBlur={() =>
                          toggleLookupIndicator(
                            item.id,
                            "anyFieldToHideAll",
                            false
                          )
                        }
                      />
                    </td>

                    <td className="total-cell">{item.total || "0.00"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="tax-summary-container">
            <div className="summary-item">
              <label htmlFor="quantityTotalSummary" className="summary-label">
                Product Total :
              </label>
              <input
                type="text"
                id="quantityTotalSummary"
                className="summary-input"
                readOnly
                value={productTotalSummary}
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
                readOnly
                value={taxTotalSummary}
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
                readOnly
                value={grandTotalSummary}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Page Footer Actions (Sticky) */}
      <div className="detail-page-footer">
        <div className="footer-actions-main">
          <button className="footer-btn primary" onClick={handleSave}>
            Add
          </button>
          <button className="footer-btn secondary">Remove</button>{" "}
          {/* This button's functionality isn't implemented */}
        </div>
        <button className="footer-btn secondary" onClick={handleCancel}>
          {" "}
          {/* Changed to secondary for typical cancel styling */}
          Cancel
        </button>
      </div>
    </div>
  );
}

export default PurchaseAdd;
