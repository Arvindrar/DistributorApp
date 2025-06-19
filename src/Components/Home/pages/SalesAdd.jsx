import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./SalesAdd.css"; // CRITICAL: Ensure SalesAdd.css has ALL necessary styles
import { API_PRODUCTS_ENDPOINT, API_BASE_URL } from "../../../config";

// --- Reusable Message Modal Component ---
const MessageModal = ({ message, onClose, type = "info" }) => {
  if (!message) return null;
  return (
    <div className="so-add-modal-overlay">
      <div className={`so-add-modal-content ${type}`}>
        <p>{message}</p>
        <button onClick={onClose} className="so-add-modal-close-button">
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
    className="bi bi-trash"
    viewBox="0 0 16 16"
    title="Remove Item"
  >
    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
  </svg>
);

function SalesAdd() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const customerCodeInputRef = useRef(null);
  const customerNameInputRef = useRef(null);

  const initialFormDataState = {
    salesOrderNo: "",
    customerCode: "",
    customerName: "",
    soDate: new Date().toISOString().split("T")[0],
    deliveryDate: "",
    customerRefNumber: "",
    shipToAddress: "",
    salesRemarks: "",
    salesEmployee: "",
    uploadedFiles: [],
  };
  const [formData, setFormData] = useState(initialFormDataState);

  const initialEmptyItem = (id) => ({
    id: id,
    productCode: "",
    productName: "",
    quantity: "1",
    uom: "",
    price: "",
    warehouseLocation: "",
    taxCode: "",
    taxPrice: "0",
    total: "0.00",
    showTaxLookup: false,
  });
  const [salesItems, setSalesItems] = useState([initialEmptyItem(Date.now())]);

  const [modalState, setModalState] = useState({
    message: "",
    type: "info",
    isActive: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [allProducts, setAllProducts] = useState([]);
  const [isLoadingAllProducts, setIsLoadingAllProducts] = useState(false);
  const [allProductsError, setAllProductsError] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [modalTargetItemId, setModalTargetItemId] = useState(null);
  const [searchTermModal, setSearchTermModal] = useState("");

  const [allCustomers, setAllCustomers] = useState([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [showCustomerSuggestionsForCode, setShowCustomerSuggestionsForCode] =
    useState(false);
  const [showCustomerSuggestionsForName, setShowCustomerSuggestionsForName] =
    useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  // --- NEW State for Tax Code Lookup ---
  const [activeTaxCodes, setActiveTaxCodes] = useState([]);
  const [isLoadingTaxCodes, setIsLoadingTaxCodes] = useState(false);
  const [taxCodesError, setTaxCodesError] = useState(null);
  const [isTaxLookupModalOpen, setIsTaxLookupModalOpen] = useState(false);
  const [taxLookupTargetItemId, setTaxLookupTargetItemId] = useState(null);
  const [searchTermTaxLookupModal, setSearchTermTaxLookupModal] = useState("");

  const fetchAllProductsForModal = useCallback(async () => {
    setIsLoadingAllProducts(true);
    setAllProductsError(null);
    try {
      const response = await fetch(API_PRODUCTS_ENDPOINT);
      if (!response.ok)
        throw new Error(
          `Products API Error: ${response.statusText} (${response.status})`
        );
      const data = await response.json();
      setAllProducts(data);
    } catch (error) {
      console.error("Error fetching products for modal:", error);
      setAllProductsError(error.message);
      setAllProducts([]);
    } finally {
      setIsLoadingAllProducts(false);
    }
  }, []);
  useEffect(() => {
    fetchAllProductsForModal();
  }, [fetchAllProductsForModal]);

  const fetchAllCustomers = useCallback(async () => {
    setIsLoadingCustomers(true);
    try {
      const response = await fetch(`${API_BASE_URL}/Customer`);
      if (!response.ok)
        throw new Error(
          `Customers API Error: ${response.statusText} (${response.status})`
        );
      const data = await response.json();
      setAllCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      showAppModal(`Error loading customers: ${error.message}`, "error");
      setAllCustomers([]);
    } finally {
      setIsLoadingCustomers(false);
    }
  }, []); // Removed showAppModal from dep array as it causes re-fetch loops if not stable
  useEffect(() => {
    fetchAllCustomers();
  }, [fetchAllCustomers]);

  // SalesAdd.jsx

  // ... fetchAllProductsForModal, fetchAllCustomers ...

  // --- NEW: Fetch Active Tax Codes ---
  const fetchActiveTaxCodes = useCallback(async () => {
    setIsLoadingTaxCodes(true);
    setTaxCodesError(null);
    try {
      // Adjust this endpoint if your API for tax declarations is different
      const response = await fetch(`${API_BASE_URL}/TaxDeclarations`);
      if (!response.ok) {
        throw new Error(
          `Tax Codes API Error: ${response.statusText} (${response.status})`
        );
      }
      const allTaxData = await response.json();
      const activeCodes = allTaxData
        .filter((tax) => tax.isActive) // Assuming 'isActive' property exists
        .map((tax) => ({
          id: tax.id, // Or taxCode if it's guaranteed unique and used as key
          taxCode: tax.taxCode,
          taxDescription: tax.taxDescription,
          // Ensure your TaxDeclarationDto from backend has these properties correctly named
          cgst: tax.cgst,
          sgst: tax.sgst,
          igst: tax.igst,
          totalPercentage: tax.totalPercentage, // This is crucial for calculation
        }));
      setActiveTaxCodes(activeCodes);
    } catch (error) {
      console.error("Error fetching active tax codes:", error);
      setTaxCodesError(error.message);
      setActiveTaxCodes([]);
      showAppModal(`Error loading tax codes: ${error.message}`, "error"); // Notify user
    } finally {
      setIsLoadingTaxCodes(false);
    }
  }, []); // Add dependencies if API_BASE_URL or showAppModal can change and are stable

  useEffect(() => {
    fetchActiveTaxCodes();
  }, [fetchActiveTaxCodes]);

  // ... closeAppModal, handleInputChange, etc. ...

  const showAppModal = (message, type = "info") =>
    setModalState({ message, type, isActive: true });
  const closeAppModal = () => {
    console.log("closeAppModal called. Modal state:", modalState); // DEBUG
    const wasSuccess =
      modalState.type === "success" &&
      modalState.message.toLowerCase().includes("successfully");

    console.log("wasSuccess condition details:"); // DEBUG
    console.log("  modalState.type:", modalState.type, "(should be 'success')"); // DEBUG
    console.log(
      "  modalState.message:",
      modalState.message,
      "(should include 'successfully')"
    ); // DEBUG
    console.log(
      "  message includes 'successfully':",
      modalState.message.toLowerCase().includes("successfully")
    ); // DEBUG
    console.log("  wasSuccess:", wasSuccess); // DEBUG
    setModalState({ message: "", type: "info", isActive: false });
    if (wasSuccess) {
      console.log("Navigating to /salesorder due to success."); // DEBUG
      navigate("/salesorder", { state: { refreshSalesOrders: true } });
    } else {
      console.log("Not navigating - wasSuccess is false."); // DEBUG
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: null }));
    const searchTerm = value.trim().toLowerCase();
    if (name === "customerCode") {
      if (searchTerm) {
        const f = allCustomers.filter(
          (c) => c.code && c.code.toLowerCase().includes(searchTerm)
        );
        setCustomerSuggestions(f);
        setShowCustomerSuggestionsForCode(f.length > 0);
        setShowCustomerSuggestionsForName(false);
        setActiveSuggestionIndex(0);
      } else {
        setCustomerSuggestions([]);
        setShowCustomerSuggestionsForCode(false);
      }
    } else if (name === "customerName") {
      if (searchTerm) {
        const f = allCustomers.filter(
          (c) => c.name && c.name.toLowerCase().includes(searchTerm)
        );
        setCustomerSuggestions(f);
        setShowCustomerSuggestionsForName(f.length > 0);
        setShowCustomerSuggestionsForCode(false);
        setActiveSuggestionIndex(0);
      } else {
        setCustomerSuggestions([]);
        setShowCustomerSuggestionsForName(false);
      }
    }
  };

  const handleCustomerSuggestionClick = (customer) => {
    const addressParts = [
      customer.address1,
      customer.address2,
      customer.street,
      customer.city,
      customer.state,
      customer.postBox,
      customer.country,
    ];
    const displayAddress = addressParts.filter(Boolean).join(", ");
    setFormData((prev) => ({
      ...prev,
      customerCode: customer.code || "",
      customerName: customer.name || "",
      shipToAddress: displayAddress,
      salesEmployee: customer.employee || "",
    }));
    setCustomerSuggestions([]);
    setShowCustomerSuggestionsForCode(false);
    setShowCustomerSuggestionsForName(false);
    setFormErrors((prev) => ({
      ...prev,
      customerCode: null,
      customerName: null,
    }));
  };

  const handleCustomerKeyDown = (e) => {
    const currentSuggestionsOpen =
      showCustomerSuggestionsForCode || showCustomerSuggestionsForName;
    if (currentSuggestionsOpen && customerSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestionIndex((prev) =>
          prev === customerSuggestions.length - 1 ? 0 : prev + 1
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSuggestionIndex((prev) =>
          prev === 0 ? customerSuggestions.length - 1 : prev - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (customerSuggestions[activeSuggestionIndex])
          handleCustomerSuggestionClick(
            customerSuggestions[activeSuggestionIndex]
          );
      } else if (e.key === "Escape") {
        setShowCustomerSuggestionsForCode(false);
        setShowCustomerSuggestionsForName(false);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideCode =
        customerCodeInputRef.current &&
        !customerCodeInputRef.current.contains(event.target) &&
        !event.target.closest(".customer-suggestions-list-code");
      const isOutsideName =
        customerNameInputRef.current &&
        !customerNameInputRef.current.contains(event.target) &&
        !event.target.closest(".customer-suggestions-list-name");
      if (isOutsideCode && isOutsideName) {
        setShowCustomerSuggestionsForCode(false);
        setShowCustomerSuggestionsForName(false);
      } else if (isOutsideCode) {
        setShowCustomerSuggestionsForCode(false);
      } else if (isOutsideName) {
        setShowCustomerSuggestionsForName(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0)
      setFormData((prev) => ({
        ...prev,
        uploadedFiles: [
          ...prev.uploadedFiles,
          ...files.filter(
            (file) =>
              !prev.uploadedFiles.some(
                (ef) => ef.name === file.name && ef.size === file.size
              )
          ),
        ],
      }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleRemoveFile = (fileNameToRemove) =>
    setFormData((prev) => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter(
        (file) => file.name !== fileNameToRemove
      ),
    }));
  const handleBrowseClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
    else console.error("File input ref not set!");
  };

  const calculateItemTotal = useCallback((itemId) => {
    setSalesItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          const qty = parseFloat(item.quantity) || 0;
          const price = parseFloat(item.price) || 0;
          const tax = parseFloat(item.taxPrice) || 0;
          return { ...item, total: (qty * price + tax).toFixed(2) };
        }
        return item;
      })
    );
  }, []);

  const updateItemTaxAndTotal = useCallback(
    (itemIdToUpdate) => {
      setSalesItems((prevItems) =>
        prevItems.map((item) => {
          if (item.id === itemIdToUpdate) {
            let calculatedTaxPrice = 0;
            const quantity = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.price) || 0;
            const baseAmount = quantity * price;

            if (item.taxCode && price > 0 && quantity > 0) {
              const selectedTax = activeTaxCodes.find(
                (tc) => tc.taxCode === item.taxCode
              );
              if (
                selectedTax &&
                selectedTax.totalPercentage !== null &&
                selectedTax.totalPercentage !== undefined
              ) {
                calculatedTaxPrice =
                  baseAmount * (parseFloat(selectedTax.totalPercentage) / 100);
              }
            }

            const newTotal = baseAmount + calculatedTaxPrice;

            return {
              ...item,
              taxPrice: calculatedTaxPrice.toFixed(2),
              total: newTotal.toFixed(2),
            };
          }
          return item;
        })
      );
    },
    [activeTaxCodes]
  ); // Dependency on activeTaxCodes

  const handleItemChange = (e, itemId, fieldName) => {
    const { value } = e.target;
    setSalesItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, [fieldName]: value } : item
      )
    );
    if (formErrors[`item_${itemId}_${fieldName}`])
      setFormErrors((prev) => ({
        ...prev,
        [`item_${itemId}_${fieldName}`]: null,
      }));
    if (
      fieldName === "quantity" ||
      fieldName === "price" ||
      fieldName === "taxCode"
    ) {
      setTimeout(() => {
        updateItemTaxAndTotal(itemId);
      }, 0);
    }
    // If taxPrice is manually changed (e.g., if you allow direct editing of taxPrice),
    // then only the total needs recalculation based on the new taxPrice.
    else if (fieldName === "taxPrice") {
      setSalesItems((prevItems) =>
        prevItems.map((it) => {
          if (it.id === itemId) {
            const qty = parseFloat(it.quantity) || 0;
            const pr = parseFloat(it.price) || 0;
            // Use the 'value' from the event directly as it's the new taxPrice
            const taxP = parseFloat(value) || 0;
            return { ...it, total: (qty * pr + taxP).toFixed(2) };
          }
          return it;
        })
      );
    }
  };
  //   if (
  //     fieldName === "quantity" ||
  //     fieldName === "price" ||
  //     fieldName === "taxPrice"
  //   )
  //     calculateItemTotal(itemId);
  // };

  const handleRemoveSalesItem = (itemIdToRemove) =>
    setSalesItems((prevItems) =>
      prevItems.filter((item) => item.id !== itemIdToRemove)
    );
  // const toggleTaxLookupIndicator = (itemId, show) =>
  //   setSalesItems((prevItems) =>
  //     prevItems.map((item) =>
  //       item.id === itemId
  //         ? { ...item, showTaxLookup: show }
  //         : { ...item, showTaxLookup: false }
  //     )
  //   );
  // const handleTaxLookupClick = (itemId) =>
  //   console.log(`Tax Lookup clicked for item ${itemId}`);
  const openTaxLookupModal = (itemId) => {
    setTaxLookupTargetItemId(itemId);
    setSearchTermTaxLookupModal("");
    setIsTaxLookupModalOpen(true);
  };

  const handleSelectTaxCodeFromModal = (tax) => {
    if (taxLookupTargetItemId === null) return;

    // Update the sales item with the selected tax code
    // We update the taxCode here, then call updateItemTaxAndTotal
    setSalesItems((prevItems) =>
      prevItems.map((item) =>
        item.id === taxLookupTargetItemId
          ? { ...item, taxCode: tax.taxCode } // Only update taxCode here
          : item
      )
    );

    // Trigger tax and total calculation for the updated item
    // Use setTimeout to ensure the state update from setSalesItems is processed before calculation
    setTimeout(() => {
      updateItemTaxAndTotal(taxLookupTargetItemId);
    }, 0);

    setIsTaxLookupModalOpen(false);
    setTaxLookupTargetItemId(null);
  };

  const openProductLookupModal = (itemId) => {
    setModalTargetItemId(itemId);
    setSearchTermModal("");
    setIsProductModalOpen(true);
  };
  const handleSelectProductFromModal = (product) => {
    if (modalTargetItemId === null) return;
    setSalesItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === modalTargetItemId) {
          const newPrice = product.retailPrice?.toString() ?? "0";
          return {
            ...item,
            productCode: product.sku || "",
            productName: product.name || "",
            uom: product.uom || "",
            price: newPrice,
          };
        }
        return item;
      })
    );
    calculateItemTotal(modalTargetItemId);
    setIsProductModalOpen(false);
    setModalTargetItemId(null);
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Validate header fields
    if (!formData.customerCode.trim()) {
      errors.customerCode = "Customer Code is required.";
      isValid = false;
    }
    if (
      !formData.customerName.trim() &&
      !allCustomers.find((c) => c.code === formData.customerCode)
    ) {
      errors.customerName =
        "Customer Name is required or select a valid customer.";
      isValid = false;
    }
    if (!formData.soDate) {
      errors.soDate = "S.O Date is required.";
      isValid = false;
    }
    if (
      formData.deliveryDate &&
      isNaN(new Date(formData.deliveryDate).getTime())
    ) {
      errors.deliveryDate = "Invalid Delivery Date.";
      isValid = false;
    }

    // Validate sales items
    if (salesItems.length === 0) {
      errors.salesItems = "At least one item must be added to the sales order.";
      isValid = false;
    } else {
      salesItems.forEach((item, index) => {
        let itemErrorPrefix = `item_${item.id}`;

        if (!item.productCode.trim() && !item.productName.trim()) {
          errors[`${itemErrorPrefix}_product`] =
            "Product Code or Name is required.";
          isValid = false;
        } else if (
          item.productCode.trim() &&
          !item.productName.trim() &&
          allProducts.length > 0
        ) {
          if (!allProducts.find((p) => p.sku === item.productCode.trim())) {
            errors[`${itemErrorPrefix}_product`] =
              "Product Name missing or invalid Product Code.";
            isValid = false;
          }
        }
        // else if (!item.productCode.trim() && item.productName.trim() && allProducts.length > 0) {
        //     // Potentially add error if code is strictly required when name is present
        // }

        const quantity = parseFloat(item.quantity);
        if (isNaN(quantity) || quantity <= 0) {
          errors[`${itemErrorPrefix}_quantity`] =
            "Quantity must be a positive number.";
          isValid = false;
        }
        const price = parseFloat(item.price);
        if (isNaN(price) || price < 0) {
          errors[`${itemErrorPrefix}_price`] = "Price must be a valid number.";
          isValid = false;
        }
        if (
          !item.uom.trim() &&
          (item.productCode.trim() || item.productName.trim())
        ) {
          errors[`${itemErrorPrefix}_uom`] =
            "UOM is required for the selected product.";
          isValid = false;
        }
      }); // <<<forEach CLOSING BRACE - THIS WAS THE POINT OF ERROR IN PREVIOUS RESPONSE
    } // <<< ELSE CLOSING BRACE - THIS WAS THE POINT OF ERROR IN PREVIOUS RESPONSE

    setFormErrors(errors);
    return isValid;
  };

  // --- Place this ENTIRE handleSave function inside your SalesAdd component ---

  const handleSave = async () => {
    const isValid = validateForm(); // Call validateForm and store its result

    if (!isValid) {
      // Construct a more detailed error message for the modal from formErrors
      let modalErrorMessage = "Please correct the following errors:\n";
      const errorMessagesList = []; // Use a list to join later

      // Collect header errors
      if (formErrors.customerCode)
        errorMessagesList.push(`- Customer Code: ${formErrors.customerCode}`);
      if (formErrors.customerName)
        errorMessagesList.push(`- Customer Name: ${formErrors.customerName}`);
      if (formErrors.soDate)
        errorMessagesList.push(`- S.O Date: ${formErrors.soDate}`);
      if (formErrors.deliveryDate)
        errorMessagesList.push(`- Delivery Date: ${formErrors.deliveryDate}`);
      // Add other specific header errors if they exist in formErrors and you want them in the modal

      // Collect item errors
      let itemErrorFound = false;
      salesItems.forEach((item, index) => {
        const itemPrefix = `Item ${index + 1}: `;
        if (formErrors[`item_${item.id}_product`]) {
          errorMessagesList.push(
            `- ${itemPrefix}${formErrors[`item_${item.id}_product`]}`
          );
          itemErrorFound = true;
        }
        if (formErrors[`item_${item.id}_quantity`]) {
          errorMessagesList.push(
            `- ${itemPrefix}${formErrors[`item_${item.id}_quantity`]}`
          );
          itemErrorFound = true;
        }
        if (formErrors[`item_${item.id}_price`]) {
          errorMessagesList.push(
            `- ${itemPrefix}${formErrors[`item_${item.id}_price`]}`
          );
          itemErrorFound = true;
        }
        if (formErrors[`item_${item.id}_uom`]) {
          errorMessagesList.push(
            `- ${itemPrefix}${formErrors[`item_${item.id}_uom`]}`
          );
          itemErrorFound = true;
        }
        // Add checks for other specific item errors if you defined them in validateForm
      });

      // General items error (e.g., "At least one item must be added")
      if (formErrors.salesItems && !itemErrorFound) {
        errorMessagesList.push(`- ${formErrors.salesItems}`);
      }

      if (errorMessagesList.length > 0) {
        modalErrorMessage += errorMessagesList.join("\n");
      } else {
        // Fallback if somehow formErrors was populated but we didn't extract specific messages
        modalErrorMessage =
          "Please correct the errors marked in the form. Check highlighted fields.";
      }

      showAppModal(modalErrorMessage, "error");
      // Optional: Scroll to the first error field
      // const firstErrorField = document.querySelector('.input-error, .so-add-table-error, .so-add-field-error');
      // if (firstErrorField) {
      //   firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // }
      return; // Stop further execution
    }

    // If validation passes, proceed to save
    setIsSubmitting(true);
    // setFormErrors({}); // Clear previous form errors if any were set by validateForm
    // This is already done by validateForm itself at the end.

    // 1. Prepare salesItems JSON string
    const salesItemsJsonString = JSON.stringify(
      salesItems.map((item) => ({
        ProductCode: item.productCode,
        ProductName: item.productName,
        Quantity: parseFloat(item.quantity) || 0,
        UOM: item.uom,
        Price: parseFloat(item.price) || 0,
        WarehouseLocation: item.warehouseLocation,
        TaxCode: item.taxCode,
        TaxPrice: parseFloat(item.taxPrice) || 0,
        Total: parseFloat(item.total) || 0,
      }))
    );

    const payload = new FormData();

    // 2. Append individual fields that match SalesOrderCreateDto properties in C#
    payload.append("SalesOrderNo", formData.salesOrderNo);
    payload.append("CustomerCode", formData.customerCode);
    payload.append("CustomerName", formData.customerName);
    payload.append("SODate", formData.soDate);
    if (formData.deliveryDate) {
      payload.append("DeliveryDate", formData.deliveryDate);
    }
    payload.append("CustomerRefNumber", formData.customerRefNumber);
    payload.append("ShipToAddress", formData.shipToAddress);
    payload.append("SalesRemarks", formData.salesRemarks);
    payload.append("SalesEmployee", formData.salesEmployee);

    // 3. Append the stringified sales items
    payload.append("SalesItemsJson", salesItemsJsonString);

    // 4. Append files
    formData.uploadedFiles.forEach((file) => {
      payload.append("UploadedFiles", file, file.name);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/SalesOrders`, {
        method: "POST",
        body: payload,
        // 'Content-Type' is set automatically by the browser for FormData
      });

      if (!response.ok) {
        let displayErrorMessage = `Error saving sales order. Status: ${response.status}`;
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.indexOf("application/json") !== -1) {
          try {
            const errorData = await response.json();
            console.error("Backend Error Data:", errorData);

            if (errorData) {
              if (errorData.errors && typeof errorData.errors === "object") {
                const fieldErrors = errorData.errors;
                const messages = [];
                for (const key in fieldErrors) {
                  if (
                    fieldErrors.hasOwnProperty(key) &&
                    Array.isArray(fieldErrors[key])
                  ) {
                    let fieldName = key;
                    if (key.toLowerCase().startsWith("items[")) {
                      const match = key.match(/Items\[(\d+)\]\.(\w+)/i);
                      if (match) {
                        fieldName = `${match[2]} (Item ${
                          parseInt(match[1]) + 1
                        })`;
                      }
                    } else if (key.toLowerCase().startsWith("salesorderdto.")) {
                      // Attempt to remove "salesOrderDto." prefix if backend sends it like that from model binding
                      fieldName = key.substring("salesOrderDto.".length);
                    }
                    messages.push(
                      `${fieldName}: ${fieldErrors[key].join(", ")}`
                    );
                  }
                }
                if (messages.length > 0) {
                  displayErrorMessage = messages.join("\n");
                } else if (errorData.title) {
                  displayErrorMessage = errorData.title;
                }
              } else if (
                errorData.message &&
                typeof errorData.message === "string"
              ) {
                displayErrorMessage = errorData.message;
              } else if (
                errorData.title &&
                typeof errorData.title === "string"
              ) {
                displayErrorMessage = errorData.title;
              } else if (
                errorData.detail &&
                typeof errorData.detail === "string"
              ) {
                displayErrorMessage = errorData.detail;
              } else if (
                typeof errorData === "string" &&
                errorData.trim() !== ""
              ) {
                displayErrorMessage = errorData;
              }
            }
          } catch (e) {
            console.error("Failed to parse API error response as JSON:", e);
            try {
              const textError = await response.text();
              if (textError.trim()) displayErrorMessage = textError.trim();
            } catch (textE) {
              /* Keep original status code message */
            }
          }
        } else {
          // Non-JSON error response
          try {
            const textError = await response.text();
            if (textError.trim()) displayErrorMessage = textError.trim();
          } catch (textE) {
            /* Keep original status code message */
          }
        }
        throw new Error(displayErrorMessage || response.statusText);
      }

      const responseData = await response.json();
      showAppModal(
        `Sales Order ${
          responseData.salesOrderNo ||
          // responseData.id ||
          ""
        } created successfully!`,
        "success"
      );

      // setFormData(initialFormDataState); // Optionally reset form
      // setSalesItems([initialEmptyItem(Date.now())]); // Optionally reset items
      // Navigation is handled by closeAppModal
    } catch (error) {
      console.error("Error saving sales order (outer catch):", error);
      showAppModal(
        error.message ||
          "Failed to save sales order. An unknown error occurred.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) navigate("/salesorder");
  };
  const handleAddItemRow = () =>
    setSalesItems((prevItems) => [
      ...prevItems,
      initialEmptyItem(Date.now() + prevItems.length),
    ]);

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
  const filteredModalProducts = allProducts.filter((product) => {
    const term = searchTermModal.toLowerCase();
    return (
      (product.sku && product.sku.toLowerCase().includes(term)) ||
      (product.name && product.name.toLowerCase().includes(term))
    );
  });

  return (
    <>
      <MessageModal
        message={modalState.message}
        onClose={closeAppModal}
        type={modalState.type}
      />
      <div className="detail-page-container">
        <div className="detail-page-header-bar">
          <h1 className="detail-page-main-title">Create Sales Order</h1>
        </div>
        <div className="sales-order-add__form-header">
          <div className="entry-header-column">
            <div
              className="entry-header-field autocomplete-container"
              ref={customerCodeInputRef}
            >
              <label htmlFor="customerCode">Customer Code :</label>
              <input
                type="text"
                id="customerCode"
                name="customerCode"
                className={`form-input-styled ${
                  formErrors.customerCode ? "input-error" : ""
                }`}
                value={formData.customerCode}
                onChange={handleInputChange}
                onKeyDown={handleCustomerKeyDown}
                onFocus={() => {
                  if (formData.customerCode.trim() && allCustomers.length) {
                    const f = allCustomers.filter(
                      (c) =>
                        c.code &&
                        c.code
                          .toLowerCase()
                          .includes(formData.customerCode.trim().toLowerCase())
                    );
                    setCustomerSuggestions(f);
                    setShowCustomerSuggestionsForCode(f.length > 0);
                    setShowCustomerSuggestionsForName(false);
                  }
                }}
                autoComplete="off"
              />
              {showCustomerSuggestionsForCode &&
                customerSuggestions.length > 0 && (
                  <ul className="customer-suggestions-list customer-suggestions-list-code">
                    {customerSuggestions.map((c, i) => (
                      <li
                        key={c.id || c.code}
                        className={
                          i === activeSuggestionIndex ? "active-suggestion" : ""
                        }
                        onClick={() => handleCustomerSuggestionClick(c)}
                        onMouseEnter={() => setActiveSuggestionIndex(i)}
                      >
                        {c.code} - {c.name}
                      </li>
                    ))}
                  </ul>
                )}
            </div>
            {formErrors.customerCode && (
              <span className="so-add-field-error field-error-shift">
                {formErrors.customerCode}
              </span>
            )}
            <div
              className="entry-header-field autocomplete-container"
              ref={customerNameInputRef}
            >
              <label htmlFor="customerName">Customer Name :</label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                className={`form-input-styled ${
                  formErrors.customerName ? "input-error" : ""
                }`}
                value={formData.customerName}
                onChange={handleInputChange}
                onKeyDown={handleCustomerKeyDown}
                onFocus={() => {
                  if (formData.customerName.trim() && allCustomers.length) {
                    const f = allCustomers.filter(
                      (c) =>
                        c.name &&
                        c.name
                          .toLowerCase()
                          .includes(formData.customerName.trim().toLowerCase())
                    );
                    setCustomerSuggestions(f);
                    setShowCustomerSuggestionsForName(f.length > 0);
                    setShowCustomerSuggestionsForCode(false);
                  }
                }}
                autoComplete="off"
              />
              {showCustomerSuggestionsForName &&
                customerSuggestions.length > 0 && (
                  <ul className="customer-suggestions-list customer-suggestions-list-name">
                    {customerSuggestions.map((c, i) => (
                      <li
                        key={c.id || c.name}
                        className={
                          i === activeSuggestionIndex ? "active-suggestion" : ""
                        }
                        onClick={() => handleCustomerSuggestionClick(c)}
                        onMouseEnter={() => setActiveSuggestionIndex(i)}
                      >
                        {c.name} ({c.code})
                      </li>
                    ))}
                  </ul>
                )}
            </div>
            {formErrors.customerName && (
              <span className="so-add-field-error field-error-shift">
                {formErrors.customerName}
              </span>
            )}
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
              <textarea
                id="shipToAddress"
                name="shipToAddress"
                className="form-textarea-styled"
                rows="2"
                value={formData.shipToAddress}
                onChange={handleInputChange}
                readOnly
              />
            </div>
            <div className="entry-header-field">
              <label htmlFor="salesRemarks">Remarks :</label>
              <textarea
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
                className={`form-input-styled ${
                  formErrors.soDate ? "input-error" : ""
                }`}
                value={formData.soDate}
                onChange={handleInputChange}
              />
            </div>
            {formErrors.soDate && (
              <span className="so-add-field-error field-error-shift">
                {formErrors.soDate}
              </span>
            )}
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
                readOnly
              />
            </div>
            <div className="entry-header-field file-input-container">
              <label htmlFor="uploadFilesInput">Attachment(s) :</label>
              <input
                type="file"
                id="uploadFilesInput"
                ref={fileInputRef}
                className="form-input-file-hidden"
                onChange={handleFileInputChange}
                accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
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
            {formErrors.salesItems && (
              <div className="so-add-table-error">{formErrors.salesItems}</div>
            )}
            <div className="table-responsive-container">
              <table className="so-add__items-table">
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
                  {salesItems.map((item, index) => (
                    <tr key={item.id}>
                      <td className="editable-cell product-code-cell">
                        <input
                          type="text"
                          className={`so-add__table-input ${
                            formErrors[`item_${item.id}_product`]
                              ? "input-error"
                              : ""
                          }`}
                          value={item.productCode}
                          onChange={(e) =>
                            handleItemChange(e, item.id, "productCode")
                          }
                        />
                        <button
                          type="button"
                          className="so-add__lookup-indicator"
                          onClick={() => openProductLookupModal(item.id)}
                          title="Lookup Product"
                        >
                          <LookupIcon />
                        </button>
                      </td>
                      <td className="editable-cell product-name-cell">
                        <input
                          type="text"
                          className={`so-add__table-input ${
                            formErrors[`item_${item.id}_product`]
                              ? "input-error"
                              : ""
                          }`}
                          value={item.productName}
                          onChange={(e) =>
                            handleItemChange(e, item.id, "productName")
                          }
                        />
                        <button
                          type="button"
                          className="so-add__lookup-indicator"
                          onClick={() => openProductLookupModal(item.id)}
                          title="Lookup Product"
                        >
                          <LookupIcon />
                        </button>
                      </td>
                      <td className="editable-cell">
                        <input
                          type="number"
                          className={`so-add__table-input so-add__quantity-input ${
                            formErrors[`item_${item.id}_quantity`]
                              ? "input-error"
                              : ""
                          }`}
                          value={item.quantity}
                          min="0"
                          onChange={(e) =>
                            handleItemChange(e, item.id, "quantity")
                          }
                        />
                      </td>
                      <td className="editable-cell">
                        <input
                          type="text"
                          className="so-add__table-input so-add__uom-input"
                          value={item.uom}
                          onChange={(e) => handleItemChange(e, item.id, "uom")}
                        />
                      </td>
                      <td className="editable-cell">
                        <input
                          type="number"
                          className={`so-add__table-input so-add__price-input ${
                            formErrors[`item_${item.id}_price`]
                              ? "input-error"
                              : ""
                          }`}
                          value={item.price}
                          step="0.01"
                          min="0"
                          onChange={(e) =>
                            handleItemChange(e, item.id, "price")
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
                          onFocus={() => openTaxLookupModal(item.id)}
                        />
                        {item.showTaxLookup && (
                          <button
                            type="button"
                            className="so-add__lookup-indicator"
                            onClick={() => openTaxLookupModal(item.id)}
                            title="Lookup Tax"
                          >
                            <LookupIcon />
                          </button>
                        )}
                      </td>
                      <td className="editable-cell">
                        <input
                          type="number"
                          className="so-add__table-input so-add__tax-input"
                          value={item.taxPrice}
                          step="0.01"
                          min="0"
                          onChange={(e) =>
                            handleItemChange(e, item.id, "taxPrice")
                          }
                        />
                      </td>
                      <td className="total-cell">{item.total || "0.00"}</td>
                      <td className="action-cell">
                        <button
                          type="button"
                          className="remove-item-btn"
                          onClick={() => handleRemoveSalesItem(item.id)}
                          title="Remove this item"
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
                <label htmlFor="productTotalSummary" className="summary-label">
                  Product Total without Tax :
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
            <button
              className="footer-btn primary"
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Add Sales Order"}
            </button>
          </div>
          <button
            className="footer-btn secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Product Lookup Modal - FULL JSX ENSURED */}
      {isProductModalOpen && (
        <div className="modal-overlay product-lookup-modal-overlay">
          {" "}
          {/* Ensure CSS for this exists */}
          <div className="modal-content product-lookup-modal">
            {" "}
            {/* Ensure CSS for this exists */}
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
                placeholder="Search by Code or Name..."
                className="modal-search-input"
                value={searchTermModal}
                onChange={(e) => setSearchTermModal(e.target.value)}
                autoFocus
              />
              {isLoadingAllProducts && <p>Loading products...</p>}
              {allProductsError && (
                <p className="modal-error-text">Error: {allProductsError}</p>
              )}
              {!isLoadingAllProducts && !allProductsError && (
                <div className="product-lookup-table-container">
                  <table className="product-lookup-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>UOM</th>
                        <th>Retail Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredModalProducts.length > 0 ? (
                        filteredModalProducts.map((product) => (
                          <tr
                            key={product.id}
                            onClick={() =>
                              handleSelectProductFromModal(product)
                            }
                          >
                            <td>{product.sku}</td>
                            <td>{product.name}</td>
                            <td>{product.uom}</td>
                            <td>{product.retailPrice?.toFixed(2) ?? "N/A"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="modal-no-data">
                            No products found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* --- NEW: Tax Code Lookup Modal --- */}
      {isTaxLookupModalOpen && (
        <div className="modal-overlay tax-lookup-modal-overlay">
          {" "}
          {/* Use specific or shared CSS */}
          <div className="modal-content tax-lookup-modal">
            {" "}
            {/* Use specific or shared CSS */}
            <div className="modal-header">
              <h2>Select Tax Code</h2>
              <button
                className="modal-close-btn"
                onClick={() => setIsTaxLookupModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                placeholder="Search by Tax Code or Description..."
                className="modal-search-input" // Can reuse styles
                value={searchTermTaxLookupModal}
                onChange={(e) => setSearchTermTaxLookupModal(e.target.value)}
                autoFocus
              />
              {isLoadingTaxCodes && <p>Loading tax codes...</p>}
              {taxCodesError && (
                <p className="modal-error-text">
                  Error loading tax codes: {taxCodesError}
                </p>
              )}
              {!isLoadingTaxCodes && !taxCodesError && (
                <div className="product-lookup-table-container">
                  {" "}
                  {/* Can reuse styles */}
                  <table className="product-lookup-table">
                    {" "}
                    {/* Can reuse styles */}
                    <thead>
                      <tr>
                        <th>Tax Code</th>
                        <th>Description</th>
                        <th>Total %</th>
                        {/* Add CGST/SGST/IGST if useful to display in modal */}
                      </tr>
                    </thead>
                    <tbody>
                      {activeTaxCodes.filter((tax) => {
                        const term = searchTermTaxLookupModal.toLowerCase();
                        if (!term) return true; // Show all if search term is empty
                        return (
                          (tax.taxCode &&
                            tax.taxCode.toLowerCase().includes(term)) ||
                          (tax.taxDescription &&
                            tax.taxDescription.toLowerCase().includes(term))
                        );
                      }).length > 0 ? (
                        activeTaxCodes
                          .filter((tax) => {
                            const term = searchTermTaxLookupModal.toLowerCase();
                            if (!term) return true;
                            return (
                              (tax.taxCode &&
                                tax.taxCode.toLowerCase().includes(term)) ||
                              (tax.taxDescription &&
                                tax.taxDescription.toLowerCase().includes(term))
                            );
                          })
                          .map((tax) => (
                            <tr
                              key={tax.id || tax.taxCode} // Use tax.id if available from API
                              onClick={() => handleSelectTaxCodeFromModal(tax)}
                              style={{ cursor: "pointer" }}
                            >
                              <td>{tax.taxCode}</td>
                              <td>{tax.taxDescription}</td>
                              <td style={{ textAlign: "right" }}>
                                {tax.totalPercentage !== null &&
                                tax.totalPercentage !== undefined
                                  ? `${parseFloat(tax.totalPercentage).toFixed(
                                      2
                                    )}%`
                                  : "N/A"}
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="modal-no-data">
                            No active tax codes found matching your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default SalesAdd;
