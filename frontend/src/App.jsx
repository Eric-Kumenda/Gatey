import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import "@coreui/coreui/dist/css/coreui.min.css";

import "./scss/custom.scss";

import AppLayout from "./layout/appLayout";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./Components/Toaster";

function App() {
  return (
    <>
      <BrowserRouter>
      <Toaster />
        <Routes>
          <Route path="/" element={<AppLayout />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
