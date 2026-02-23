import { v4 as uuidv4 } from 'uuid';

export const saveCurrentAsCustomGate = ({ gates, wires, inputPorts, outputPorts, name }) => {
  const customGate = {
    id: uuidv4(),
    name,
    gates,
    wires,
    inputs: inputPorts,
    outputs: outputPorts,
    createdAt: Date.now(),
  };

  let savedGates = JSON.parse(localStorage.getItem('customGates')) || [];
  savedGates.push(customGate);
  localStorage.setItem('customGates', JSON.stringify(savedGates));

  return customGate;
};

export const getSavedCustomGates = () => {
  return JSON.parse(localStorage.getItem('customGates')) || [];
};
