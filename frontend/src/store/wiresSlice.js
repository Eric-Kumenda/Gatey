// src/store/wiresSlice.js
import { createSlice, nanoid } from "@reduxjs/toolkit";

const wiresSlice = createSlice({
  name: "wires",
  initialState: {
    entities: {},
    ids: [],
    connectionInProgress: null,
  },
  reducers: {
    addWire: {
      reducer(state, action) {
        state.entities[action.payload.id] = action.payload;
        state.ids.push(action.payload.id);
      },
      prepare(
        sourceGateId,
        sourcePortId,
        destinationGateId,
        destinationPortId
      ) {
        return {
          payload: {
            id: nanoid(),
            source: { gateId: sourceGateId, portId: sourcePortId },
            destination: {
              gateId: destinationGateId,
              portId: destinationPortId,
            },
            value: false, // Default wire value is false (off)
          },
        };
      },
    },
    removeWire: (state, action) => {
      const wireIdToRemove = action.payload.id;
      delete state.entities[wireIdToRemove];
      state.ids = state.ids.filter((id) => id !== wireIdToRemove);
    },
    setConnectionInProgress: (state, action) => {
      state.connectionInProgress = action.payload;
    },
    removeWiresConnectedToGate: (state, action) => {
      const { gateId, portId } = action.payload; // portId is optional here
      state.ids = state.ids.filter((wireId) => {
        const wire = state.entities[wireId];
        const isConnected =
          (wire.source.gateId === gateId &&
            (!portId || wire.source.portId === portId)) ||
          (wire.destination.gateId === gateId &&
            (!portId || wire.destination.portId === portId));
        if (isConnected) {
          delete state.entities[wireId];
        }
        return !isConnected;
      });
    },
    // New action to set the value of a wire
    setWireValue: (state, action) => {
      const { wireId, value } = action.payload;
      if (state.entities[wireId] && state.entities[wireId].value !== value) {
        state.entities[wireId].value = value;
      }
    },
  },
});

export const {
  addWire,
  removeWire,
  setConnectionInProgress,
  removeWiresConnectedToGate,
  setWireValue,
} = wiresSlice.actions;

export const selectAllWires = (state) => Object.values(state.wires.entities);
export const selectConnectionInProgress = (state) =>
  state.wires.connectionInProgress;
export const selectWireById = (state, wireId) => state.wires.entities[wireId]; // Helper selector

export default wiresSlice.reducer;