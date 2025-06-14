// src/components/workspace/Workspace.jsx
import React, { useRef, useState, useCallback } from "react"; // Added useCallback
import { useDrop } from "react-dnd";
import { useDispatch, useSelector } from "react-redux";
import { addGate, selectAllGates } from "../../store/gatesSlice";
import {
  selectAllWires,
  selectConnectionInProgress,
  setConnectionInProgress,
  addWire, // Make sure addWire is imported for local dispatch
  removeWiresConnectedToGate, // Ensure this is available for panel port deletion cleanup
} from "../../store/wiresSlice";
import {
  selectAllInputPorts, // Import new selectors
  selectAllOutputPorts,
  selectInputPortById,
  selectOutputPortById,
} from "../../store/panelPortsSlice"; // Import panelPortsSlice actions/selectors
import Gate from "../gate/Gate";
import Wire from "../wire/Wire";
import InputPanel from "./InputPanel"; // Import new panels
import OutputPanel from "./OutputPanel";
import { ItemTypes as SidebarItemTypes } from "../AppSidebar";
import "./Workspace.css";
import { CTooltip } from "@coreui/react";

const Workspace = () => {
  const dispatch = useDispatch();
  const gates = useSelector(selectAllGates);
  const wires = useSelector(selectAllWires);
  const inputPorts = useSelector(selectAllInputPorts); // Select panel input ports
  const outputPorts = useSelector(selectAllOutputPorts); // Select panel output ports
  const connectionInProgress = useSelector(selectConnectionInProgress);
  const workspaceRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 }); // State for mouse position

  const handleMouseMove = (e) => {
    if (connectionInProgress?.isConnecting) { // Only track if a connection is active
      const workspaceRect = workspaceRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - workspaceRect.left,
        y: e.clientY - workspaceRect.top,
      });
    }
  };

  const handleClick = (e) => {
    if (connectionInProgress?.isConnecting) {
      // Check if the click occurred on a gate or a port
      const clickedElement = e.target;
      const isPort = clickedElement.classList.contains("gate-port") || clickedElement.classList.contains("panel-port");
      const isGate = clickedElement.classList.contains("gate");

      if (!isPort && !isGate) {
        dispatch(
          setConnectionInProgress({
            isConnecting: false,
            sourceGateId: null,
            sourcePortId: null,
          })
        );
      }
    }
  };

  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      accept: SidebarItemTypes.GATE,
      drop: (item, monitor) => {
        const offset = monitor.getClientOffset();
        const workspaceBounds = workspaceRef.current.getBoundingClientRect();
        const position = {
          x: offset.x - workspaceBounds.left,
          y: offset.y - workspaceBounds.top,
        };
        dispatch(addGate(item.type, position));
        return undefined;
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    }),
    [dispatch]
  );

  const attachRef = (el) => {
    drop(el);
    workspaceRef.current = el;
  };

  const isActive = canDrop && isOver;
  let backgroundColor = "body";
  if (isActive) {
    backgroundColor = "info-subtle";
  } else if (canDrop) {
    backgroundColor = "body-secondary";
  }

  // New logic for handling port clicks, now central to Workspace
  const handlePortClick = useCallback((clickedGateId, clickedPortId, clickedPortType, portElement) => {
    if (connectionInProgress?.isConnecting) {
      const { sourceGateId, sourcePortId } = connectionInProgress;

      // Prevent connecting a port to itself
      if (sourceGateId === clickedGateId && sourcePortId === clickedPortId) {
        console.warn("Cannot connect a port to itself");
        dispatch(setConnectionInProgress({ isConnecting: false, sourceGateId: null, sourcePortId: null }));
        return;
      }

      // Determine sourcePortType
      let sourcePortType;
      if (sourceGateId === "inputPanel") {
        sourcePortType = "output"; // Input panel ports act as wire sources (outputs)
      } else if (sourceGateId === "outputPanel") {
        sourcePortType = "input"; // Output panel ports act as wire destinations (inputs)
      } else {
        const sourceGate = gates.find(g => g.id === sourceGateId);
        if (!sourceGate || !sourceGate.ports) {
          console.error("Source gate or its ports not found in state:", sourceGateId);
          dispatch(setConnectionInProgress({ isConnecting: false, sourceGateId: null, sourcePortId: null }));
          return;
        }
        const sourcePort =
          sourceGate.ports.inputs.find((p) => p.id === sourcePortId) ||
          sourceGate.ports.outputs.find((p) => p.id === sourcePortId);
        if (!sourcePort) {
          console.error("Source port not found on gate:", sourcePortId);
          dispatch(setConnectionInProgress({ isConnecting: false, sourceGateId: null, sourcePortId: null }));
          return;
        }
        sourcePortType = sourcePort.type;
      }

      let finalSourceGateId, finalSourcePortId, finalDestinationGateId, finalDestinationPortId;

      // Basic connection validation: output to input only
      if (sourcePortType === "output" && clickedPortType === "input") {
        finalSourceGateId = sourceGateId;
        finalSourcePortId = sourcePortId;
        finalDestinationGateId = clickedGateId;
        finalDestinationPortId = clickedPortId;
      } else if (sourcePortType === "input" && clickedPortType === "output") {
        // Allow connecting from input to output by flipping
        finalSourceGateId = clickedGateId;
        finalSourcePortId = clickedPortId;
        finalDestinationGateId = sourceGateId;
        finalDestinationPortId = sourcePortId;
      } else {
        console.warn("Invalid connection type. Cannot connect input to input or output to output.");
        dispatch(setConnectionInProgress({ isConnecting: false, sourceGateId: null, sourcePortId: null }));
        return;
      }

      dispatch(addWire(finalSourceGateId, finalSourcePortId, finalDestinationGateId, finalDestinationPortId));
      dispatch(setConnectionInProgress({ isConnecting: false, sourceGateId: null, sourcePortId: null }));
    } else {
      // No connection in progress, start a new one
      dispatch(setConnectionInProgress({ sourceGateId: clickedGateId, sourcePortId: clickedPortId, isConnecting: true }));
    }
  }, [connectionInProgress, gates, dispatch]); // Dependencies for useCallback

  // This function is passed to the Wire component to find actual DOM elements
  const getGateAndPortElements = useCallback((gateId, portId) => {
    if (gateId === "mouse" && portId === "current") {
      return {
        gateElement: null,
        portElement: {
          getBoundingClientRect: () => ({
            left: mousePosition.x + (workspaceRef.current?.getBoundingClientRect().left || 0),
            top: mousePosition.y + (workspaceRef.current?.getBoundingClientRect().top || 0),
            width: 0,
            height: 0,
          }),
        },
      };
    } else if (gateId === "inputPanel") {
        return {
            gateElement: document.getElementById("input-panel"), // Need an ID on the InputPanel div
            portElement: document.getElementById(`panel-input-port-${portId}`),
        };
    } else if (gateId === "outputPanel") {
        return {
            gateElement: document.getElementById("output-panel"), // Need an ID on the OutputPanel div
            portElement: document.getElementById(`panel-output-port-${portId}`),
        };
    } else {
      const gateElement = document.getElementById(`gate-${gateId}`);
      const portElement = document.getElementById(`gate-${gateId}-port-${portId}`);
      return { gateElement, portElement };
    }
  }, [mousePosition]); // mousePosition is a dependency for the temporary wire

  return (
    <>
      <div className="d-flex h-100"> {/* Flex container for panels and workspace */}
        <InputPanel onPortClick={handlePortClick} /> {/* Render InputPanel */}

        <div
          ref={attachRef}
          id="workspace"
          className={`d-flex flex-column position-relative overflow-hidden rounded border h-100 flex-grow-1 bg-${backgroundColor}`}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
        >
          {gates.map((gate) => (
            <Gate
              key={gate.id}
              id={gate.id}
              type={gate.type}
              initialPosition={gate.position}
              onPortClick={handlePortClick} // Pass handlePortClick to Gate
            />
          ))}

          <svg
            className="wire-svg position-absolute top-0 start-0 w-100 h-100"
            style={{ pointerEvents: "none" }}
          >
            {wires.length > 0 &&
              wires.map((wire) => (
                <Wire
                  key={wire.id}
                  wire={wire}
                  gates={gates} // gates prop is actually not needed in Wire with getGateAndPortElements
                  getGateAndPortElements={getGateAndPortElements}
                />
              ))}

            {connectionInProgress?.isConnecting && ( // Only render if connection is active
              <Wire
                wire={{
                  source: connectionInProgress,
                  destination: { gateId: "mouse", portId: "current" },
                  isActive: true,
                }}
                gates={[]} // Not strictly needed
                getGateAndPortElements={getGateAndPortElements}
              />
            )}
          </svg>
        </div>

        <OutputPanel onPortClick={handlePortClick} /> {/* Render OutputPanel */}
      </div>

      {connectionInProgress?.isConnecting ? (
        <CTooltip
          content={`Connection mode: Source Gate ID: ${connectionInProgress.sourceGateId}, Port ID: ${connectionInProgress.sourcePortId}`}
          placement="left"
        >
          <button className="btn bg-body-secondary border rounded-pill position-absolute bottom-0 end-0 mb-4 me-4 shadow ">
            <i className="fa-regular fa-link"></i>
          </button>
        </CTooltip>
      ) : null}
    </>
  );
};

export default Workspace;