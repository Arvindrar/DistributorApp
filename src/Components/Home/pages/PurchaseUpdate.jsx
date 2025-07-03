import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./PurchaseUpdate.css"; // Use the new CSS file
import {
  API_PRODUCTS_ENDPOINT,
  API_BASE_URL,
  API_UOM_ENDPOINT,
  API_WAREHOUSE_ENDPOINT,
} from "../../../config";

// --- Reusable Components (prefixed for this page) ---
const MessageModal = ({ message, onClose, type = "info" }) => {
  if (!message) return null;
  return (
    <div className="po-update-modal-overlay">
      <div className={`po-update-modal-content ${type}`}>
        <p style={{ whiteSpace: "pre-line" }}>{message}</p>
        <button onClick={onClose} className="po-update-modal-close-button">
          OK
        </button>
      </div>
    </div>
  );
};
const LookupIcon = () => (
  <span className="po-update__lookup-indicator-icon" title="Lookup value">
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

function PurchaseUpdate() {
  const navigate = useNavigate();
  const { poId } = useParams();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    purchaseOrderNo: "",
    vendorCode: "",
    vendorName: "",
    poDate: "",
    deliveryDate: "",
    vendorRefNumber: "",
    shipToAddress: "",
    purchaseRemarks: "",
    uploadedFiles: [],
  });
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [modalState, setModalState] = useState({
    message: "",
    type: "info",
    isActive: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [fileIdsToDelete, setFileIdsToDelete] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [activeTaxCodes, setActiveTaxCodes] = useState([]);
  const [allUOMs, setAllUOMs] = useState([]);
  const [allWarehouses, setAllWarehouses] = useState([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productModalTargetId, setProductModalTargetId] = useState(null);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [taxModalTargetId, setTaxModalTargetId] = useState(null);
  const [taxSearchTerm, setTaxSearchTerm] = useState("");
  const [isUOMModalOpen, setIsUOMModalOpen] = useState(false);
  const [uomModalTargetId, setUOMModalTargetId] = useState(null);
  const [uomSearchTerm, setUomSearchTerm] = useState("");
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [warehouseModalTargetId, setWarehouseModalTargetId] = useState(null);
  const [warehouseSearchTerm, setWarehouseSearchTerm] = useState("");

  const showAppModal = (message, type = "info") =>
    setModalState({ message, type, isActive: true });

  const closeAppModal = () => {
    const wasSuccess = modalState.type === "success";
    setModalState({ message: "", type: "info", isActive: false });
    if (wasSuccess) navigate("/purchaseorder");
  };

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

  const fetchDataForLookups = useCallback(
    async (endpoint, setData, resourceName) => {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`${resourceName} API Error`);
        setData(await response.json());
      } catch (error) {
        console.error(`Error loading ${resourceName}:`, error);
      }
    },
    []
  );

  useEffect(() => {
    Promise.all([
      fetchDataForLookups(API_PRODUCTS_ENDPOINT, setAllProducts, "Products"),
      fetchDataForLookups(`${API_BASE_URL}/Vendor`, setAllVendors, "Vendors"),
      fetchDataForLookups(
        `${API_BASE_URL}/TaxDeclarations`,
        setActiveTaxCodes,
        "Tax Codes"
      ),
      fetchDataForLookups(API_UOM_ENDPOINT, setAllUOMs, "UOMs"),
      fetchDataForLookups(
        API_WAREHOUSE_ENDPOINT,
        setAllWarehouses,
        "Warehouses"
      ),
    ]);
  }, [fetchDataForLookups]);

  useEffect(() => {
    const fetchPurchaseOrder = async () => {
      setIsLoading(true);
      setPageError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/PurchaseOrders/${poId}`);
        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(
            `Failed to load data. Server responded with ${response.status}: ${errorBody}`
          );
        }
        const data = await response.json();

        if (!data) throw new Error("Received empty data from server.");

        setFormData({
          purchaseOrderNo: data.purchaseOrderNo,
          vendorCode: data.vendorCode || "",
          vendorName: data.vendorName || "",
          poDate: data.poDate
            ? new Date(data.poDate).toISOString().split("T")[0]
            : "",
          deliveryDate: data.deliveryDate
            ? new Date(data.deliveryDate).toISOString().split("T")[0]
            : "",
          vendorRefNumber: data.vendorRefNumber || "",
          shipToAddress: data.shipToAddress || "",
          purchaseRemarks: data.purchaseRemarks || "",
          uploadedFiles: [],
        });

        setPurchaseItems(
          (data.purchaseItems || []).map((item) => ({
            ...item,
            id: item.id || Date.now() + Math.random(),
            quantity: item.quantity?.toString() || "1",
            price: item.price?.toString() || "0",
            taxPrice: item.taxPrice?.toFixed(2) || "0.00",
            total: item.total?.toFixed(2) || "0.00",
          }))
        );
        setExistingAttachments(data.attachments || []);
        setFileIdsToDelete([]);
      } catch (error) {
        setPageError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPurchaseOrder();
  }, [poId]);

  const updateItemTaxAndTotal = useCallback(
    (itemIdToUpdate) => {
      setPurchaseItems((prevItems) =>
        prevItems.map((item) => {
          if (item.id === itemIdToUpdate) {
            let tax = 0;
            const qty = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.price) || 0;
            const base = qty * price;
            const taxCodeData = activeTaxCodes.find(
              (tc) => tc.taxCode === item.taxCode
            );
            if (taxCodeData?.totalPercentage != null) {
              tax = base * (parseFloat(taxCodeData.totalPercentage) / 100);
            }
            return {
              ...item,
              taxPrice: tax.toFixed(2),
              total: (base + tax).toFixed(2),
            };
          }
          return item;
        })
      );
    },
    [activeTaxCodes]
  );

  const handleItemChange = (e, itemId, fieldName) => {
    const { value } = e.target;
    setPurchaseItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, [fieldName]: value } : item
      )
    );
    if (["quantity", "price"].includes(fieldName)) {
      setTimeout(() => updateItemTaxAndTotal(itemId), 0);
    }
  };

  const handleSelectProduct = (product) => {
    let targetItemId;
    setPurchaseItems((prevItems) => {
      targetItemId = productModalTargetId;
      return prevItems.map((item) =>
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
    });
    setTimeout(() => updateItemTaxAndTotal(targetItemId), 0);
    setIsProductModalOpen(false);
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleFileInputChange = (e) => {
    const newFiles = Array.from(e.target.files);
    if (newFiles.length > 0) {
      setFormData((prev) => {
        const existingFileNames = prev.uploadedFiles.map((f) => f.name);
        const uniqueNewFiles = newFiles.filter(
          (file) => !existingFileNames.includes(file.name)
        );
        return {
          ...prev,
          uploadedFiles: [...prev.uploadedFiles, ...uniqueNewFiles],
        };
      });
    }
    // Reset the file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const handleRemoveNewFile = (fileName) =>
    setFormData((prev) => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((f) => f.name !== fileName),
    }));
  const handleRemoveExistingFile = (fileId) => {
    setExistingAttachments((prev) => prev.filter((f) => f.id !== fileId));
    setFileIdsToDelete((prev) => [...new Set([...prev, fileId])]);
  };
  const handleAddItemRow = () =>
    setPurchaseItems((prev) => [...prev, initialEmptyItem(Date.now())]);
  const handleRemoveItem = (id) =>
    setPurchaseItems((prev) => prev.filter((item) => item.id !== id));
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
    let targetItemId;
    setPurchaseItems((prev) => {
      targetItemId = taxModalTargetId;
      return prev.map((item) =>
        item.id === taxModalTargetId ? { ...item, taxCode: tax.taxCode } : item
      );
    });
    setTimeout(() => updateItemTaxAndTotal(targetItemId), 0);
    setIsTaxModalOpen(false);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.vendorCode.trim() || !formData.vendorName.trim()) {
      errors.vendorCode =
        "Vendor is required. Please select one from the lookup.";
      errors.vendorName =
        "Vendor is required. Please select one from the lookup.";
    }
    if (!formData.poDate) {
      errors.poDate = "P.O. Date is required.";
    }
    if (!formData.deliveryDate) {
      errors.deliveryDate = "Delivery Date is required.";
    } else if (isNaN(new Date(formData.deliveryDate).getTime())) {
      errors.deliveryDate = "Invalid Delivery Date format.";
    } else if (
      formData.poDate &&
      new Date(formData.deliveryDate) < new Date(formData.poDate)
    ) {
      errors.deliveryDate = "Delivery Date cannot be before the P.O. Date.";
    }
    if (purchaseItems.length === 0) {
      errors.itemsGeneral =
        "At least one item must be added to the purchase order.";
    } else {
      purchaseItems.forEach((item) => {
        if (!item.productCode.trim() && !item.productName.trim()) {
          errors[`item_${item.id}_product`] = "Product is required.";
        }
        if (
          !item.quantity ||
          isNaN(parseFloat(item.quantity)) ||
          parseFloat(item.quantity) <= 0
        ) {
          errors[`item_${item.id}_quantity`] =
            "Quantity must be a positive number.";
        }
        if (
          item.price === "" ||
          isNaN(parseFloat(item.price)) ||
          parseFloat(item.price) < 0
        ) {
          errors[`item_${item.id}_price`] =
            "Price must be a valid, non-negative number.";
        }
        if (!item.uom || !item.uom.trim()) {
          errors[`item_${item.id}_uom`] = "UOM is required.";
        }
        if (!item.warehouseLocation || !item.warehouseLocation.trim()) {
          errors[`item_${item.id}_warehouseLocation`] =
            "Warehouse is required.";
        }
      });
    }
    setFormErrors(errors);
    return errors;
  };

  const handleSave = async () => {
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      const errorMessagesList = [];

      if (validationErrors.vendorName)
        errorMessagesList.push(`- Vendor: ${validationErrors.vendorName}`);
      if (validationErrors.poDate)
        errorMessagesList.push(`- P.O. Date: ${validationErrors.poDate}`);
      if (validationErrors.deliveryDate)
        errorMessagesList.push(
          `- Delivery Date: ${validationErrors.deliveryDate}`
        );
      if (validationErrors.itemsGeneral)
        errorMessagesList.push(`- Items: ${validationErrors.itemsGeneral}`);

      purchaseItems.forEach((item, index) => {
        const itemPrefix = `- Item #${index + 1}`;
        if (validationErrors[`item_${item.id}_product`])
          errorMessagesList.push(
            `${itemPrefix}: ${validationErrors[`item_${item.id}_product`]}`
          );
        if (validationErrors[`item_${item.id}_quantity`])
          errorMessagesList.push(
            `${itemPrefix}: ${validationErrors[`item_${item.id}_quantity`]}`
          );
        if (validationErrors[`item_${item.id}_uom`])
          errorMessagesList.push(
            `${itemPrefix}: ${validationErrors[`item_${item.id}_uom`]}`
          );
        if (validationErrors[`item_${item.id}_price`])
          errorMessagesList.push(
            `${itemPrefix}: ${validationErrors[`item_${item.id}_price`]}`
          );
        if (validationErrors[`item_${item.id}_warehouseLocation`])
          errorMessagesList.push(
            `${itemPrefix}: ${
              validationErrors[`item_${item.id}_warehouseLocation`]
            }`
          );
      });

      const modalErrorMessage =
        "Please correct the following errors:\n" + errorMessagesList.join("\n");
      showAppModal(modalErrorMessage, "error");
      return;
    }

    setIsSubmitting(true);
    const payload = new FormData();

    // Append header data
    payload.append("VendorCode", formData.vendorCode);
    payload.append("VendorName", formData.vendorName);
    payload.append("PODate", formData.poDate);
    payload.append("DeliveryDate", formData.deliveryDate);
    payload.append("VendorRefNumber", formData.vendorRefNumber);
    payload.append("ShipToAddress", formData.shipToAddress);
    payload.append("PurchaseRemarks", formData.purchaseRemarks);

    // The backend expects PurchaseItems, not SalesItems
    const itemsPayload = purchaseItems.map((item) => ({
      // When updating, the backend may need the DB ID to match items.
      // If new items are added, their ID should be 0 or null.
      // Assuming backend handles this logic based on ID.
      Id: item.dbId || 0, // Use the database ID for existing items
      ProductCode: item.productCode,
      ProductName: item.productName,
      Quantity: parseFloat(item.quantity) || 0,
      UOM: item.uom,
      Price: parseFloat(item.price) || 0,
      WarehouseLocation: item.warehouseLocation,
      TaxCode: item.taxCode,
      TaxPrice: parseFloat(item.taxPrice) || 0,
      Total: parseFloat(item.total) || 0,
    }));
    payload.append("PurchaseItemsJson", JSON.stringify(itemsPayload));

    // Append file deletion and new file uploads
    payload.append("FilesToDeleteJson", JSON.stringify(fileIdsToDelete));
    formData.uploadedFiles.forEach((file) => {
      payload.append("UploadedFiles", file, file.name);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/PurchaseOrders/${poId}`, {
        method: "PUT",
        body: payload,
      });

      if (!response.ok) {
        // Try to parse error JSON, fall back to text
        const errorData = await response.json().catch(() => null);
        if (errorData && errorData.message) {
          throw new Error(errorData.message);
        }
        throw new Error(
          `Failed to update purchase order. Status: ${response.status}`
        );
      }

      showAppModal("Purchase Order updated successfully!", "success");
    } catch (error) {
      console.error("Error updating purchase order:", error);
      showAppModal(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

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
  const grandTotalSummary = (
    parseFloat(productTotalSummary) + parseFloat(taxTotalSummary)
  ).toFixed(2);

  if (isLoading)
    return (
      <div className="po-update__page-loading">Loading Purchase Order...</div>
    );
  if (pageError)
    return <div className="po-update__page-error">Error: {pageError}</div>;

  return (
    <>
      <MessageModal
        message={modalState.message}
        onClose={closeAppModal}
        type={modalState.type}
      />

      {/* ========================================================== */}
      {/* PLACEMENT: All modals are now fully implemented.           */}
      {/* ========================================================== */}
      {isProductModalOpen && (
        <div className="po-update-modal-overlay">
          <div className="po-update-modal-content">
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
                className="modal-search-input"
                type="text"
                placeholder="Search by SKU or Name..."
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
        <div className="po-update-modal-overlay">
          <div className="po-update-modal-content">
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
                className="modal-search-input"
                type="text"
                placeholder="Search UOM..."
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
        <div className="po-update-modal-overlay">
          <div className="po-update-modal-content">
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
                className="modal-search-input"
                type="text"
                placeholder="Search Warehouse..."
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
        <div className="po-update-modal-overlay">
          <div className="po-update-modal-content">
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
                className="modal-search-input"
                type="text"
                placeholder="Search Tax Code..."
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

      {/* Main Page Content */}
      <div className="po-update__detail-page-container">
        <div className="po-update__detail-page-header-bar">
          <h1 className="po-update__detail-page-main-title">
            Update Purchase Order: {formData.purchaseOrderNo}
          </h1>
        </div>

        <div className="po-update__form-header">
          <div className="po-update__entry-header-column">
            <div className="po-update__entry-header-field">
              <label>Vendor Code:</label>
              <input
                type="text"
                value={formData.vendorCode}
                readOnly
                className="po-update__form-input-styled"
              />
            </div>
            <div className="po-update__entry-header-field">
              <label>Vendor Name:</label>
              <input
                type="text"
                value={formData.vendorName}
                readOnly
                className="po-update__form-input-styled"
              />
            </div>
            <div className="po-update__entry-header-field">
              <label>Vendor Ref No:</label>
              <input
                type="text"
                name="vendorRefNumber"
                value={formData.vendorRefNumber}
                onChange={handleInputChange}
                className="po-update__form-input-styled"
              />
            </div>
            <div className="po-update__entry-header-field">
              <label>Ship to Address:</label>
              <textarea
                value={formData.shipToAddress}
                readOnly
                className="po-update__form-textarea-styled"
              />
            </div>
            <div className="po-update__entry-header-field">
              <label>Remarks:</label>
              <textarea
                name="purchaseRemarks"
                value={formData.purchaseRemarks}
                onChange={handleInputChange}
                className="po-update__form-textarea-styled"
              />
            </div>
          </div>
          <div className="po-update__entry-header-column">
            <div className="po-update__entry-header-field">
              <label>P.O. Number:</label>
              <input
                type="text"
                value={formData.purchaseOrderNo}
                readOnly
                className="po-update__form-input-styled"
              />
            </div>
            <div className="po-update__entry-header-field">
              <label>P.O. Date:</label>
              <input
                type="date"
                name="poDate"
                value={formData.poDate}
                onChange={handleInputChange}
                className="po-update__form-input-styled"
              />
            </div>
            <div className="po-update__entry-header-field">
              <label>Delivery Date:</label>
              <input
                type="date"
                name="deliveryDate"
                value={formData.deliveryDate}
                onChange={handleInputChange}
                className="po-update__form-input-styled"
              />
            </div>
            <div className="po-update__entry-header-field po-update__file-input-container">
              <label>Attachment(s):</label>
              <button
                type="button"
                className="po-update__browse-files-btn"
                onClick={() => fileInputRef.current.click()}
              >
                Browse new
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                multiple
                style={{ display: "none" }}
              />
              <div className="po-update__file-names-display-area">
                {existingAttachments.map((f) => (
                  <div key={f.id} className="po-update__file-name-entry">
                    <span>{f.fileName}</span>
                    <button
                      onClick={() => handleRemoveExistingFile(f.id)}
                      className="po-update__remove-file-btn"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {formData.uploadedFiles.map((f, i) => (
                  <div key={i} className="po-update__file-name-entry">
                    <span>
                      <i>{f.name} (new)</i>
                    </span>
                    <button
                      onClick={() => handleRemoveNewFile(f.name)}
                      className="po-update__remove-file-btn"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="po-update__detail-form-content-area">
          <div className="po-update__items-section">
            <div className="po-update__product-details-header">
              <h3 className="po-update__form-section-title">Product Details</h3>
              <button
                onClick={handleAddItemRow}
                className="po-update__add-item-row-btn"
              >
                + Add Row
              </button>
            </div>
            <div className="po-update__table-responsive-container">
              <table className="po-update__items-table">
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
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseItems.map((item) => (
                    <tr key={item.id}>
                      <td className="po-update__editable-cell">
                        <div className="po-update-input-with-icon-wrapper">
                          <input
                            type="text"
                            value={item.productCode}
                            readOnly
                            style={{ cursor: "pointer" }}
                            onClick={() => openProductModal(item.id)}
                            className="po-update__table-input"
                          />
                          <button
                            type="button"
                            className="po-update__lookup-indicator"
                            onClick={() => openProductModal(item.id)}
                          >
                            <LookupIcon />
                          </button>
                        </div>
                      </td>
                      <td className="po-update__editable-cell">
                        <div className="po-update-input-with-icon-wrapper">
                          <input
                            type="text"
                            value={item.productName}
                            readOnly
                            style={{ cursor: "pointer" }}
                            onClick={() => openProductModal(item.id)}
                            className="po-update__table-input"
                          />
                          <button
                            type="button"
                            className="po-update__lookup-indicator"
                            onClick={() => openProductModal(item.id)}
                          >
                            <LookupIcon />
                          </button>
                        </div>
                      </td>
                      <td className="po-update__editable-cell">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(e, item.id, "quantity")
                          }
                          className="po-update__table-input"
                        />
                      </td>
                      <td className="po-update__editable-cell">
                        <div className="po-update-input-with-icon-wrapper">
                          <input
                            type="text"
                            value={item.uom}
                            onChange={(e) =>
                              handleItemChange(e, item.id, "uom")
                            }
                            className="po-update__table-input"
                          />
                          <button
                            type="button"
                            className="po-update__lookup-indicator"
                            onClick={() => openUOMModal(item.id)}
                          >
                            <LookupIcon />
                          </button>
                        </div>
                      </td>
                      <td className="po-update__editable-cell">
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) =>
                            handleItemChange(e, item.id, "price")
                          }
                          className="po-update__table-input"
                        />
                      </td>
                      <td className="po-update__editable-cell">
                        <div className="po-update-input-with-icon-wrapper">
                          <input
                            type="text"
                            value={item.warehouseLocation}
                            readOnly
                            style={{ cursor: "pointer" }}
                            onClick={() => openWarehouseModal(item.id)}
                            className="po-update__table-input"
                          />
                          <button
                            type="button"
                            className="po-update__lookup-indicator"
                            onClick={() => openWarehouseModal(item.id)}
                          >
                            <LookupIcon />
                          </button>
                        </div>
                      </td>
                      <td className="po-update__editable-cell">
                        <div className="po-update-input-with-icon-wrapper">
                          <input
                            type="text"
                            value={item.taxCode}
                            readOnly
                            style={{ cursor: "pointer" }}
                            onClick={() => openTaxModal(item.id)}
                            className="po-update__table-input"
                          />
                          <button
                            type="button"
                            className="po-update__lookup-indicator"
                            onClick={() => openTaxModal(item.id)}
                          >
                            <LookupIcon />
                          </button>
                        </div>
                      </td>
                      <td className="po-update__editable-cell">
                        <input
                          type="number"
                          value={item.taxPrice}
                          readOnly
                          className="po-update__table-input"
                        />
                      </td>
                      <td className="po-update__total-cell">{item.total}</td>
                      <td className="po-update__action-cell">
                        <button
                          type="button"
                          className="po-update__remove-item-btn"
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
            <div className="po-update__tax-summary-container">
              <div className="po-update__summary-item">
                <label>Product Total w/o Tax :</label>
                <input
                  type="text"
                  readOnly
                  value={productTotalSummary}
                  className="po-update__summary-input"
                />
              </div>
              <div className="po-update__summary-item">
                <label>Tax Total :</label>
                <input
                  type="text"
                  readOnly
                  value={taxTotalSummary}
                  className="po-update__summary-input"
                />
              </div>
              <div className="po-update__summary-item">
                <label>Net Total :</label>
                <input
                  type="text"
                  readOnly
                  value={grandTotalSummary}
                  className="po-update__summary-input"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="po-update__detail-page-footer">
          <button
            className="po-update__footer-btn po-update__primary"
            onClick={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Purchase Order"}
          </button>
          <button
            className="po-update__footer-btn po-update__secondary"
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

export default PurchaseUpdate;
