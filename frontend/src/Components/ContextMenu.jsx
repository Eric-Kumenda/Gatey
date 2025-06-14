import React, { useEffect } from "react";

const ContextMenu = ({ x, y, onDelete, onClose }) => {
  useEffect(() => {
    const handleClickOutside = () => onClose();
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [onClose]);

  return (
    <ul
      className="position-absolute list-group shadow border bg-body fs-6"
      style={{
        top: "40px",
        left: "40px",
        zIndex: 1000,
      }}
    >
      <li className="list-group-item list-group-item-action">Edit</li>
      <li className="list-group-item list-group-item-action">Inspect</li>
      <li className="list-group-item list-group-item-action" onClick={onDelete}>
        Delete
      </li>
    </ul>
  );
};

export default ContextMenu;
