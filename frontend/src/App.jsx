import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import "@coreui/coreui/dist/css/coreui.min.css";

import "./scss/custom.scss";

import AppLayout from "./layout/appLayout";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./Components/Toaster";
import Gate2 from "./test/gate/Gate2";

function App() {
  return (
    <>
      <BrowserRouter>
      <Toaster />
        <Routes>
          <Route path="/" element={<AppLayout />} />
          <Route path="/test" element={<Gate2/>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
