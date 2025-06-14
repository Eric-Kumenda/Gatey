// src/store/gatesSlice.js
import { createSlice, nanoid } from '@reduxjs/toolkit';

// Helper to define port structure
const getInitialPorts = (gateType) => {
    switch (gateType) {
        case "AND":
            return {
                inputs: [{ id: "in1", label: "A", type: "input" }, { id: "in2", label: "B", type: "input" }],
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

const gatesSlice = createSlice({
  name: 'gates',
  initialState: {
    entities: {},
    ids: [],
  },
  reducers: {
    addGate: {
      reducer(state, action) {
        state.entities[action.payload.id] = action.payload;
        state.ids.push(action.payload.id);
      },
      prepare(gateType, position) {
        const ports = getInitialPorts(gateType);
        // Initialize inputStates based on defined input ports, default to false
        const initialInputStates = ports.inputs.reduce((acc, port) => {
          acc[port.id] = false; // All inputs start off
          return acc;
        }, {});

        // Initialize outputStates based on defined output ports.
        // For NOT gate, if no input, its initial state is true (NOT(false)).
        const initialOutputStates = ports.outputs.reduce((acc, port) => {
            // If it's a NOT gate and its single input is not 'true', then output is 'true'
            acc[port.id] = (gateType === 'NOT' && ports.inputs.length === 1 && initialInputStates[ports.inputs[0].id] === false) ? true : false;
            return acc;
        }, {});

        return {
          payload: {
            id: nanoid(),
            type: gateType,
            position: position,
            ports: ports,
            inputStates: initialInputStates,
            outputStates: initialOutputStates,
          },
        };
      },
    },
    removeGate: (state, action) => {
      const { id } = action.payload;
      delete state.entities[id];
      state.ids = state.ids.filter((gateId) => gateId !== id);
    },
    moveGate: (state, action) => {
      const { id, position } = action.payload;
      if (state.entities[id]) {
        state.entities[id].position = position;
      }
    },
    // Action to set the state of a specific input port on a gate
    setGateInputState: (state, action) => {
        const { gateId, portId, value } = action.payload;
        // Only update if the value actually changed to prevent unnecessary re-renders/loops
        if (state.entities[gateId] && state.entities[gateId].inputStates[portId] !== value) {
            state.entities[gateId].inputStates[portId] = value;
        }
    },
    // Action to set the state of a specific output port on a gate
    setGateOutputState: (state, action) => {
        const { gateId, portId, value } = action.payload;
        // Only update if the value actually changed
        if (state.entities[gateId] && state.entities[gateId].outputStates[portId] !== value) {
            state.entities[gateId].outputStates[portId] = value;
        }
    },
  },
});

export const { addGate, removeGate, moveGate, setGateInputState, setGateOutputState } = gatesSlice.actions;

export const selectAllGates = (state) => Object.values(state.gates.entities);
export const selectGateById = (state, gateId) => state.gates.entities[gateId];

export default gatesSlice.reducer;