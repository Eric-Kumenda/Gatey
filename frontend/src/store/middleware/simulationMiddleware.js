// src/store/middleware/simulationMiddleware.js
import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import {
  toggleInputPort,
  setOutputPortValue,
  removeInputPort, // Listen for deletion to clean up wires
  removeOutputPort, // Listen for deletion to clean up wires
} from '../panelPortsSlice';
import { setGateInputState, setGateOutputState, selectGateById, removeGate } from '../gatesSlice'; // Selectors and actions
import { setWireValue, selectAllWires, removeWiresConnectedToGate } from '../wiresSlice'; // Selectors and actions
import { performGateLogic } from '../../utils/circuitLogic'; // Our logic function

export const simulationMiddleware = createListenerMiddleware();

// Helper to find all wires connected to a specific source/destination port
const findWiresConnectedToPort = (getState, gateId, portId, isSource = true) => {
    const wires = selectAllWires(getState());
    return wires.filter(wire => {
        if (isSource) {
            return wire.source.gateId === gateId && wire.source.portId === portId;
        } else {
            return wire.destination.gateId === gateId && wire.destination.portId === portId;
        }
    });
};

// Listener 1: React to changes in Input Panel Ports (e.g., toggleInputPort action)
simulationMiddleware.startListening({
  actionCreator: toggleInputPort, // When an input panel port is toggled
  effect: (action, listenerApi) => {
    const { id: changedPortId, value: newValue } = action.payload; // newValue is the *new* state of the input port
    const { getState, dispatch } = listenerApi;

    // Find all wires originating FROM this input panel port
    const wiresToUpdate = findWiresConnectedToPort(getState, "inputPanel", changedPortId, true);

    wiresToUpdate.forEach(wire => {
      // 1. Update the wire's value to the new value of the input port
      dispatch(setWireValue({ wireId: wire.id, value: newValue }));

      // 2. Propagate this value to the wire's destination
      const { gateId: destGateId, portId: destPortId } = wire.destination;

      if (destGateId === "outputPanel") {
        // Destination is an output panel port
        dispatch(setOutputPortValue({ id: destPortId, value: newValue }));
      } else {
        // Destination is a gate's input port
        dispatch(setGateInputState({ gateId: destGateId, portId: destPortId, value: newValue }));
      }
    });
  },
});

// Listener 2: React to changes in Gate Output States (after a gate evaluation)
simulationMiddleware.startListening({
  actionCreator: setGateOutputState, // When a gate's output state changes
  effect: (action, listenerApi) => {
    const { gateId: changedGateId, portId: changedPortId, value: newValue } = action.payload;
    const { getState, dispatch } = listenerApi;

    // Find all wires originating FROM this gate's output port
    const wiresToUpdate = findWiresConnectedToPort(getState, changedGateId, changedPortId, true);

    wiresToUpdate.forEach(wire => {
      // 1. Update the wire's value
      dispatch(setWireValue({ wireId: wire.id, value: newValue }));

      // 2. Propagate value to the destination
      const { gateId: destGateId, portId: destPortId } = wire.destination;

      if (destGateId === "outputPanel") {
        // Destination is an output panel port
        dispatch(setOutputPortValue({ id: destPortId, value: newValue }));
      } else {
        // Destination is another gate's input port
        dispatch(setGateInputState({ gateId: destGateId, portId: destPortId, value: newValue }));
      }
    });
  },
});

// Listener 3: React to changes in Gate Input States (trigger gate evaluation)
simulationMiddleware.startListening({
  actionCreator: setGateInputState, // When a gate's input state changes
  effect: (action, listenerApi) => {
    const { gateId: changedGateId } = action.payload; // We only need the gateId to re-evaluate it
    const { getState, dispatch } = listenerApi;

    const gate = selectGateById(getState(), changedGateId);
    if (!gate) return;

    // Calculate the new output based on the gate's current inputStates
    const newOutputValue = performGateLogic(gate.type, gate.inputStates);

    // Assuming gates have only one output for simplicity (e.g., "out1").
    // You'd need to loop through outputs if a gate has multiple.
    const outputPortId = gate.ports.outputs[0]?.id; // Get the first output port ID
    if (outputPortId && gate.outputStates[outputPortId] !== newOutputValue) {
        // Dispatch setGateOutputState only if the output actually changed
        dispatch(setGateOutputState({ gateId: changedGateId, portId: outputPortId, value: newOutputValue }));
    }
  },
});

// --- Cleanup Listeners (Important for preventing memory leaks and stale wires) ---

// Listener 4: Cleanup wires when gates are removed
simulationMiddleware.startListening({
    actionCreator: removeGate,
    effect: (action, listenerApi) => {
        const { id: gateId } = action.payload;
        // Use the action we already have to clean up wires connected to this gate
        listenerApi.dispatch(removeWiresConnectedToGate({ gateId }));
    }
});

// Listener 5: Cleanup wires when input panel ports are removed
simulationMiddleware.startListening({
    actionCreator: removeInputPort,
    effect: (action, listenerApi) => {
        const { id: portId } = action.payload;
        // Clean up wires connected to the specific panel input port
        listenerApi.dispatch(removeWiresConnectedToGate({ gateId: "inputPanel", portId }));
    }
});

// Listener 6: Cleanup wires when output panel ports are removed
simulationMiddleware.startListening({
    actionCreator: removeOutputPort,
    effect: (action, listenerApi) => {
        const { id: portId } = action.payload;
        // Clean up wires connected to the specific panel output port
        listenerApi.dispatch(removeWiresConnectedToGate({ gateId: "outputPanel", portId }));
    }
});