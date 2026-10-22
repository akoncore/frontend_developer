import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Pets from "./pages/Pets";
import PetDetail from "./pages/PetDetail";
import AddPet from "./pages/AddPet";
import Clinics from "./pages/Clinics";
import Services from "./pages/Services";
import Appointments from "./pages/Appointments";
import NotFound from "./pages/NotFound";
import { ToastProvider } from "./context/ToastContext";
import "./styles.css";
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="pets" element={<Pets />} />
            <Route path="pets/new" element={<AddPet />} />
            <Route path="pets/:id" element={<PetDetail />} />
            <Route path="clinics" element={<Clinics />} />
            <Route path="services" element={<Services />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
