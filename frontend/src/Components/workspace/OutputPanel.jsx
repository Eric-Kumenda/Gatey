// src/components/panels/OutputPanel.jsx
import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addOutputPort,
  selectAllOutputPorts,
  updateOutputPortName,
  removeOutputPort,
} from "../../store/panelPortsSlice";
import {
  setConnectionInProgress,
  selectConnectionInProgress,
  removeWiresConnectedToGate,
} from "../../store/wiresSlice";
import ContextMenu from "../ContextMenu";

const PanelOutputPort = ({
  id,
  name,
  value,
  onPortClick,
  isActive,
  onRename,
  onDelete,
}) => {
  const portRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(name);

  const handleClick = (e) => {
    e.stopPropagation();
    // Output panel ports act as inputs for wires
    onPortClick("outputPanel", id, "input", portRef.current);
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
  const valueClass = value ? "bg-success" : "bg-dark-subtle"; // Bright green for on, dark blue for off

  return (
    <div
      id={`panel-output-port-${id}`}
      ref={portRef}
      className={`panel-port panel-output-port position-relative d-flex align-items-center px-3 py-1 my-1 ${activeClass} rounded border shadow-sm ${valueClass}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleRightClick}
      style={{
        cursor: "cell",
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

const OutputPanel = ({ onPortClick }) => {
  const dispatch = useDispatch();
  const outputPorts = useSelector(selectAllOutputPorts);
  const connectionInProgress = useSelector(selectConnectionInProgress);

  const handleAddPort = () => {
    dispatch(addOutputPort());
  };

  const handleRename = (id, name) => {
    dispatch(updateOutputPortName({ id, name }));
  };

  const handleDelete = (id) => {
    dispatch(removeOutputPort({ id }));
    // Also need to remove any wires connected to this port
    dispatch(removeWiresConnectedToGate({ gateId: "outputPanel", portId: id }));
  };

  return (
    <div className="output-panel border rounded p-3 ms-0 bg-body d-flex flex-column align-items-center" id="output-panel">
      <h5 className="mb-3">Outputs</h5>
      <div className="d-flex flex-column mb-3">
        {outputPorts.map((port) => (
          <PanelOutputPort
            key={port.id}
            id={port.id}
            name={port.name}
            value={port.value}
            onPortClick={onPortClick}
            isActive={
              connectionInProgress?.isConnecting &&
              connectionInProgress.sourceGateId === "outputPanel" &&
              connectionInProgress.sourcePortId === port.id
            }
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

export default OutputPanel;
