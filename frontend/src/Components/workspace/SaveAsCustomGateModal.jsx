import React, { useState } from "react";
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CFormInput,
  CFormLabel,
} from "@coreui/react";
import { useSelector } from "react-redux";
import { selectAllGates } from "../../store/gatesSlice"; 
import { selectAllWires } from "../../store/wiresSlice";
import { selectAllInputPorts, selectAllOutputPorts } from "../../store/panelPortsSlice";
import { saveCurrentAsCustomGate } from "../../utils/customGate";

const SaveAsCustomGateModal = ({ visible, onClose }) => {
  const [gateName, setGateName] = useState("");
  const [error, setError] = useState("");

  const gates = useSelector(selectAllGates);
  const wires = useSelector(selectAllWires);
  const inputPorts = useSelector(selectAllInputPorts);
  const outputPorts = useSelector(selectAllOutputPorts);

  const handleSave = () => {
    const trimmedName = gateName.trim();

    if (!trimmedName) {
      setError("Gate name cannot be empty.");
      return;
    }

    const success = saveCurrentAsCustomGate({
      name: trimmedName,
      gates,
      wires,
      inputPorts,
      outputPorts,
    });

    if (success) {
      setGateName("");
      setError("");
      onClose();
    } else {
      setError("A gate with this name already exists.");
    }
  };

  return (
    <CModal visible={visible} onClose={onClose}>
      <CModalHeader closeButton>
        <CModalTitle>Save Circuit as Custom Gate</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CFormLabel htmlFor="gateName">Custom Gate Name</CFormLabel>
        <CFormInput
          id="gateName"
          value={gateName}
          onChange={(e) => setGateName(e.target.value)}
          placeholder="Enter gate name"
        />
        {error && <p className="text-danger mt-2">{error}</p>}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>Cancel</CButton>
        <CButton color="primary" onClick={handleSave}>Save</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default SaveAsCustomGateModal;