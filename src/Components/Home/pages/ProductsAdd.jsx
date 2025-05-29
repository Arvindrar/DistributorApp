import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ProductsAdd.css"; // Import the new CSS with prefixed class names

function ProductsAdd() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    productCode: "",
    productName: "",
    productGroup: "",
    uomGroup: "",
    uom: "",
    hsn: "",
    retailPrice: "",
    wholesalePrice: "",
    imageFileName: "",
  });
  const [imageFile, setImageFile] = useState(null);

  const productGroupOptions = [
    { value: "Brooming Products", label: "Brooming Products" },
    { value: "Bathroom Cleaning", label: "Bathroom Cleaning Products" },
    // ... other groups
  ];

  const uomGroupOptions = [
    { value: "Weight", label: "Weight (kg, g)" },
    { value: "Volume", label: "Volume (L, ml)" },
    { value: "Count", label: "Count (Piece, Set, Pack)" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setFormData((prev) => ({ ...prev, imageFileName: file.name }));
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleSave = () => {
    const dataToSubmit = new FormData();
    for (const key in formData) {
      dataToSubmit.append(key, formData[key]);
    }
    if (imageFile) {
      dataToSubmit.append("productImage", imageFile, imageFile.name);
    }
    console.log("Saving new product:", Object.fromEntries(dataToSubmit));
    alert("Product data prepared for submission (see console).");
    // navigate('/products');
  };

  const handleCancel = () => {
    navigate("/products");
  };

  return (
    <div className="pa-page-container">
      {" "}
      {/* UPDATED */}
      <div className="pa-header-bar">
        {" "}
        {/* UPDATED */}
        <h1 className="pa-main-title">New Product</h1> {/* UPDATED */}
      </div>
      <div className="pa-form-content-area">
        {" "}
        {/* UPDATED */}
        <div className="pa-form-grid">
          {" "}
          {/* UPDATED */}
          <div className="pa-form-column">
            {" "}
            {/* UPDATED */}
            <div className="pa-field-group">
              {" "}
              {/* UPDATED */}
              <label htmlFor="productCode">Product Code :</label>
              <input
                type="text"
                id="productCode"
                name="productCode"
                className="pa-input" /* UPDATED */
                value={formData.productCode}
                onChange={handleInputChange}
              />
            </div>
            <div className="pa-field-group">
              {" "}
              {/* UPDATED */}
              <label htmlFor="productName">Product Name :</label>
              <input
                type="text"
                id="productName"
                name="productName"
                className="pa-input" /* UPDATED */
                value={formData.productName}
                onChange={handleInputChange}
              />
            </div>
            <div className="pa-field-group">
              {" "}
              {/* UPDATED */}
              <label htmlFor="productGroup">Product Group :</label>
              <input
                type="text"
                id="productGroup"
                name="productGroup"
                className="pa-input" /* UPDATED */
                value={formData.productGroup}
                onChange={handleInputChange}
                placeholder="e.g., Brooming Products"
              />
              {/* Example for select:
              <select id="productGroup" name="productGroup" className="pa-select" value={formData.productGroup} onChange={handleInputChange}>
                <option value="">Select Group...</option>
                {productGroupOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              */}
            </div>
            <div className="pa-field-group">
              {" "}
              {/* UPDATED */}
              <label htmlFor="uomGroup">UOM Group :</label>
              <input
                type="text"
                id="uomGroup"
                name="uomGroup"
                className="pa-input" /* UPDATED */
                value={formData.uomGroup}
                onChange={handleInputChange}
                placeholder="e.g., Count, Weight"
              />
            </div>
            <div className="pa-field-group">
              {" "}
              {/* UPDATED */}
              <label htmlFor="uom">UOM :</label>
              <input
                type="text"
                id="uom"
                name="uom"
                className="pa-input" /* UPDATED */
                value={formData.uom}
                onChange={handleInputChange}
                placeholder="e.g., Piece, Kg, Pack"
              />
            </div>
            <div className="pa-field-group">
              {" "}
              {/* UPDATED */}
              <label htmlFor="uploadImage">Upload Image :</label>
              <div className="pa-file-input-wrapper">
                {" "}
                {/* UPDATED */}
                <input
                  type="text"
                  id="imageFileName"
                  name="imageFileName"
                  className="pa-input" /* UPDATED */
                  value={formData.imageFileName}
                  placeholder="No file chosen"
                  readOnly
                  onClick={handleBrowseClick}
                />
                <button
                  type="button"
                  className="pa-browse-button"
                  onClick={handleBrowseClick}
                >
                  {" "}
                  {/* UPDATED */}
                  Browse files
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="pa-hidden-file-input" /* UPDATED */
                  accept="image/png, image/jpeg, image/webp, image/jpg"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>
          <div className="pa-form-column">
            {" "}
            {/* UPDATED */}
            <div className="pa-field-group">
              {" "}
              {/* UPDATED */}
              <label htmlFor="hsn">HSN :</label>
              <input
                type="text"
                id="hsn"
                name="hsn"
                className="pa-input" /* UPDATED */
                value={formData.hsn}
                onChange={handleInputChange}
              />
            </div>
            <div className="pa-field-group">
              {" "}
              {/* UPDATED */}
              <label htmlFor="retailPrice">Retail Price :</label>
              <input
                type="number"
                id="retailPrice"
                name="retailPrice"
                className="pa-input" /* UPDATED */
                value={formData.retailPrice}
                onChange={handleInputChange}
                step="0.01"
              />
            </div>
            <div className="pa-field-group">
              {" "}
              {/* UPDATED */}
              <label htmlFor="wholesalePrice">Wholesale Price :</label>
              <input
                type="number"
                id="wholesalePrice"
                name="wholesalePrice"
                className="pa-input" /* UPDATED */
                value={formData.wholesalePrice}
                onChange={handleInputChange}
                step="0.01"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="pa-footer">
        {" "}
        {/* UPDATED */}
        <div className="pa-footer-actions-main">
          {" "}
          {/* UPDATED */}
          <button className="pa-btn primary" onClick={handleSave}>
            {" "}
            {/* UPDATED */}
            Add Product
          </button>
        </div>
        <button className="pa-btn primary" onClick={handleCancel}>
          {" "}
          {/* UPDATED */}
          Cancel
        </button>
      </div>
    </div>
  );
}

export default ProductsAdd;
