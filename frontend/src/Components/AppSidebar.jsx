import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useDrag } from "react-dnd";

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
  CNavGroup,
  CNavItem,
  CSidebarNav,
} from "@coreui/react";
import { Link } from "react-router-dom";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

import { getSavedCustomGates } from "../utils/customGate";

// We will define a new ItemTypes constant to identify our draggable items
export const ItemTypes = {
  GATE: "gate",
};

// This is the component for a single draggable gate in the sidebar
const DraggableGate = ({ name, type, icon }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.GATE,
    // The item payload that will be passed on drop
    item: { name, type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab",
        textDecoration: "none",
      }}
      className="nav-link align-items-center d-flex"
    >
      {icon}
      <span style={{ marginLeft: "0.5rem" }}>{name}</span>
    </div>
  );
};

// Define the gates that will be available in the sidebar
const basicGates = [
  {
    component: DraggableGate,
    name: "AND Gate",
    type: "AND",
    icon: <i className="fa-solid fa-circle-dot nav-icon"></i>,
  },
  {
    component: DraggableGate,
    name: "NOT Gate",
    type: "NOT",
    icon: <i className="fa-solid fa-do-not-enter nav-icon"></i>,
  },
];

// In the future, you can dynamically populate this from your state/storage
const customChips = [
  {
    component: DraggableGate,
    name: "NAND Chip",
    type: "NAND",
    icon: <i className="fa-solid fa-memory nav-icon"></i>,
  },
];

const AppSidebar = () => {
  const dispatch = useDispatch();
  const unfoldable = useSelector((state) => state.app.sidebarUnfoldable);
  const sidebarShow = useSelector((state) => state.app.sidebarShow);
  const customGates = getSavedCustomGates();

  return (
    <CSidebar
      className="border-end bg-body col"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        // Ensure you have a reducer that can handle this action format
        dispatch({ type: "app/setSidebarShow", payload: visible });
      }}
    >
      <CSidebarHeader className="border-bottom">
        <CSidebarBrand as={Link} to="/" className="w-100 d-flex">
          {/* Make sure your logo paths are correct in the public folder */}
          <img
            className="sidebar-brand-full mx-auto"
            src="/logo/logo-light.png"
            alt="Gatey Logo"
            height={32}
          />
          <img
            className="sidebar-brand-narrow mx-auto"
            src="/logo/logo-light.png"
            alt="Gatey Logo"
            height={32}
          />
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() =>
            dispatch({ type: "app/setSidebarShow", payload: false })
          }
        />
      </CSidebarHeader>

      <CSidebarNav as={SimpleBar}>
        <CNavGroup
          className="h-auto mt-2 ms-0"
          toggler={
            <>
              <i className="fa-solid fa-microchip nav-icon"></i>Basic Gates
            </>
          }
        >
          {basicGates.map((gate, index) => (
            <CNavItem as="div" key={`basic-${index}`}>
              <DraggableGate {...gate} />
            </CNavItem>
          ))}
        </CNavGroup>
        <hr />
        <CNavGroup
          className="h-auto mt-2 ms-0"
          toggler={
            <>
              <i className="fa-solid fa-user nav-icon"></i> Custom Chips
            </>
          }
        >
          {customGates.length === 0 && (
            <CNavItem>
              <span className="nav-link text-muted text-center">
                No chips saved
              </span>
            </CNavItem>
          )}
          {customGates.map((chip, index) => (
            <CNavItem as="div" key={`custom-${index}`}>
              <DraggableGate
                name={chip.name}
                type={chip.name} // Use name as unique type for custom gate
                icon={<i className="fa-solid fa-microchip nav-icon"></i>}
                isCustom={true}
              />
            </CNavItem>
          ))}
        </CNavGroup>
      </CSidebarNav>

      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler
          className="ms-auto text-dark-emphasis"
          onClick={() =>
            dispatch({ type: "app/setSidebarUnfoldable", payload: !unfoldable })
          }
        />
      </CSidebarFooter>
    </CSidebar>
  );
};

export default React.memo(AppSidebar);
