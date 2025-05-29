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

function PurchaseAdd() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    purchaseOrderNo: "",
    vendorCode: "",
    vendorName: "",
    poDate: "",
    dueDate: "",
    documentDetails: "",
    vendorRefNumber: "",
    payToAddress: "",
    purchaseRemarks: "",
    uploadedFile: null,
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
    setPurchaseItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, [fieldName]: value } : item
      )
    );
    if (
      fieldName === "quantity" ||
      fieldName === "price" ||
      fieldName === "tax"
    ) {
      calculateItemTotal(itemId, value, fieldName);
    }
  };

  const calculateItemTotal = (itemId, currentValue, fieldName) => {
    setPurchaseItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          let { quantity, price, tax } = item;
          if (fieldName === "quantity") quantity = currentValue;
          if (fieldName === "price") price = currentValue;
          if (fieldName === "tax") tax = currentValue;

          const numQuantity = parseFloat(quantity) || 0;
          const numPrice = parseFloat(price) || 0;
          const numTax = parseFloat(tax) || 0;

          const calculatedTotal = numQuantity * numPrice + numTax;
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
        // Hide lookups in other rows when a new one is focused
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
    const validPurchaseItems = purchaseItems.filter(
      (item) =>
        item.productCode || item.productName || item.quantity || item.price
    );
    dataToSave.append("purchaseItems", JSON.stringify(validPurchaseItems));

    console.log("Saving new purchase order data:");
    for (let [key, value] of dataToSave.entries()) {
      console.log(key, value);
    }
    // navigate('/purchases');
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

  return (
    <div className="detail-page-container">
      {/* Top Header Bar */}
      <div className="detail-page-header-bar">
        <h1 className="detail-page-main-title">Create Purchase Order</h1>
      </div>

      {/* New Purchase Info Header */}
      <div className="record-entry-header">
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
            <label htmlFor="payToAddress">Pay to Address :</label>
            <input
              type="text"
              id="payToAddress"
              name="payToAddress"
              className="form-input-styled"
              value={formData.payToAddress}
              onChange={handleInputChange}
            />
          </div>

          <div className="entry-header-field">
            <label htmlFor="purchaseRemarks">Remarks :</label>
            <input
              type="text"
              id="purchaseRemarks"
              name="purchaseRemarks"
              className="form-input-styled"
              value={formData.purchaseRemarks}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="entry-header-column">
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
            <label htmlFor="uploadImageFile">Upload Image :</label>
            <input
              type="file"
              id="uploadImageFile"
              name="uploadImageFile"
              ref={fileInputRef}
              className="form-input-file-hidden"
              onChange={handleFileInputChange}
              accept="image/*"
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

      {/* Product Details Table Section */}
      <div className="detail-form-content-area">
        <div className="purchase-order-items-section">
          {" "}
          {/* Wrapper for PO table styles */}
          <div className="product-details-header">
            <h3 className="form-section-title">Product Details</h3>
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
                            // Delay to allow click on indicator
                            if (
                              !document.activeElement.classList.contains(
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
                              !document.activeElement.classList.contains(
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
                        type="number"
                        className="po-table-input po-tax-input"
                        value={item.taxCode}
                        step="0.01"
                        onChange={(e) =>
                          handleItemChange(e, item.id, "taxCode")
                        }
                        onFocus={() =>
                          toggleLookupIndicator(item.id, "taxCode", true)
                        }
                        onBlur={() =>
                          setTimeout(() => {
                            if (
                              !document.activeElement.classList.contains(
                                "po-lookup-indicator"
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
                          className="po-lookup-indicator"
                          onClick={() => handleLookupClick(item.id, "taxCode")}
                          title="Lookup Tax Rate/Amount"
                        >
                          <LookupIcon />
                        </button>
                      )}
                    </td>
                    <td className="editable-cell tax-cell">
                      <input
                        type="number"
                        className="po-table-input po-tax-input"
                        value={item.taxPrice}
                        step="0.01"
                        onChange={(e) =>
                          handleItemChange(e, item.id, "taxPrice")
                        }
                        onFocus={() =>
                          toggleLookupIndicator(item.id, "taxPrice", true)
                        }
                        onBlur={() =>
                          setTimeout(() => {
                            if (
                              !document.activeElement.classList.contains(
                                "po-lookup-indicator"
                              )
                            ) {
                              toggleLookupIndicator(item.id, "taxPrice", false);
                            }
                          }, 150)
                        }
                      />
                      {item.showTaxLookup && (
                        <button
                          type="button"
                          className="po-lookup-indicator"
                          onClick={() => handleLookupClick(item.id, "taxPrice")}
                          title="Lookup Tax Rate/Amount"
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
          {/* Inside your detail-form-content-area -> purchase-order-items-section, after the table-responsive-container */}
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
        </div>
      </div>

      {/* Page Footer Actions (Sticky) */}
      <div className="detail-page-footer">
        <div className="footer-actions-main">
          <button className="footer-btn primary" onClick={handleSave}>
            Add
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

export default PurchaseAdd;
