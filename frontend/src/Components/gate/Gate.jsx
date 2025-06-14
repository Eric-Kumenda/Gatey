// src/components/gate/Gate.jsx
import React, { useRef, useState } from "react";
import { useDrag } from "react-dnd";
import { useDispatch, useSelector } from "react-redux";
import { moveGate, removeGate, selectGateById } from "../../store/gatesSlice"; // Import selectGateById
import { removeWiresConnectedToGate } from "../../store/wiresSlice";
import "./Gate.css";
import ContextMenu from "../ContextMenu";

export const ItemTypes = {
  GATE_ON_BOARD: "gate_on_board",
  PORT: "port",
};

// Port component needs to receive its current state value
const Port = ({ gateId, portId, type, onPortClick, isActive, value }) => {
  // Added 'value' prop
  const portRef = useRef(null);

  const handleClick = (e) => {
    e.stopPropagation();
    onPortClick(gateId, portId, type, portRef.current);
  };

  const activeClass = isActive ? "port-active" : "";
  // Color based on 'value' prop: bright blue for ON, dark subtle for OFF
  const valueClass = value ? "bg-success" : "bg-dark-subtle";

  return (
    <div
      id={`gate-${gateId}-port-${portId}`}
      ref={portRef}
      className={`gate-port gate-port-${type} gate-port-id-${portId} my-1 ${activeClass} ${valueClass} rounded-circle border`} // Apply valueClass
      onClick={handleClick}
      style={{ cursor: "cell" }}
    ></div>
  );
};

const Gate = ({ id, type, initialPosition, onPortClick }) => {
  const dispatch = useDispatch();
  const connectionInProgress = useSelector(
    (state) => state.wires.connectionInProgress
  );
  // Select the specific gate entity to get its input/output states for coloring
  const gate = useSelector((state) => selectGateById(state, id));

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.GATE_ON_BOARD,
      item: { id, type },
      end: (item, monitor) => {
        const delta = monitor.getDifferenceFromInitialOffset();
        if (!delta) return;

        const newPosition = {
          x: Math.round(initialPosition.x + delta.x),
          y: Math.round(initialPosition.y + delta.y),
        };
        dispatch(moveGate({ id: item.id, position: newPosition }));
      },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [id, initialPosition]
  );

  const getGatePorts = (gateType) => {
    // This function can remain as is, it defines the static port structure
    switch (gateType) {
      case "AND":
        return {
          inputs: [
            { id: "in1", label: "A", type: "input" },
            { id: "in2", label: "B", type: "input" },
          ],
          outputs: [{ id: "out1", label: "Q", type: "output" }],
        };
      case "NOT":
        return {
          inputs: [{ id: "in1", label: "A", type: "input" }],
          outputs: [{ id: "out1", label: "Q", type: "output" }],
        };
      default:
        return { inputs: [], outputs: [] };
    }
  };

  const gatePorts = getGatePorts(type);

  const [menuPosition, setMenuPosition] = useState(null);

  const handleRightClick = (e) => {
    e.preventDefault();
    setMenuPosition({ x: e.clientX, y: e.clientY });
  };

  const handleDelete = () => {
    dispatch(removeGate({ id }));
    dispatch(removeWiresConnectedToGate({ gateId: id }));
    setMenuPosition(null);
  };

  // Ensure 'gate' object is available before trying to access its properties
  if (!gate) {
    return null; // Or some fallback UI if the gate isn't found in state
  }

  return (
    <div
      ref={drag}
      id={`gate-${id}`}
      onContextMenu={handleRightClick}
      className="gate position-absolute p-2 border rounded d-flex align-items-center shadow bg-body-secondary"
      style={{
        top: `${initialPosition.y}px`,
        left: `${initialPosition.x}px`,
        cursor: "grab",
      }}
    >
      <div className="d-flex flex-column">
        {gatePorts.inputs.map((inputPort) => (
          <Port
            key={inputPort.id}
            gateId={id}
            portId={inputPort.id}
            type="input"
            onPortClick={onPortClick}
            isActive={
              connectionInProgress?.isConnecting &&
              connectionInProgress.sourceGateId === id &&
              connectionInProgress.sourcePortId === inputPort.id
            }
            // Pass the current input state for this specific port
            value={gate.inputStates[inputPort.id]}
          />
        ))}
      </div>
      <div className="gate-body px-4 py-2 fw-bold">{type}</div>
      <div className="d-flex flex-column">
        {gatePorts.outputs.map((outputPort) => (
          <Port
            key={outputPort.id}
            gateId={id}
            portId={outputPort.id}
            type="output"
            onPortClick={onPortClick}
            isActive={
              connectionInProgress?.isConnecting &&
              connectionInProgress.sourceGateId === id &&
              connectionInProgress.sourcePortId === outputPort.id
            }
            // Pass the current output state for this specific port
            value={gate.outputStates[outputPort.id]}
          />
        ))}
      </div>
      {menuPosition && (
        <ContextMenu
          x={menuPosition.x}
          y={menuPosition.y}
          onDelete={handleDelete}
          onClose={() => setMenuPosition(null)}
        />
      )}
    </div>
  );
};

export default Gate;
