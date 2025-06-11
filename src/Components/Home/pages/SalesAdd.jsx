import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./SalesAdd.css"; // Import the NEW CSS

// Placeholder for a lookup icon
const LookupIcon = () => (
  <span className="lookup-indicator-icon" title="Lookup value">
    ○{" "}
  </span>
);

// Icons can be kept as is or moved to a shared file

function SalesAdd() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    salesOrderNo: "",
    customerCode: "",
    customerName: "",
    soDate: "",
    deliveryDate: "",
    documentDetails: "",
    customerRefNumber: "",
    shipToAddress: "",
    salesRemarks: "",
    salesEmployee: "",
    uploadedFiles: [], // MODIFIED: Store an array of files
  });

  const initialEmptyItem = (id) => ({
    id: id,
    productCode: "",
    productName: "",
    quantity: "",
    uom: "",
    price: "",
    warehouseLocation: "",
    taxCode: "",
    taxPrice: "",
    total: "",
    showProductCodeLookup: false,
    showProductNameLookup: false,
    showTaxLookup: false,
  });

  const [salesItems, setSalesItems] = useState([
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
        // Append new files to existing ones
        uploadedFiles: [...prev.uploadedFiles, ...files],
      }));
      console.log(
        "Selected files:",
        files.map((f) => f.name)
      );
    }
    // Reset file input to allow re-selection of the same file(s)
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
    setSalesItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, [fieldName]: value } : item
      )
    );
    if (
      fieldName === "quantity" ||
      fieldName === "price" ||
      fieldName === "taxPrice" // Assuming taxPrice is the direct tax amount
    ) {
      calculateItemTotal(itemId);
    }
  };

  const calculateItemTotal = (itemId) => {
    setSalesItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          const numQuantity = parseFloat(item.quantity) || 0;
          const numPrice = parseFloat(item.price) || 0;
          const numTaxPrice = parseFloat(item.taxPrice) || 0;
          const calculatedTotal = numQuantity * numPrice + numTaxPrice;
          return { ...item, total: calculatedTotal.toFixed(2) };
        }
        return item;
      })
    );
  };

  const toggleLookupIndicator = (itemId, fieldName, show) => {
    setSalesItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          const lookupsToShow = {
            showProductCodeLookup: false,
            showProductNameLookup: false,
            showTaxLookup: false,
          };
          if (fieldName === "ProductCode")
            lookupsToShow.showProductCodeLookup = show;
          else if (fieldName === "ProductName")
            lookupsToShow.showProductNameLookup = show;
          else if (fieldName === "taxCode" || fieldName === "taxPrice")
            lookupsToShow.showTaxLookup = show;
          return { ...item, ...lookupsToShow };
        }
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
    // Future: Implement lookup modal logic
  };

  const handleSave = () => {
    const dataToSend = new FormData();

    for (const key in formData) {
      if (key !== "uploadedFiles" && formData[key] !== null) {
        dataToSend.append(key, formData[key]);
      }
    }

    if (formData.uploadedFiles && formData.uploadedFiles.length > 0) {
      formData.uploadedFiles.forEach((file) => {
        dataToSend.append("uploadedFiles", file, file.name); // Key for backend to receive multiple files
      });
    }

    const validSalesItems = salesItems.filter(
      (item) =>
        item.productCode || item.productName || item.quantity || item.price
    );
    dataToSend.append("salesItems", JSON.stringify(validSalesItems));

    console.log("Saving new sales order data (FormData entries):");
    for (let [key, value] of dataToSend.entries()) {
      if (value instanceof File) {
        console.log(key, value.name, value.type, value.size);
      } else {
        console.log(key, value);
      }
    }
    // navigate('/sales'); // Uncomment when API is ready
  };

  const handleCancel = () => {
    navigate("/salesorder");
  };

  const handleAddItemRow = () => {
    setSalesItems((prevItems) => [
      ...prevItems,
      initialEmptyItem(
        prevItems.length > 0 ? Math.max(...prevItems.map((i) => i.id)) + 1 : 1
      ),
    ]);
  };

  // Calculate totals for summary
  const productTotalSummary = salesItems
    .reduce(
      (sum, item) =>
        sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0),
      0
    )
    .toFixed(2);
  const taxTotalSummary = salesItems
    .reduce((sum, item) => sum + (parseFloat(item.taxPrice) || 0), 0)
    .toFixed(2);
  const grandTotalSummary = salesItems
    .reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0)
    .toFixed(2);

  return (
    <div className="detail-page-container">
      <div className="detail-page-header-bar">
        <h1 className="detail-page-main-title">Create Sales Order</h1>
      </div>

      <div className="sales-order-add__form-header">
        {" "}
        {/* Or reuse "record-entry-header" */}
        <div className="entry-header-column">
          <div className="entry-header-field">
            <label htmlFor="customerCode">Customer Code :</label>
            <input
              type="text"
              id="customerCode"
              name="customerCode"
              className="form-input-styled"
              value={formData.customerCode}
              onChange={handleInputChange}
            />
          </div>
          <div className="entry-header-field">
            <label htmlFor="customerName">Customer Name :</label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              className="form-input-styled"
              value={formData.customerName}
              onChange={handleInputChange}
            />
          </div>
          <div className="entry-header-field">
            <label htmlFor="customerRefNumber">Customer Ref No :</label>
            <input
              type="text"
              id="customerRefNumber"
              name="customerRefNumber"
              className="form-input-styled"
              value={formData.customerRefNumber}
              onChange={handleInputChange}
            />
          </div>
          <div className="entry-header-field">
            <label htmlFor="shipToAddress">Bill to Address :</label>
            <textarea // Changed for potentially longer address
              id="shipToAddress"
              name="shipToAddress"
              className="form-textarea-styled" // Use specific style for textarea
              rows="2"
              value={formData.shipToAddress}
              onChange={handleInputChange}
            />
          </div>
          <div className="entry-header-field">
            <label htmlFor="salesRemarks">Remarks :</label>
            <textarea // Changed for remarks
              id="salesRemarks"
              name="salesRemarks"
              className="form-textarea-styled"
              rows="2"
              value={formData.salesRemarks}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="entry-header-column">
          <div className="entry-header-field">
            <label htmlFor="salesOrderNo">S.O Number :</label>
            <input
              type="text"
              id="salesOrderNo"
              name="salesOrderNo"
              className="form-input-styled"
              value={formData.salesOrderNo}
              onChange={handleInputChange}
            />
          </div>
          <div className="entry-header-field">
            <label htmlFor="soDate">S.O Date :</label>
            <input
              type="date"
              id="soDate"
              name="soDate"
              className="form-input-styled"
              value={formData.soDate}
              onChange={handleInputChange}
            />
          </div>
          <div className="entry-header-field">
            <label htmlFor="deliveryDate">Due Date :</label>
            <input
              type="date"
              id="deliveryDate"
              name="deliveryDate"
              className="form-input-styled"
              value={formData.deliveryDate}
              onChange={handleInputChange}
            />
          </div>
          <div className="entry-header-field">
            <label htmlFor="salesEmployee">Sales Employee :</label>
            <input
              type="text"
              id="salesEmployee"
              name="salesEmployee"
              className="form-input-styled"
              value={formData.salesEmployee}
              onChange={handleInputChange}
            />
          </div>
          <div className="entry-header-field file-input-container">
            <label htmlFor="uploadFilesInput">Attachment(s) :</label>
            <input
              type="file"
              id="uploadFilesInput" // Unique ID for file input
              ref={fileInputRef}
              className="form-input-file-hidden"
              onChange={handleFileInputChange}
              accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
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
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="detail-form-content-area">
        <div className="sales-order-add__items-section">
          <div className="product-details-header">
            <h3 className="form-section-title">Product Details</h3>
            <button
              type="button"
              className="add-item-row-btn"
              onClick={handleAddItemRow}
            >
              + Add Row
            </button>
          </div>
          <div className="table-responsive-container">
            <table className="so-add__items-table">
              <thead>
                <tr>
                  <th>Product Code</th>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>UOM</th>
                  <th>Price</th>
                  <th>Warehouse</th> {/* Changed from Stock Location */}
                  <th>Tax Code</th>
                  <th>Tax Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {salesItems.map((item) => (
                  <tr key={item.id}>
                    <td className="editable-cell product-code-cell">
                      <input
                        type="text"
                        className="so-add__table-input"
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
                                "so-add__lookup-indicator"
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
                          className="so-add__lookup-indicator"
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
                        className="so-add__table-input"
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
                                "so-add__lookup-indicator"
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
                          className="so-add__lookup-indicator"
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
                        className="so-add__table-input so-add__quantity-input"
                        value={item.quantity}
                        min="0"
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
                        className="so-add__table-input so-add__uom-input"
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
                        className="so-add__table-input so-add__price-input"
                        value={item.price}
                        step="0.01"
                        min="0"
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
                        className="so-add__table-input"
                        value={item.warehouseLocation}
                        onChange={(e) =>
                          handleItemChange(e, item.id, "warehouseLocation")
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
                        type="text"
                        className="so-add__table-input so-add__tax-input"
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
                                "so-add__lookup-indicator"
                              )
                            ) {
                              toggleLookupIndicator(item.id, "taxCode", false);
                            }
                          }, 150)
                        }
                      />
                      {item.showTaxLookup && (
                        <button
                          type="button"
                          className="so-add__lookup-indicator"
                          onClick={() => handleLookupClick(item.id, "taxCode")}
                          title="Lookup Tax"
                        >
                          <LookupIcon />
                        </button>
                      )}
                    </td>
                    <td className="editable-cell">
                      <input
                        type="number"
                        className="so-add__table-input so-add__tax-input" // Re-use tax input style
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
              <label htmlFor="productTotalSummary" className="summary-label">
                Product Total :
              </label>
              <input
                type="text"
                id="productTotalSummary"
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

      <div className="detail-page-footer">
        <div className="footer-actions-main">
          <button className="footer-btn primary" onClick={handleSave}>
            Add Sales Order
          </button>
          <button className="footer-btn secondary">Remove</button>
        </div>
        <button className="footer-btn secondary" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default SalesAdd;
