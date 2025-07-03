import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./GRPOadd.css";
import {
  API_PRODUCTS_ENDPOINT,
  API_BASE_URL,
  API_UOM_ENDPOINT,
  API_WAREHOUSE_ENDPOINT,
} from "../../../config";

// --- Reusable Components (No changes needed here) ---
const MessageModal = ({ message, onClose, type = "info" }) => {
  if (!message) return null;
  return (
    <div className="grpo-add-modal-overlay">
      <div className={`grpo-add-modal-content ${type}`}>
        <p style={{ whiteSpace: "pre-line" }}>{message}</p>
        <button onClick={onClose} className="grpo-add-modal-close-button">
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

function GRPOadd() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const initialFormDataState = {
    grpoNumber: "",
    poNumber: "",
    vendorCode: "",
    vendorName: "",
    vendorRefNumber: "",
    grpoDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    billToAddress: "",
    grpoRemarks: "",
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
    warehouse: "",
    taxCode: "",
    taxPrice: "0",
    total: "0.00",
  });
  const [grpoItems, setGrpoItems] = useState([initialEmptyItem(Date.now())]);
  const [modalState, setModalState] = useState({
    message: "",
    type: "info",
    isActive: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [allProducts, setAllProducts] = useState([]);
  const [allPurchaseOrders, setAllPurchaseOrders] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [allUOMs, setAllUOMs] = useState([]);
  const [allWarehouses, setAllWarehouses] = useState([]);
  const [activeTaxCodes, setActiveTaxCodes] = useState([]);

  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isUOMModalOpen, setIsUOMModalOpen] = useState(false);
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);

  const [poSearchTerm, setPoSearchTerm] = useState("");
  const [vendorSearchTerm, setVendorSearchTerm] = useState("");
  const [productModalTargetId, setProductModalTargetId] = useState(null);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [uomModalTargetId, setUOMModalTargetId] = useState(null);
  const [uomSearchTerm, setUomSearchTerm] = useState("");
  const [warehouseModalTargetId, setWarehouseModalTargetId] = useState(null);
  const [warehouseSearchTerm, setWarehouseSearchTerm] = useState("");
  const [taxModalTargetId, setTaxModalTargetId] = useState(null);
  const [taxSearchTerm, setTaxSearchTerm] = useState("");

  const showAppModal = (message, type = "info") =>
    setModalState({ message, type, isActive: true });
  const closeAppModal = () => {
    if (modalState.type === "success")
      navigate("/grpo", { state: { refreshGRPOs: true } });
    else setModalState({ message: "", type: "info", isActive: false });
  };

  const fetchDataForLookups = useCallback(
    async (endpoint, setData, resourceName) => {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`${resourceName} API Error`);
        const data = await response.json();
        setData(Array.isArray(data) ? data : []);
      } catch (error) {
        showAppModal(
          `Error loading ${resourceName}: ${error.message}`,
          "error"
        );
        setData([]);
      }
    },
    []
  );

  useEffect(() => {
    fetchDataForLookups(API_PRODUCTS_ENDPOINT, setAllProducts, "Products");
    fetchDataForLookups(`${API_BASE_URL}/Vendor`, setAllVendors, "Vendors");
    fetchDataForLookups(
      `${API_BASE_URL}/PurchaseOrders`,
      setAllPurchaseOrders,
      "Purchase Orders"
    );
    fetchDataForLookups(
      `${API_BASE_URL}/TaxDeclarations`,
      setActiveTaxCodes,
      "Tax Codes"
    );
    fetchDataForLookups(API_UOM_ENDPOINT, setAllUOMs, "UOMs");
    fetchDataForLookups(API_WAREHOUSE_ENDPOINT, setAllWarehouses, "Warehouses");
  }, [fetchDataForLookups]);

  const updateItemTaxAndTotal = useCallback(
    (items) => {
      const updatedItems = items.map((item) => {
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
      });
      setGrpoItems(updatedItems);
    },
    [activeTaxCodes]
  );

  const handleInputChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleItemChange = (e, itemId, fieldName) => {
    const { value } = e.target;
    const newItems = grpoItems.map((item) =>
      item.id === itemId ? { ...item, [fieldName]: value } : item
    );
    setGrpoItems(newItems);
    if (["quantity", "price"].includes(fieldName)) {
      updateItemTaxAndTotal(newItems);
    }
  };

  const handleFileInputChange = (e) => {
    const newFiles = Array.from(e.target.files);
    if (newFiles.length > 0) {
      setFormData((prev) => ({
        ...prev,
        uploadedFiles: [
          ...prev.uploadedFiles,
          ...newFiles.filter(
            (nf) =>
              !prev.uploadedFiles.some(
                (ef) => ef.name === nf.name && ef.size === nf.size
              )
          ),
        ],
      }));
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleRemoveFile = (fileName) =>
    setFormData((prev) => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((f) => f.name !== fileName),
    }));
  const handleBrowseClick = () => fileInputRef.current.click();
  const handleAddItemRow = () =>
    setGrpoItems((prev) => [...prev, initialEmptyItem(Date.now())]);
  const handleRemoveItem = (id) =>
    setGrpoItems((prev) => prev.filter((item) => item.id !== id));

  const openVendorModal = () => {
    setVendorSearchTerm("");
    setIsVendorModalOpen(true);
  };
  const openPOModal = () => {
    if (formData.vendorCode) {
      setPoSearchTerm("");
      setIsPOModalOpen(true);
    } else {
      showAppModal("Please select a Vendor first.", "info");
    }
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
    setFormData((prev) => ({
      ...initialFormDataState,
      poDate: prev.poDate,
      vendorCode: vendor.code,
      vendorName: vendor.name,
      billToAddress: [vendor.address1, vendor.city].filter(Boolean).join(", "),
    }));
    setGrpoItems([initialEmptyItem(Date.now())]);
    setIsVendorModalOpen(false);
  };

  const handleSelectPO = (po) => {
    setFormData((prev) => ({
      ...prev,
      poNumber: po.purchaseOrderNo,
      vendorCode: po.vendorCode,
      vendorName: po.vendorName,
      vendorRefNumber: po.vendorRefNumber,
      billToAddress: po.shipToAddress,
    }));
    const itemsFromPO = po.purchaseItems.map((item) => ({
      ...initialEmptyItem(Date.now() + Math.random()),
      ...item,
      price: item.price.toString(),
      quantity: item.quantity.toString(),
      warehouse: item.warehouseLocation,
    }));
    updateItemTaxAndTotal(
      itemsFromPO.length > 0 ? itemsFromPO : [initialEmptyItem(Date.now())]
    );
    setIsPOModalOpen(false);
  };

  const handleSelectProduct = (product) => {
    const newItems = grpoItems.map((item) =>
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
    updateItemTaxAndTotal(newItems);
    setIsProductModalOpen(false);
  };
  const handleSelectUOM = (uom) => {
    setGrpoItems((prev) =>
      prev.map((item) =>
        item.id === uomModalTargetId ? { ...item, uom: uom.name } : item
      )
    );
    setIsUOMModalOpen(false);
  };
  const handleSelectWarehouse = (wh) => {
    setGrpoItems((prev) =>
      prev.map((item) =>
        item.id === warehouseModalTargetId
          ? { ...item, warehouse: wh.code }
          : item
      )
    );
    setIsWarehouseModalOpen(false);
  };
  const handleSelectTax = (tax) => {
    const newItems = grpoItems.map((item) =>
      item.id === taxModalTargetId ? { ...item, taxCode: tax.taxCode } : item
    );
    updateItemTaxAndTotal(newItems);
    setIsTaxModalOpen(false);
  };

  const validateForm = () => {
    /* ... */ return {};
  };
  const handleSave = async () => {
    /* ... */
  };

  const grandTotalSummary = grpoItems
    .reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0)
    .toFixed(2);
  const taxTotalSummary = grpoItems
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

      {/* Lookup Modals */}
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

      {isPOModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Select Purchase Order for {formData.vendorName}</h2>
              <button
                className="modal-close-btn"
                onClick={() => setIsPOModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                placeholder="Search by PO Number..."
                className="modal-search-input"
                value={poSearchTerm}
                onChange={(e) => setPoSearchTerm(e.target.value)}
                autoFocus
              />
              <div className="product-lookup-table-container">
                <table className="product-lookup-table">
                  <thead>
                    <tr>
                      <th>P.O Number</th>
                      <th>P.O Date</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPurchaseOrders
                      .filter(
                        (p) =>
                          p.vendorCode === formData.vendorCode &&
                          p.purchaseOrderNo
                            .toLowerCase()
                            .includes(poSearchTerm.toLowerCase())
                      )
                      .map((po) => (
                        <tr key={po.id} onClick={() => handleSelectPO(po)}>
                          <td>{po.purchaseOrderNo}</td>
                          <td>{new Date(po.poDate).toLocaleDateString()}</td>
                          <td>{po.orderTotal?.toFixed(2)}</td>
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

      <div className="detail-page-container">
        <div className="detail-page-header-bar">
          <h1 className="detail-page-main-title">
            Create Goods Receipt PO (GRPO)
          </h1>
        </div>

        <div className="grpo-add__form-header">
          <div className="entry-header-column">
            <div className="entry-header-field">
              <label htmlFor="vendorCode">Vendor Code:</label>
              <div className="input-icon-wrapper">
                <input
                  type="text"
                  id="vendorCode"
                  value={formData.vendorCode}
                  className="form-input-styled"
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
                  className="form-input-styled"
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
              <label htmlFor="poNumber">P.O Number:</label>
              <div className="input-icon-wrapper">
                <input
                  type="text"
                  id="poNumber"
                  value={formData.poNumber}
                  className="form-input-styled"
                  readOnly
                  onClick={openPOModal}
                  disabled={!formData.vendorCode}
                  title={
                    !formData.vendorCode
                      ? "Select a Vendor first"
                      : "Select a Purchase Order"
                  }
                />
                <button
                  type="button"
                  className="header-lookup-indicator internal"
                  onClick={openPOModal}
                  disabled={!formData.vendorCode}
                >
                  <LookupIcon />
                </button>
              </div>
            </div>
            <div className="entry-header-field">
              <label htmlFor="vendorRefNumber">Vendor Ref No:</label>
              <input
                type="text"
                name="vendorRefNumber"
                value={formData.vendorRefNumber}
                className="form-input-styled"
                readOnly
              />
            </div>
            <div className="entry-header-field">
              <label htmlFor="payToAddress">Pay to Address:</label>
              <textarea
                name="billToAddress"
                value={formData.billToAddress}
                className="form-textarea-styled"
                rows="2"
                readOnly
              />
            </div>
            <div className="entry-header-field">
              <label htmlFor="grpoRemarks">Remarks:</label>
              <textarea
                name="grpoRemarks"
                value={formData.grpoRemarks}
                onChange={handleInputChange}
                className="form-textarea-styled"
                rows="2"
              />
            </div>
          </div>
          <div className="entry-header-column">
            <div className="entry-header-field">
              <label htmlFor="grpoNumber">GRPO Number:</label>
              <input
                type="text"
                value={formData.grpoNumber || "Generated on save"}
                className="form-input-styled"
                readOnly
                disabled
              />
            </div>
            <div className="entry-header-field">
              <label htmlFor="grpoDate">GRPO Date:</label>
              <input
                type="date"
                name="grpoDate"
                value={formData.grpoDate}
                onChange={handleInputChange}
                className="form-input-styled"
              />
            </div>
            <div className="entry-header-field">
              <label htmlFor="dueDate">Due Date:</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className="form-input-styled"
              />
            </div>
            <div className="entry-header-field file-input-container">
              <label htmlFor="uploadFilesInput">Attachment(s):</label>
              <div className="file-input-controls-wrapper">
                <button
                  type="button"
                  className="browse-files-btn"
                  onClick={handleBrowseClick}
                >
                  Browse files
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="form-input-file-hidden"
                onChange={handleFileInputChange}
                multiple
              />
              {formData.uploadedFiles.length > 0 && (
                <div className="file-names-list-area">
                  {formData.uploadedFiles.map((f, i) => (
                    <div key={i} className="file-name-entry">
                      <span title={f.name}>{f.name}</span>
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
          <div className="grpo-add__items-section">
            <div className="product-details-header">
              <h3 className="form-section-title">Received Items Details</h3>
              <button
                type="button"
                className="add-item-row-btn"
                onClick={handleAddItemRow}
              >
                + Add Row
              </button>
            </div>

            <div className="table-responsive-container">
              <table className="grpo-add__items-table">
                <thead>
                  <tr>
                    <th>Product Code</th>
                    <th>Product Name</th>
                    <th>Received Quantity</th>
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
                  {grpoItems.map((item) => (
                    <tr key={item.id}>
                      <td className="editable-cell">
                        <div className="input-icon-wrapper">
                          <input
                            type="text"
                            value={item.productCode}
                            className="grpo-add__table-input"
                            readOnly
                            onClick={() => openProductModal(item.id)}
                          />
                          <button
                            type="button"
                            className="grpo-add__lookup-indicator"
                            onClick={() => openProductModal(item.id)}
                          >
                            <LookupIcon />
                          </button>
                        </div>
                      </td>
                      <td className="editable-cell">
                        <div className="input-icon-wrapper">
                          <input
                            type="text"
                            value={item.productName}
                            className="grpo-add__table-input"
                            readOnly
                            onClick={() => openProductModal(item.id)}
                          />
                          <button
                            type="button"
                            className="grpo-add__lookup-indicator"
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
                          className="grpo-add__table-input"
                        />
                      </td>
                      <td className="editable-cell">
                        <div className="input-icon-wrapper">
                          <input
                            type="text"
                            value={item.uom}
                            onChange={(e) =>
                              handleItemChange(e, item.id, "uom")
                            }
                            className="grpo-add__table-input"
                          />
                          <button
                            type="button"
                            className="grpo-add__lookup-indicator"
                            onClick={() => openUOMModal(item.id)}
                          >
                            <LookupIcon />
                          </button>
                        </div>
                      </td>
                      <td className="editable-cell">
                        <input
                          type="number"
                          value={item.price}
                          className="grpo-add__table-input"
                          readOnly
                        />
                      </td>
                      <td className="editable-cell">
                        <div className="input-icon-wrapper">
                          <input
                            type="text"
                            value={item.warehouse}
                            className="grpo-add__table-input"
                            readOnly
                            onClick={() => openWarehouseModal(item.id)}
                          />
                          <button
                            type="button"
                            className="grpo-add__lookup-indicator"
                            onClick={() => openWarehouseModal(item.id)}
                          >
                            <LookupIcon />
                          </button>
                        </div>
                      </td>
                      <td className="editable-cell">
                        <div className="input-icon-wrapper">
                          <input
                            type="text"
                            value={item.taxCode}
                            className="grpo-add__table-input"
                            readOnly
                            onClick={() => openTaxModal(item.id)}
                          />
                          <button
                            type="button"
                            className="grpo-add__lookup-indicator"
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
                          className="grpo-add__table-input"
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
                <label className="summary-label">Product Total w/o Tax:</label>
                <input
                  type="text"
                  readOnly
                  value={productTotalSummary}
                  className="summary-input"
                />
              </div>
              <div className="summary-item">
                <label className="summary-label">Tax Total:</label>
                <input
                  type="text"
                  readOnly
                  value={taxTotalSummary}
                  className="summary-input"
                />
              </div>
              <div className="summary-item">
                <label className="summary-label">Net Total:</label>
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
          <button
            className="footer-btn primary"
            onClick={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Create GRPO"}
          </button>
          <button
            className="footer-btn secondary"
            onClick={() => navigate("/grpo")}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
export default GRPOadd;
