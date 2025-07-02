import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./PurchaseAdd.css";
import {
  API_PRODUCTS_ENDPOINT,
  API_BASE_URL,
  API_UOM_ENDPOINT,
  API_WAREHOUSE_ENDPOINT,
} from "../../../config";

// --- Reusable Components ---
const MessageModal = ({ message, onClose, type = "info" }) => {
  if (!message) return null;
  return (
    <div className="po-add-modal-overlay">
      <div className={`po-add-modal-content ${type}`}>
        <p style={{ whiteSpace: "pre-line" }}>{message}</p>
        <button onClick={onClose} className="po-add-modal-close-button">
          OK
        </button>
      </div>
    </div>
  );
};
const LookupIcon = () => (
  <span className="lookup-indicator-icon" title="Lookup value">
    ○
  </span>
);
const DeleteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
    title="Remove Item"
  >
    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
  </svg>
);

function PurchaseAdd() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const initialFormDataState = {
    purchaseOrderNo: "",
    vendorCode: "",
    vendorName: "",
    poDate: new Date().toISOString().split("T")[0],
    deliveryDate: "",
    vendorRefNumber: "",
    shipToAddress: "",
    purchaseRemarks: "",
    uploadedFiles: [],
  };
  const [formData, setFormData] = useState(initialFormDataState);
  const initialEmptyItem = (id) => ({
    id,
    productCode: "",
    productName: "",
    quantity: "1",
    uom: "",
    price: "",
    warehouseLocation: "",
    taxCode: "",
    taxPrice: "0",
    total: "0.00",
  });
  const [purchaseItems, setPurchaseItems] = useState([
    initialEmptyItem(Date.now()),
  ]);
  const [modalState, setModalState] = useState({
    message: "",
    type: "info",
    isActive: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [allProducts, setAllProducts] = useState([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productModalTargetId, setProductModalTargetId] = useState(null);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [allVendors, setAllVendors] = useState([]);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [vendorSearchTerm, setVendorSearchTerm] = useState("");
  const [activeTaxCodes, setActiveTaxCodes] = useState([]);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [taxModalTargetId, setTaxModalTargetId] = useState(null);
  const [taxSearchTerm, setTaxSearchTerm] = useState("");
  const [allUOMs, setAllUOMs] = useState([]);
  const [isUOMModalOpen, setIsUOMModalOpen] = useState(false);
  const [uomModalTargetId, setUOMModalTargetId] = useState(null);
  const [uomSearchTerm, setUomSearchTerm] = useState("");
  const [allWarehouses, setAllWarehouses] = useState([]);
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [warehouseModalTargetId, setWarehouseModalTargetId] = useState(null);
  const [warehouseSearchTerm, setWarehouseSearchTerm] = useState("");

  const showAppModal = (message, type = "info") =>
    setModalState({ message, type, isActive: true });
  const closeAppModal = () => {
    const wasSuccess = modalState.type === "success";
    setModalState({ message: "", type: "info", isActive: false });
    if (wasSuccess)
      navigate("/purchaseorder", { state: { refreshPurchaseOrders: true } });
  };

  const fetchDataForLookups = useCallback(
    async (endpoint, setData, resourceName) => {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`${resourceName} API Error`);
        const data = await response.json();
        setData(
          data.filter ? data.filter((item) => item.isActive !== false) : data
        );
      } catch (error) {
        showAppModal(
          `Error loading ${resourceName}: ${error.message}`,
          "error"
        );
      }
    },
    []
  );

  useEffect(() => {
    fetchDataForLookups(API_PRODUCTS_ENDPOINT, setAllProducts, "Products");
    fetchDataForLookups(`${API_BASE_URL}/Vendor`, setAllVendors, "Vendors");
    fetchDataForLookups(
      `${API_BASE_URL}/TaxDeclarations`,
      setActiveTaxCodes,
      "Tax Codes"
    );
    fetchDataForLookups(API_UOM_ENDPOINT, setAllUOMs, "UOMs");
    fetchDataForLookups(API_WAREHOUSE_ENDPOINT, setAllWarehouses, "Warehouses");
  }, [fetchDataForLookups]);

  const updateItemTaxAndTotal = useCallback(
    (itemIdToUpdate, items) => {
      const updatedItems = items.map((item) => {
        if (item.id === itemIdToUpdate) {
          let tax = 0;
          const qty = parseFloat(item.quantity) || 0;
          const price = parseFloat(item.price) || 0;
          const base = qty * price;
          const taxCodeData = activeTaxCodes.find(
            (tc) => tc.taxCode === item.taxCode
          );
          if (taxCodeData && taxCodeData.totalPercentage != null) {
            tax = base * (parseFloat(taxCodeData.totalPercentage) / 100);
          }
          return {
            ...item,
            taxPrice: tax.toFixed(2),
            total: (base + tax).toFixed(2),
          };
        }
        return item;
      });
      setPurchaseItems(updatedItems);
    },
    [activeTaxCodes]
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: null }));
  };
  const handleItemChange = (e, itemId, fieldName) => {
    const { value } = e.target;
    const newItems = purchaseItems.map((item) =>
      item.id === itemId ? { ...item, [fieldName]: value } : item
    );
    setPurchaseItems(newItems);
    if (["quantity", "price", "taxCode"].includes(fieldName)) {
      updateItemTaxAndTotal(itemId, newItems);
    }
  };

  const handleFileInputChange = (e) => {
    // Convert the FileList object to an array to work with it easily
    const newFiles = Array.from(e.target.files);

    if (newFiles.length > 0) {
      setFormData((prev) => {
        // Get the names of files already in the list to avoid duplicates
        const existingFileNames = prev.uploadedFiles.map((f) => f.name);

        // Filter out any new files that are already in the list
        const uniqueNewFiles = newFiles.filter(
          (file) => !existingFileNames.includes(file.name)
        );

        return {
          ...prev,
          uploadedFiles: [...prev.uploadedFiles, ...uniqueNewFiles],
        };
      });
    }

    // Crucial for allowing the same file(s) to be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (fileName) =>
    setFormData((prev) => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((f) => f.name !== fileName),
    }));
  const handleBrowseClick = () => fileInputRef.current.click();
  const handleAddItemRow = () =>
    setPurchaseItems((prev) => [...prev, initialEmptyItem(Date.now())]);
  const handleRemoveItem = (id) =>
    setPurchaseItems((prev) => prev.filter((item) => item.id !== id));

  const openVendorModal = () => {
    setVendorSearchTerm("");
    setIsVendorModalOpen(true);
  };
  const openProductModal = (itemId) => {
    setProductModalTargetId(itemId);
    setProductSearchTerm("");
    setIsProductModalOpen(true);
  };
  const openUOMModal = (itemId) => {
    setUOMModalTargetId(itemId);
    setUomSearchTerm("");
    setIsUOMModalOpen(true);
  };
  const openWarehouseModal = (itemId) => {
    setWarehouseModalTargetId(itemId);
    setWarehouseSearchTerm("");
    setIsWarehouseModalOpen(true);
  };
  const openTaxModal = (itemId) => {
    setTaxModalTargetId(itemId);
    setTaxSearchTerm("");
    setIsTaxModalOpen(true);
  };

  const handleSelectVendor = (vendor) => {
    const address = [
      vendor.address1,
      vendor.address2,
      vendor.street,
      vendor.city,
    ]
      .filter(Boolean)
      .join(", ");
    setFormData((prev) => ({
      ...prev,
      vendorCode: vendor.code,
      vendorName: vendor.name,
      shipToAddress: address,
    }));
    setIsVendorModalOpen(false);
  };
  const handleSelectProduct = (product) => {
    const newItems = purchaseItems.map((item) =>
      item.id === productModalTargetId
        ? {
            ...item,
            productCode: product.sku,
            productName: product.name,
            uom: product.uom,
            price: product.wholesalePrice?.toString() ?? "0",
          }
        : item
    );
    setPurchaseItems(newItems);
    updateItemTaxAndTotal(productModalTargetId, newItems);
    setIsProductModalOpen(false);
  };
  const handleSelectUOM = (uom) => {
    setPurchaseItems((prev) =>
      prev.map((item) =>
        item.id === uomModalTargetId ? { ...item, uom: uom.name } : item
      )
    );
    setIsUOMModalOpen(false);
  };
  const handleSelectWarehouse = (wh) => {
    setPurchaseItems((prev) =>
      prev.map((item) =>
        item.id === warehouseModalTargetId
          ? { ...item, warehouseLocation: wh.code }
          : item
      )
    );
    setIsWarehouseModalOpen(false);
  };
  const handleSelectTax = (tax) => {
    const newItems = purchaseItems.map((item) =>
      item.id === taxModalTargetId ? { ...item, taxCode: tax.taxCode } : item
    );
    setPurchaseItems(newItems);
    updateItemTaxAndTotal(taxModalTargetId, newItems);
    setIsTaxModalOpen(false);
  };

  const validateForm = () => {
    /* ... */ return {};
  };
  const handleSave = async () => {
    /* ... */
  };

  const grandTotalSummary = purchaseItems
    .reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0)
    .toFixed(2);
  const taxTotalSummary = purchaseItems
    .reduce((sum, item) => sum + (parseFloat(item.taxPrice) || 0), 0)
    .toFixed(2);
  const productTotalSummary = (
    parseFloat(grandTotalSummary) - parseFloat(taxTotalSummary)
  ).toFixed(2);

  return (
    <>
      <MessageModal
        message={modalState.message}
        onClose={closeAppModal}
        type={modalState.type}
      />

      {isVendorModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Select Vendor</h2>
              <button
                className="modal-close-btn"
                onClick={() => setIsVendorModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                placeholder="Search by Code or Name..."
                className="modal-search-input"
                value={vendorSearchTerm}
                onChange={(e) => setVendorSearchTerm(e.target.value)}
                autoFocus
              />
              <div className="product-lookup-table-container">
                <table className="product-lookup-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allVendors
                      .filter(
                        (v) =>
                          v.name
                            .toLowerCase()
                            .includes(vendorSearchTerm.toLowerCase()) ||
                          v.code
                            .toLowerCase()
                            .includes(vendorSearchTerm.toLowerCase())
                      )
                      .map((vendor) => (
                        <tr
                          key={vendor.id}
                          onClick={() => handleSelectVendor(vendor)}
                        >
                          <td>{vendor.code}</td>
                          <td>{vendor.name}</td>
                          <td>
                            {[vendor.address1, vendor.city]
                              .filter(Boolean)
                              .join(", ")}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      {isProductModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Select Product</h2>
              <button
                className="modal-close-btn"
                onClick={() => setIsProductModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                placeholder="Search by SKU or Name..."
                className="modal-search-input"
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                autoFocus
              />
              <div className="product-lookup-table-container">
                <table className="product-lookup-table">
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Name</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allProducts
                      .filter(
                        (p) =>
                          p.name
                            .toLowerCase()
                            .includes(productSearchTerm.toLowerCase()) ||
                          p.sku
                            .toLowerCase()
                            .includes(productSearchTerm.toLowerCase())
                      )
                      .map((product) => (
                        <tr
                          key={product.id}
                          onClick={() => handleSelectProduct(product)}
                        >
                          <td>{product.sku}</td>
                          <td>{product.name}</td>
                          <td>{product.wholesalePrice?.toFixed(2) ?? "N/A"}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {isUOMModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Select UOM</h2>
              <button
                className="modal-close-btn"
                onClick={() => setIsUOMModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                placeholder="Search UOM..."
                className="modal-search-input"
                value={uomSearchTerm}
                onChange={(e) => setUomSearchTerm(e.target.value)}
                autoFocus
              />
              <div className="product-lookup-table-container">
                <table className="product-lookup-table">
                  <thead>
                    <tr>
                      <th>UOM Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUOMs
                      .filter((u) =>
                        u.name
                          .toLowerCase()
                          .includes(uomSearchTerm.toLowerCase())
                      )
                      .map((uom) => (
                        <tr key={uom.id} onClick={() => handleSelectUOM(uom)}>
                          <td>{uom.name}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {isWarehouseModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Select Warehouse</h2>
              <button
                className="modal-close-btn"
                onClick={() => setIsWarehouseModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                placeholder="Search Warehouse..."
                className="modal-search-input"
                value={warehouseSearchTerm}
                onChange={(e) => setWarehouseSearchTerm(e.target.value)}
                autoFocus
              />
              <div className="product-lookup-table-container">
                <table className="product-lookup-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allWarehouses
                      .filter(
                        (w) =>
                          w.name
                            .toLowerCase()
                            .includes(warehouseSearchTerm.toLowerCase()) ||
                          w.code
                            .toLowerCase()
                            .includes(warehouseSearchTerm.toLowerCase())
                      )
                      .map((wh) => (
                        <tr
                          key={wh.id}
                          onClick={() => handleSelectWarehouse(wh)}
                        >
                          <td>{wh.code}</td>
                          <td>{wh.name}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {isTaxModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Select Tax Code</h2>
              <button
                className="modal-close-btn"
                onClick={() => setIsTaxModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                placeholder="Search Tax Code..."
                className="modal-search-input"
                value={taxSearchTerm}
                onChange={(e) => setTaxSearchTerm(e.target.value)}
                autoFocus
              />
              <div className="product-lookup-table-container">
                <table className="product-lookup-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Description</th>
                      <th>Rate (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTaxCodes
                      .filter((t) =>
                        t.taxCode
                          .toLowerCase()
                          .includes(taxSearchTerm.toLowerCase())
                      )
                      .map((tax) => (
                        <tr key={tax.id} onClick={() => handleSelectTax(tax)}>
                          <td>{tax.taxCode}</td>
                          <td>{tax.taxDescription}</td>
                          <td>{tax.totalPercentage?.toFixed(2)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ... Other modals (UOM, Warehouse, Tax) follow the same structure ... */}

      <div className="detail-page-container">
        <div className="detail-page-header-bar">
          <h1 className="detail-page-main-title">Create Purchase Order</h1>
        </div>

        <div className="purchase-order-add__form-header">
          <div className="entry-header-column">
            <div className="entry-header-field">
              <label htmlFor="vendorCode">Vendor Code:</label>
              <div className="input-icon-wrapper">
                <input
                  type="text"
                  id="vendorCode"
                  value={formData.vendorCode}
                  className={`form-input-styled ${
                    formErrors.vendorCode ? "input-error" : ""
                  }`}
                  readOnly
                  onClick={openVendorModal}
                />
                <button
                  type="button"
                  className="header-lookup-indicator internal"
                  onClick={openVendorModal}
                >
                  <LookupIcon />
                </button>
              </div>
            </div>
            <div className="entry-header-field">
              <label htmlFor="vendorName">Vendor Name:</label>
              <div className="input-icon-wrapper">
                <input
                  type="text"
                  id="vendorName"
                  value={formData.vendorName}
                  className={`form-input-styled ${
                    formErrors.vendorName ? "input-error" : ""
                  }`}
                  readOnly
                  onClick={openVendorModal}
                />
                <button
                  type="button"
                  className="header-lookup-indicator internal"
                  onClick={openVendorModal}
                >
                  <LookupIcon />
                </button>
              </div>
            </div>
            <div className="entry-header-field">
              <label htmlFor="vendorRefNumber">Vendor Ref No:</label>
              <input
                type="text"
                id="vendorRefNumber"
                name="vendorRefNumber"
                value={formData.vendorRefNumber}
                onChange={handleInputChange}
                className="form-input-styled"
              />
            </div>
            <div className="entry-header-field">
              <label htmlFor="shipToAddress">Ship to Address:</label>
              <textarea
                id="shipToAddress"
                name="shipToAddress"
                value={formData.shipToAddress}
                onChange={handleInputChange}
                className="form-textarea-styled"
                rows="2"
                readOnly
              />
            </div>
            <div className="entry-header-field">
              <label htmlFor="purchaseRemarks">Remarks:</label>
              <textarea
                id="purchaseRemarks"
                name="purchaseRemarks"
                value={formData.purchaseRemarks}
                onChange={handleInputChange}
                className="form-textarea-styled"
                rows="2"
              />
            </div>
          </div>
          <div className="entry-header-column">
            <div className="entry-header-field">
              <label htmlFor="purchaseOrderNo">P.O Number:</label>
              <input
                type="text"
                id="purchaseOrderNo"
                value={formData.purchaseOrderNo || "Generated on save"}
                className="form-input-styled"
                readOnly
                disabled
              />
            </div>
            <div className="entry-header-field">
              <label htmlFor="poDate">P.O Date:</label>
              <input
                type="date"
                id="poDate"
                name="poDate"
                value={formData.poDate}
                onChange={handleInputChange}
                className={`form-input-styled ${
                  formErrors.poDate ? "input-error" : ""
                }`}
              />
            </div>
            <div className="entry-header-field">
              <label htmlFor="deliveryDate">Delivery Date:</label>
              <input
                type="date"
                id="deliveryDate"
                name="deliveryDate"
                value={formData.deliveryDate}
                onChange={handleInputChange}
                className={`form-input-styled ${
                  formErrors.deliveryDate ? "input-error" : ""
                }`}
              />
            </div>
            <div className="entry-header-field file-input-container">
              <label htmlFor="uploadFilesInput">Attachment(s):</label>
              <input
                type="file"
                id="uploadFilesInput"
                ref={fileInputRef}
                className="form-input-file-hidden"
                onChange={handleFileInputChange}
                multiple
              />
              <button
                type="button"
                className="browse-files-btn"
                onClick={handleBrowseClick}
              >
                Browse files
              </button>
              {formData.uploadedFiles.length > 0 && (
                <div className="file-names-display-area">
                  {formData.uploadedFiles.map((f, i) => (
                    <div key={f.name + i} className="file-name-entry">
                      <span className="file-name-display" title={f.name}>
                        {f.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(f.name)}
                        className="remove-file-btn"
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
          <div className="purchase-order-add__items-section">
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
              <table className="po-add__items-table">
                <thead>
                  <tr>
                    <th>Product Code</th>
                    <th>Product Name</th>
                    <th>Quantity</th>
                    <th>UOM</th>
                    <th>Price</th>
                    <th>Warehouse</th>
                    <th>Tax Code</th>
                    <th>Tax Price</th>
                    <th>Total</th>
                    <th className="action-column-header">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseItems.map((item) => (
                    <tr key={item.id}>
                      <td className="editable-cell">
                        <div className="po-add-input-with-icon-wrapper">
                          <input
                            type="text"
                            value={item.productCode}
                            className="po-add__table-input"
                            readOnly
                            onClick={() => openProductModal(item.id)}
                          />
                          <button
                            type="button"
                            className="po-add__lookup-indicator"
                            onClick={() => openProductModal(item.id)}
                          >
                            <LookupIcon />
                          </button>
                        </div>
                      </td>
                      <td className="editable-cell">
                        <div className="po-add-input-with-icon-wrapper">
                          <input
                            type="text"
                            value={item.productName}
                            className="po-add__table-input"
                            readOnly
                            onClick={() => openProductModal(item.id)}
                          />
                          <button
                            type="button"
                            className="po-add__lookup-indicator"
                            onClick={() => openProductModal(item.id)}
                          >
                            <LookupIcon />
                          </button>
                        </div>
                      </td>
                      <td className="editable-cell">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(e, item.id, "quantity")
                          }
                          className="po-add__table-input po-quantity-input"
                        />
                      </td>
                      <td className="editable-cell">
                        <div className="po-add-input-with-icon-wrapper">
                          <input
                            type="text"
                            value={item.uom}
                            className="po-add__table-input po-uom-input"
                            onChange={(e) =>
                              handleItemChange(e, item.id, "uom")
                            }
                          />
                          <button
                            type="button"
                            className="po-add__lookup-indicator"
                            onClick={() => openUOMModal(item.id)}
                            title="Lookup UOM"
                          >
                            <LookupIcon />
                          </button>
                        </div>
                      </td>
                      <td className="editable-cell">
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) =>
                            handleItemChange(e, item.id, "price")
                          }
                          className="po-add__table-input po-price-input"
                        />
                      </td>
                      <td className="editable-cell">
                        <div className="po-add-input-with-icon-wrapper">
                          <input
                            type="text"
                            value={item.warehouseLocation}
                            className="po-add__table-input"
                            onChange={(e) =>
                              handleItemChange(e, item.id, "warehouseLocation")
                            }
                            onClick={() => openWarehouseModal(item.id)}
                          />
                          <button
                            type="button"
                            className="po-add__lookup-indicator"
                            onClick={() => openWarehouseModal(item.id)}
                            title="Lookup Warehouse"
                          >
                            <LookupIcon />
                          </button>
                        </div>
                      </td>
                      <td className="editable-cell tax-cell">
                        <div className="po-add-input-with-icon-wrapper">
                          <input
                            type="text"
                            value={item.taxCode}
                            className="po-add__table-input po-tax-input"
                            onChange={(e) =>
                              handleItemChange(e, item.id, "taxCode")
                            }
                            onClick={() => openTaxModal(item.id)}
                          />
                          <button
                            type="button"
                            className="po-add__lookup-indicator"
                            onClick={() => openTaxModal(item.id)}
                          >
                            <LookupIcon />
                          </button>
                        </div>
                      </td>
                      <td className="editable-cell">
                        <input
                          type="number"
                          value={item.taxPrice}
                          readOnly
                          className="po-add__table-input po-tax-input"
                        />
                      </td>
                      <td className="total-cell">{item.total}</td>
                      <td className="action-cell">
                        <button
                          type="button"
                          className="remove-item-btn"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <DeleteIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="tax-summary-container">
              <div className="summary-item">
                <label>Product Total without Tax :</label>
                <input
                  type="text"
                  readOnly
                  value={productTotalSummary}
                  className="summary-input"
                />
              </div>
              <div className="summary-item">
                <label>Tax Total :</label>
                <input
                  type="text"
                  readOnly
                  value={taxTotalSummary}
                  className="summary-input"
                />
              </div>
              <div className="summary-item">
                <label>Net Total : </label>
                <input
                  type="text"
                  readOnly
                  value={grandTotalSummary}
                  className="summary-input"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="detail-page-footer">
          <div className="footer-actions-main">
            <button
              className="footer-btn primary"
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Add Purchase Order"}
            </button>
          </div>
          <button
            className="footer-btn secondary"
            onClick={() => navigate("/purchaseorder")}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
export default PurchaseAdd;
