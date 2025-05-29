import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./SalesAdd.css"; // Import the NEW CSS

// Placeholder for a lookup icon
const LookupIcon = () => (
  <span className="lookup-indicator-icon" title="Lookup value">
    ○{" "}
    {/* Unicode white circle - you used ○ which is fine, just being consistent */}
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

function SalesAdd() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    salesOrderNo: "", // Changed from purchaseOrderNo
    customerCode: "", // Changed from vendorCode
    customerName: "", // Changed from vendorName
    soDate: "", // Changed from poDate
    deliveryDate: "", // Changed from dueDate
    documentDetails: "", // Can remain generic
    customerRefNumber: "", // Changed from vendorRefNumber
    shipToAddress: "", // Changed from payToAddress (more common for Sales)
    salesRemarks: "", // Changed from purchaseRemarks
    salesEmployee: "", // Changed from purchaseEmployee
    uploadedFile: null,
  });

  const initialEmptyItem = (id) => ({
    id: id,
    productCode: "",
    productName: "",
    quantity: "",
    uom: "",
    price: "",
    warehouseLocation: "", // Changed from stockLocation (can be more specific for sales context)
    taxCode: "",
    taxPrice: "",
    total: "",
    showProductCodeLookup: false,
    showProductNameLookup: false,
    showTaxLookup: false,
  });

  const [salesItems, setSalesItems] = useState([
    // Changed from purchaseItems
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
    setSalesItems(
      (
        prevItems // Changed from setPurchaseItems
      ) =>
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
    setSalesItems(
      (
        prevItems // Changed from setPurchaseItems
      ) =>
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
    setSalesItems(
      (
        prevItems // Changed from setPurchaseItems
      ) =>
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
    const validSalesItems = salesItems.filter(
      // Changed from purchaseItems
      (item) =>
        item.productCode || item.productName || item.quantity || item.price
    );
    dataToSave.append("salesItems", JSON.stringify(validSalesItems)); // Changed key

    console.log("Saving new sales order data:");
    for (let [key, value] of dataToSave.entries()) {
      console.log(key, value);
    }
    // navigate('/sales'); // Navigate to sales overview or confirmation
  };

  const handleCancel = () => {
    navigate("/salesorder"); // Navigate to sales overview
  };

  const handleAddItemRow = () => {
    setSalesItems((prevItems) => [
      // Changed from setPurchaseItems
      ...prevItems,
      initialEmptyItem(
        prevItems.length > 0 ? Math.max(...prevItems.map((i) => i.id)) + 1 : 1
      ),
    ]);
  };

  return (
    <div className="detail-page-container">
      {" "}
      {/* This can remain generic */}
      {/* Top Header Bar */}
      <div className="detail-page-header-bar">
        <h1 className="detail-page-main-title">Create Sales Order</h1>{" "}
        {/* Changed Title */}
      </div>
      {/* New Sales Info Header */}
      {/* Using sales-order-add__ prefix for unique form styling if needed, or reuse record-entry-header */}
      <div className="sales-order-add__form-header">
        {" "}
        {/* Or reuse "record-entry-header" if styles are identical */}
        <div className="entry-header-column">
          {" "}
          {/* Generic column class */}
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
            <input
              type="text"
              id="shipToAddress"
              name="shipToAddress"
              className="form-input-styled"
              value={formData.shipToAddress}
              onChange={handleInputChange}
            />
          </div>
          <div className="entry-header-field">
            <label htmlFor="salesRemarks">Remarks :</label>
            <input
              type="text"
              id="salesRemarks"
              name="salesRemarks"
              className="form-input-styled"
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
            <label htmlFor="uploadImageFile">Attachment :</label>{" "}
            {/* Changed label slightly */}
            <input
              type="file"
              id="uploadImageFile"
              name="uploadImageFile"
              ref={fileInputRef}
              className="form-input-file-hidden"
              onChange={handleFileInputChange}
              // accept="image/*" // Keep if only images, or remove/change for general docs
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
        {" "}
        {/* This can remain generic */}
        <div className="sales-order-add__items-section">
          {" "}
          {/* Specific wrapper for SO table styles */}
          <div className="product-details-header">
            {" "}
            {/* Generic class */}
            <h3 className="form-section-title">Product Details</h3>{" "}
            {/* Generic class */}
          </div>
          <div className="table-responsive-container">
            {" "}
            {/* Generic class */}
            <table className="so-add__items-table">
              {" "}
              {/* Unique table class: so-add__items-table */}
              <thead>
                <tr>
                  <th>Product Code</th>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>UOM</th>
                  <th>Price</th>
                  <th>Stock Location</th> {/* Changed from Stock Location */}
                  <th>Tax Code</th>
                  <th>Tax Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {salesItems.map(
                  (
                    item // Changed from purchaseItems
                  ) => (
                    <tr key={item.id}>
                      <td className="editable-cell product-code-cell">
                        <input
                          type="text"
                          className="so-add__table-input" /* Unique input class */
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
                                  "so-add__lookup-indicator" /* Unique lookup class */
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
                            className="so-add__lookup-indicator" /* Unique lookup class */
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
                          className="so-add__table-input" /* Unique input class */
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
                                  "so-add__lookup-indicator" /* Unique lookup class */
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
                            className="so-add__lookup-indicator" /* Unique lookup class */
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
                          className="so-add__table-input so-add__quantity-input" /* Unique input class */
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
                          className="so-add__table-input so-add__uom-input" /* Unique input class */
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
                          className="so-add__table-input so-add__price-input" /* Unique input class */
                          value={item.price}
                          step="0.01"
                          onChange={(e) =>
                            handleItemChange(e, item.id, "price")
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
                          className="so-add__table-input" /* Unique input class */
                          value={item.warehouseLocation} // Changed from stockLocation
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
                          type="number"
                          className="so-add__table-input so-add__tax-input" /* Unique input class */
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
                                  "so-add__lookup-indicator" /* Unique lookup class */
                                )
                              ) {
                                toggleLookupIndicator(
                                  item.id,
                                  "TaxCode",
                                  false
                                );
                              }
                            }, 150)
                          }
                        />
                        {item.showTaxLookup && (
                          <button
                            type="button"
                            className="so-add__lookup-indicator" /* Unique lookup class */
                            onClick={() =>
                              handleLookupClick(item.id, "TaxCode")
                            }
                            title="Lookup Tax Rate/Amount"
                          >
                            <LookupIcon />
                          </button>
                        )}
                      </td>

                      <td className="editable-cell tax-cell">
                        <input
                          type="number"
                          className="so-add__table-input so-add__tax-input" /* Unique input class */
                          value={item.taxPrice}
                          step="0.01"
                          onChange={(e) =>
                            handleItemChange(e, item.id, "taxPrice")
                          }
                          onFocus={() =>
                            toggleLookupIndicator(item.id, "TaxPrice", true)
                          }
                          onBlur={() =>
                            setTimeout(() => {
                              if (
                                !document.activeElement.classList.contains(
                                  "so-add__lookup-indicator" /* Unique lookup class */
                                )
                              ) {
                                toggleLookupIndicator(
                                  item.id,
                                  "TaxPrice",
                                  false
                                );
                              }
                            }, 150)
                          }
                        />
                        {item.showTaxLookup && (
                          <button
                            type="button"
                            className="so-add__lookup-indicator" /* Unique lookup class */
                            onClick={() =>
                              handleLookupClick(item.id, "TaxPrice")
                            }
                            title="Lookup Tax Rate/Amount"
                          >
                            <LookupIcon />
                          </button>
                        )}
                      </td>
                      <td className="total-cell">{item.total || "0.00"}</td>
                    </tr>
                  )
                )}
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
        </div>
      </div>
      {/* Page Footer Actions (Sticky) */}
      <div className="detail-page-footer">
        {" "}
        {/* This can remain generic */}
        <div className="footer-actions-main">
          <button className="footer-btn primary" onClick={handleSave}>
            Add Sales Order {/* Changed Button Text */}
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

export default SalesAdd;
