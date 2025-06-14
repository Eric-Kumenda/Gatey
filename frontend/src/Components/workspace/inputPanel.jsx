// src/components/panels/InputPanel.jsx
import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addInputPort,
  toggleInputPort,
  selectAllInputPorts,
  updateInputPortName,
  removeInputPort,
} from "../../store/panelPortsSlice";
import {
  setConnectionInProgress,
  selectConnectionInProgress,
} from "../../store/wiresSlice";
import ContextMenu from "../ContextMenu"; // Re-use your ContextMenu component

// Renamed from Port for clarity in this context
const PanelInputPort = ({
  id,
  name,
  value,
  onPortClick,
  isActive,
  onRename,
  onDelete,
  onToggle,
}) => {
  const portRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(name);

  const handleClick = (e) => {
    e.stopPropagation();
    onPortClick("inputPanel", id, "output", portRef.current); // Panel input ports act as outputs
    if (!isActive) {
      // Only toggle if not actively connecting from it
      onToggle(id);
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleNameChange = (e) => {
    setNewName(e.target.value);
  };

  const handleBlur = () => {
    onRename(id, newName);
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleBlur();
    }
  };

  const [menuPosition, setMenuPosition] = useState(null);
  const handleRightClick = (e) => {
    e.preventDefault();
    setMenuPosition({ x: e.clientX, y: e.clientY });
  };

  const handleDeleteClick = () => {
    onDelete(id);
    setMenuPosition(null);
  };

  const activeClass = isActive ? "port-active" : "";
  const valueClass = value ? "bg-primary" : "bg-dark-subtle"; // Bright blue for on, dark blue for off

  return (
    <div
      id={`panel-input-port-${id}`}
      ref={portRef}
      className={`panel-port panel-input-port position-relative d-flex align-items-center px-3 py-1 fs-6 my-1 ${activeClass} rounded-pill border shadow-sm ${valueClass}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleRightClick}
      style={{
        cursor: "pointer",
      }}
    >
      {isEditing ? (
        <input
          type="text"
          value={newName}
          onChange={handleNameChange}
          onBlur={handleBlur}
          onKeyPress={handleKeyPress}
          autoFocus
          className="form-control form-control-sm text-center"
          style={{ backgroundColor: "transparent", border: "none" }}
        />
      ) : (
        <span className="flex-grow-1 text-center text-white small">{name}</span>
      )}

      {menuPosition && (
        <ContextMenu
          x={menuPosition.x}
          y={menuPosition.y}
          onDelete={handleDeleteClick}
          onClose={() => setMenuPosition(null)}
        />
      )}
    </div>
  );
};

const InputPanel = ({ onPortClick }) => {
  const dispatch = useDispatch();
  const inputPorts = useSelector(selectAllInputPorts);
  const connectionInProgress = useSelector(selectConnectionInProgress);

  const handleAddPort = () => {
    dispatch(addInputPort());
  };

  const handleToggle = (id) => {
    dispatch(toggleInputPort({ id }));
  };

  const handleRename = (id, name) => {
    dispatch(updateInputPortName({ id, name }));
  };

  const handleDelete = (id) => {
    dispatch(removeInputPort({ id }));
    // Also need to remove any wires connected to this port
    dispatch(removeWiresConnectedToGate({ gateId: "inputPanel", portId: id }));
  };

  return (
    <div className="input-panel border rounded p-3 me-0 bg-body d-flex flex-column align-items-center" id="input-panel">
      <h5 className="mb-3">Inputs</h5>
      <div className="d-flex flex-column mb-3">
        {inputPorts.map((port) => (
          <PanelInputPort
            key={port.id}
            id={port.id}
            name={port.name}
            value={port.value}
            onPortClick={onPortClick}
            isActive={
              connectionInProgress?.isConnecting &&
              connectionInProgress.sourceGateId === "inputPanel" &&
              connectionInProgress.sourcePortId === port.id
            }
            onToggle={handleToggle}
            onRename={handleRename}
            onDelete={handleDelete}
          />
        ))}
      </div>
      <button
        className="btn btn-outline-primary rounded"
        onClick={handleAddPort}
      >
        <i className="fa-solid fa-plus"></i>
      </button>
    </div>
  );
};

export default InputPanel;
