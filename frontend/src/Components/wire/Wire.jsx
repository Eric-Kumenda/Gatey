// src/components/wire/Wire.jsx
import React, { useEffect, useState } from "react";
import ContextMenu from "../ContextMenu";
import { useDispatch } from "react-redux";
import { removeWire } from "../../store/wiresSlice";

// Helper function to calculate port positions relative to the WORKSPACE's SVG origin (top-left)
const getPortGlobalPosition = (portElement) => {
  if (!portElement) {
    return null;
  }

  const portRect = portElement.getBoundingClientRect(); // Position relative to viewport

  // Get the workspace element's position relative to the viewport
  const workspaceElement = document.getElementById("workspace");
  if (!workspaceElement) {
    console.error("Workspace element not found for wire positioning.");
    return null;
  }
  const workspaceRect = workspaceElement.getBoundingClientRect();

  // Calculate the center of the port, then offset by the workspace's top-left corner
  return {
    x: portRect.left + portRect.width / 2 - workspaceRect.left,
    y: portRect.top + portRect.height / 2 - workspaceRect.top,
  };
};

function generateOffsetFromHash(str, maxOffset = 10) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Create pseudo-random offset in both x and y directions
  const x = ((hash >> 3) % (2 * maxOffset)) - maxOffset;
  const y = ((hash >> 5) % (2 * maxOffset)) - maxOffset;
  return { x, y };
}

const Wire = ({ wire, getGateAndPortElements }) => {
  const [path, setPath] = useState("");
  const { source, destination, isActive, value } = wire; // Destructure 'value' from wire state
  const [menuPosition, setMenuPosition] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const calculateWirePath = () => {
      const { portElement: sourcePortElement } = getGateAndPortElements(
        source.gateId,
        source.portId
      );
      const { portElement: destinationPortElement } = getGateAndPortElements(
        destination.gateId,
        destination.portId
      );

      if (!sourcePortElement || !destinationPortElement) {
        return "";
      }

      const startPos = getPortGlobalPosition(sourcePortElement);
      const destPos = getPortGlobalPosition(destinationPortElement);

      if (!startPos || !destPos) {
        return "";
      }

      const startX = startPos.x;
      const startY = startPos.y;
      const endX = destPos.x;
      const endY = destPos.y;

      // Midpoint with optional offset
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;

      // Use a deterministic offset based on IDs
      const hash = `${source.gateId}-${source.portId}-${destination.gateId}-${destination.portId}`;
      const offset = generateOffsetFromHash(hash, 10); // up to ±10 px offset

      const offsetMidX = midX + offset.x;
      const offsetMidY = midY + offset.y;

      const pathData = `
    M ${startX} ${startY}
    L ${offsetMidX} ${startY}
    L ${offsetMidX} ${endY}
    L ${endX} ${endY}
  `;

      return pathData;
    };

    // Use a small delay to ensure DOM is rendered before querying elements
    const timeoutId = setTimeout(() => {
      setPath(calculateWirePath());
    }, 10);

    return () => clearTimeout(timeoutId);
  }, [wire, getGateAndPortElements]);

  // Dynamic stroke color based on wire value
  // `isActive` prop is for connection-in-progress, `value` is for logical state
  const strokeColor = value ? "lime" : "darkred"; // Bright green for ON, dark green for OFF
  const strokeWidth = 2;

  const handleRightClick = (e) => {
    e.preventDefault();
    setMenuPosition({ x: e.clientX, y: e.clientY });
  };

  const handleDelete = () => {
    dispatch(removeWire({ id: wire.id }));
    setMenuPosition(null);
  };

  return (
    <>
      <path
        d={path}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="none"
        className="wire"
        onContextMenu={handleRightClick}
      />
      {menuPosition && (
        <ContextMenu
          x={menuPosition.x}
          y={menuPosition.y}
          onDelete={handleDelete}
          onClose={() => setMenuPosition(null)}
        />
      )}
    </>
  );
};

export default Wire;
