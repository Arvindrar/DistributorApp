// src/components/Home/Home.jsx
import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import "./Home.css"; // Your existing Home.css
import Sidebar from "./Sidebar";

// Main pages
import Dashboard from "../Dashboard/Dashboard";
import Customers from "./Customers";
import AddCustomers from "./AddCustomers";
import Products from "./pages/Products";
import ProductsAdd from "./pages/ProductsAdd";
import Purchase from "./pages/Purchase";
import Sales from "./pages/Sales";
import SalesAdd from "./pages/SalesAdd";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";

// Customer submenu pages
import CustomerRelationshipMgmt from "./Customers"; // Assuming this is the component for CRM
import CustomerGroup from "./CustomerGroup";

// Product submenu pages
import ProductsGroup from "./pages/ProductsGroup";

// Sales & Purchase submenu page components
import Invoice from "./pages/Invoice";
import IncomingPayment from "./pages/IncomingPayment";
import PurchaseAdd from "./pages/PurchaseAdd";
import GRPO from "./pages/GRPO";
import GRPOadd from "./pages/GRPOadd";
// Placeholder for pages you might need for other submenu items
import OutgoingPayment from "./pages/OutgoingPayment";
import SalesEmployee from "./pages/SalesEmployee";
import Routess from "./pages/Routess";

function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  // Initialize activePage - useEffect will refine this on mount and path changes
  const [activePage, setActivePage] = useState("Dashboard");

  const sidebarNavItems = [
    "Customers",
    "Products",
    "Purchase",
    "Sales",
    "Inventory",
    "Reports",
  ];

  useEffect(() => {
    const path = location.pathname.toLowerCase();

    // <<< MODIFIED: Handle Dashboard case first
    if (path === "/" || path === "/dashboard") {
      setActivePage("Dashboard");
      return; // Early exit if it's the dashboard
    }

    // --- Logic to determine active main navigation item based on path ---
    let currentNavItem = ""; // Default to empty or a specific default if preferred

    if (
      path.startsWith("/purchaseorder") ||
      path.startsWith("/grpo") ||
      path.startsWith("/outgoingpayment") // Assuming this path exists
    ) {
      currentNavItem = "Purchase";
    } else if (
      path.startsWith("/salesorder") ||
      path.startsWith("/invoice") ||
      path.startsWith("/incomingpayment")
    ) {
      currentNavItem = "Sales";
    } else if (
      path.startsWith("/customerrelationshipmgmt") ||
      path.startsWith("/customergroup") ||
      path.startsWith("/routess") || // Assuming this path exists
      path.startsWith("/salesemployee") || // Assuming this path exists
      path.startsWith("/customers") // Catches /customers, /customers/add
    ) {
      currentNavItem = "Customers";
    } else if (
      path.startsWith("/productdetails") ||
      path.startsWith("/productsgroup") ||
      path.startsWith("/products") // Catches /products, /products/add
    ) {
      currentNavItem = "Products";
    } else {
      // Fallback for direct main item paths (e.g., /inventory, /reports)
      const matchedMain = sidebarNavItems.find((item) => {
        const itemPathSegment = item.toLowerCase().replace(/\s+/g, "");
        return path.startsWith(`/${itemPathSegment}`);
      });
      if (matchedMain) {
        currentNavItem = matchedMain;
      } else {
        // If no specific match, you might want a default or leave as is
        // For instance, default to the first item if no other match and not dashboard
        currentNavItem = sidebarNavItems[0]; // Default to "Customers"
      }
    }
    setActivePage(currentNavItem);
  }, [location.pathname]); // Removed sidebarNavItems as it's constant within this scope

  const handlePageChange = (pageName) => {
    // <<< MODIFIED: Handle "Dashboard" navigation
    if (pageName === "Dashboard") {
      navigate("/");
      return;
    }

    let pathSegment = pageName.toLowerCase().replace(/\s+/g, "");

    // Specific mappings for submenu items to ensure correct navigation
    if (pageName === "Purchase Order") pathSegment = "purchaseorder";
    if (pageName === "Sales Order") pathSegment = "salesorder";
    if (pageName === "Customer Relationship Mgmt")
      pathSegment = "customerrelationshipmgmt";
    if (pageName === "Customer Group") pathSegment = "customergroup";
    if (pageName === "Routess") pathSegment = "routess"; // Ensure you have a route for '/route'
    if (pageName === "Sales Employee") pathSegment = "salesemployee"; // Ensure you have a route for '/salesemployee'
    if (pageName === "Product Details") pathSegment = "productdetails";
    if (pageName === "Products Group") pathSegment = "productsgroup";
    if (pageName === "GRPO") pathSegment = "grpo";
    if (pageName === "Outgoing Payment") pathSegment = "outgoingpayment"; // Ensure you have a route
    if (pageName === "Invoice") pathSegment = "invoice";
    if (pageName === "Incoming Payment") pathSegment = "incomingpayment";

    // For main items without specific overrides, the default pathSegment works
    navigate(`/${pathSegment}`);
  };

  return (
    <div className="home-container">
      <Sidebar
        navItems={sidebarNavItems}
        activePage={activePage}
        onPageChange={handlePageChange}
      />
      <main className="main-content">
        <Routes>
          {/* Dashboard Route (Root) */}
          <Route path="/" element={<Dashboard />} />{" "}
          {/* Ensure this is the first specific route */}
          <Route path="/dashboard" element={<Navigate replace to="/" />} />{" "}
          {/* Optional: redirect /dashboard to / */}
          {/* Customer Routes */}
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/add" element={<AddCustomers />} />
          <Route
            path="/customerrelationshipmgmt"
            element={<CustomerRelationshipMgmt />}
          />
          <Route path="/customergroup" element={<CustomerGroup />} />
          {/* Add routes for RoutePage and SalesEmployeePage if they exist */}
          <Route path="/routess" element={<Routess />} />
          <Route path="/salesemployee" element={<SalesEmployee />} />
          {/* Product Routes */}
          <Route path="/products" element={<Products />} />
          <Route path="/products/add" element={<ProductsAdd />} />
          <Route path="/productdetails" element={<Products />} />
          <Route path="/productsgroup" element={<ProductsGroup />} />
          {/* Purchase Routes */}
          <Route path="/purchaseorder" element={<Purchase />} />
          <Route path="/purchaseorder/add" element={<PurchaseAdd />} />
          <Route path="/grpo" element={<GRPO />} />
          <Route path="/grpo/add" element={<GRPOadd />} />
          <Route path="/outgoingpayment" element={<OutgoingPayment />} />
          {/* Sales Routes */}
          <Route path="/salesorder" element={<Sales />} />
          <Route path="/salesorder/add" element={<SalesAdd />} />
          <Route path="/invoice" element={<Invoice />} />
          <Route path="/incomingpayment" element={<IncomingPayment />} />
          {/* Other Main Routes */}
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/reports" element={<Reports />} />
          {/* Fallback/Default Route - if you want to redirect unknown paths */}
          {/* <Route path="*" element={<Navigate replace to="/" />} /> */}
          {/* Or keep the current default if / is already Dashboard */}
          {/* The Navigate component as the last child of Routes or inside a specific Route
             is usually for unmatched paths, but here '/' is explicitly defined.
             The original Navigate to /customers is fine if / doesn't render Dashboard.
             But since / IS Dashboard, this specific Navigate might be redundant if Dashboard is the default.
          */}
          <Route path="*" element={<Navigate replace to="/" />} />{" "}
          {/* Redirect any unmatched path to Dashboard */}
        </Routes>
      </main>
    </div>
  );
}

export default Home;
