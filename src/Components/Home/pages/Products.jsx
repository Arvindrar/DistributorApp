import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Products.css"; // Ensure this is imported and path is correct

import imgA1 from "../../../assets/b1.jpg";
import imgA2 from "../../../assets/b2.jpg";
import imgA3 from "../../../assets/b3.jpg";
import imgA4 from "../../../assets/b4.jpg";
import imgA5 from "../../../assets/b5.jpg";
import imgA6 from "../../../assets/b6.jpg";
import imgA7 from "../../../assets/b7.jpg";
import imgA8 from "../../../assets/b8.jpg";
// Assuming imgA9 and placeholderImg were intended to be unique or specific if needed
// For now, let's keep them as you had in the last snippet
import imgA9 from "../../../assets/b1.jpg"; // Example: Reusing b1 for SKU005 if it's different from imgA7
import placeholderImg from "../../../assets/b2.jpg"; // Example: Reusing b2 as placeholder

function Products() {
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const productGroupOptions = [
    { value: "Brooms", label: "Brooms" },
    { value: "Mops", label: "Mops" },
    { value: "Floor Cleaners", label: "Floor Cleaners" },
    { value: "Bathroom Care", label: "Bathroom Care" },
    { value: "Laundry Care", label: "Laundry Care" },
    { value: "Personal Care", label: "Personal Care" },
  ];

  const [productsData, setProductsData] = useState([
    {
      id: "SKU001",
      name: "Monkey 555 International steel Handle Broom",
      group: "Brooms",
      uom: "Piece",
      price: { min: 220.0, max: 440.0 }, // Store as an object
      imageSrc: imgA1,
    },
    {
      id: "SKU002",
      name: "Monkey 555 Mach 3 Broom",
      group: "Brooms",
      uom: "Piece",
      price: { min: 190.0, max: 380.0 }, // Store as an object
      imageSrc: imgA2,
    },
    {
      id: "SKU003",
      name: "Monkey 555 T-Mop Popular",
      group: "Mops",
      uom: "piece",
      price: { min: 185.0, max: 370.0 }, // Store as an object
      imageSrc: imgA3,
    },
    {
      id: "SKU004",
      name: "Black Belt Phenolic Cleaner 500 ML",
      group: "Floor Cleaners",
      uom: "Piece",
      price: 150.0, // Single price remains a number
      imageSrc: imgA4,
    },
    {
      id: "SKU021",
      name: "Black Belt Toilet Cleaner 500 ML",
      group: "Bathroom Care",
      uom: "Piece",
      price: { min: 150.0, max: 300.0 }, // Store as an object
      imageSrc: imgA5,
    },
    {
      id: "SKU022",
      name: "Monkey VVV Wonder Wash Detergent Powder - 1kg",
      group: "Laundry Care",
      uom: "Piece",
      price: { min: 70.0, max: 140.0 }, // Store as an object
      imageSrc: imgA6,
    },
    {
      id: "SKU005",
      name: "Monkey 555 Soft Broom",
      group: "Brooms",
      uom: "Set", // Changed from Piece to Set based on previous examples for brooms, adjust if needed
      price: { min: 230.0, max: 460.0 }, // Store as an object
      imageSrc: imgA7, // Using imgA7, ensure this is the correct image
    },
    {
      id: "SKU006",
      name: "Monkey 555 Spin Mop",
      group: "Mops",
      uom: "piece",
      price: 1499.0, // Single price remains a number
      imageSrc: imgA8,
    },
    {
      id: "SKU007",
      name: "Monkey 555 International steel Handle Broom",
      group: "Brooms",
      uom: "Piece",
      price: { min: 220.0, max: 440.0 }, // Store as an object
      imageSrc: imgA1,
    },
    {
      id: "SKU008",
      name: "Monkey 555 Mach 3 Broom",
      group: "Brooms",
      uom: "Piece",
      price: { min: 190.0, max: 380.0 }, // Store as an object
      imageSrc: imgA2,
    },
    {
      id: "SKU009",
      name: "Monkey 555 T-Mop Popular",
      group: "Mops",
      uom: "piece",
      price: { min: 185.0, max: 370.0 }, // Store as an object
      imageSrc: imgA3,
    },
    {
      id: "SKU010",
      name: "Black Belt Phenolic Cleaner 500 ML",
      group: "Floor Cleaners",
      uom: "Piece",
      price: 150.0, // Single price remains a number
      imageSrc: imgA4,
    },
  ]);

  const handleGroupChange = (event) => {
    setSelectedGroup(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAddProductClick = () => {
    console.log("Add Product button clicked, navigating to /products/add");
    navigate("/products/add");
  };

  const filteredProducts = productsData.filter((product) => {
    const groupMatch = selectedGroup ? product.group === selectedGroup : true;
    const searchMatch = searchTerm
      ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.id &&
          product.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.group &&
          product.group.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;
    return groupMatch && searchMatch;
  });

  // --- MODIFIED formatCurrency function ---
  const formatCurrency = (priceValue) => {
    // Helper function to format a single number
    const singleFormatter = (amount) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
      }).format(amount);

    if (
      typeof priceValue === "object" &&
      priceValue !== null &&
      typeof priceValue.min === "number" &&
      typeof priceValue.max === "number"
    ) {
      // It's a price range object
      return `${singleFormatter(priceValue.min)} - ${singleFormatter(
        priceValue.max
      )}`;
    } else if (typeof priceValue === "number") {
      // It's a single price number
      return singleFormatter(priceValue);
    }
    // Fallback for unexpected price format
    return "Price not available";
  };

  return (
    <div className="products-overview__page-content">
      <h1>Products Details</h1>

      <div className="filter-controls-container-inline">
        <div className="products-overview__filter-item">
          <span className="products-overview__filter-label">
            Product group:
          </span>
          <select
            name="productGroup"
            className="products-overview__filter-select"
            value={selectedGroup}
            onChange={handleGroupChange}
          >
            <option value="">All Groups</option>
            {productGroupOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="products-overview__filter-item">
          <span className="products-overview__filter-label">Search:</span>
          <input
            type="text"
            name="productSearch"
            className="products-overview__filter-input"
            placeholder="Search products by name, SKU, group..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="add-new-action-group">
          <span className="add-new-label">Add</span>
          <button
            className="add-new-plus-button"
            onClick={handleAddProductClick}
            title="Add New Product"
          >
            +
          </button>
        </div>
      </div>

      <div className="products-overview__card-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product.id} className="products-overview__product-card">
              <div className="products-overview__card-image-container">
                <img
                  src={product.imageSrc}
                  alt={product.name}
                  className="products-overview__card-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = placeholderImg;
                  }}
                />
              </div>
              <div className="products-overview__card-details">
                <p className="products-overview__card-detail-item">
                  <strong>Code:</strong> {product.id}
                </p>
                <p className="products-overview__card-detail-item products-overview__card-name">
                  <strong>Name:</strong> {product.name}
                </p>
                <p className="products-overview__card-detail-item">
                  <strong>Group:</strong> {product.group}
                </p>
                <p className="products-overview__card-detail-item">
                  <strong>UOM:</strong> {product.uom}
                </p>
                <p className="products-overview__card-detail-item products-overview__card-price">
                  <strong>Price:</strong> {formatCurrency(product.price)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="products-overview__no-results">
            <p>No products match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
