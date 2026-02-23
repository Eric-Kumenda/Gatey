// src/store/middleware/simulationMiddleware.js
import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import {
  toggleInputPort,
  setOutputPortValue,
  removeInputPort,
  removeOutputPort,
  selectInputPortById, // Import selector for input panel ports
  selectOutputPortById, // Import selector for output panel ports
} from "../panelPortsSlice";
import {
  setGateInputState,
  setGateOutputState,
  selectGateById,
  removeGate,
} from "../gatesSlice";
import {
  setWireValue,
  selectAllWires,
  removeWiresConnectedToGate,
  addWire,
} from "../wiresSlice"; // Import addWire
import { performGateLogic } from "../../utils/circuitLogic";

export const simulationMiddleware = createListenerMiddleware();

// Helper to find all wires connected to a specific source/destination port
const findWiresConnectedToPort = (
  getState,
  gateId,
  portId,
  isSource = true
) => {
  const wires = selectAllWires(getState());
  return wires.filter((wire) => {
    if (isSource) {
      return wire.source.gateId === gateId && wire.source.portId === portId;
    } else {
      return (
        wire.destination.gateId === gateId && wire.destination.portId === portId
      );
    }
  });
};

/**
 * Helper function to turn off destination ports for wires that are about to be removed.
 * This should be called *before* dispatching removeWiresConnectedToGate.
 */
const turnOffDestinationsOfWires = (dispatch, getState, wiresToConsider) => {
  wiresToConsider.forEach((wire) => {
    const { destination } = wire;
    const valueToSet = false; // Always turn off

    if (destination.gateId === "outputPanel") {
      dispatch(
        setOutputPortValue({ id: destination.portId, value: valueToSet })
      );
    } else {
      // It's a gate input. Turn it off.
      // This will then trigger the gate's re-evaluation.
      dispatch(
        setGateInputState({
          gateId: destination.gateId,
          portId: destination.portId,
          value: valueToSet,
        })
      );
    }
  });
};

// --- LISTENER: Propagate initial state when a wire is added ---
simulationMiddleware.startListening({
  actionCreator: addWire, // When a new wire is successfully added
  effect: (action, listenerApi) => {
    const { payload: newWire } = action;
    const { getState, dispatch } = listenerApi;

    const { source, destination } = newWire;
    let sourceValue = false; // Default to false

    // Determine the current value of the source port
    if (source.gateId === "inputPanel") {
      const inputPort = selectInputPortById(getState(), source.portId);
      sourceValue = inputPort ? inputPort.value : false;
    } else {
      // Source is a gate's output port
      const sourceGate = selectGateById(getState(), source.gateId);
      sourceValue = sourceGate ? sourceGate.outputStates[source.portId] : false;
    }

    // 1. Set the new wire's value to the source's current value
    dispatch(setWireValue({ wireId: newWire.id, value: sourceValue }));

    // 2. If the destination is an output panel, update its value immediately
    if (destination.gateId === "outputPanel") {
      dispatch(
        setOutputPortValue({ id: destination.portId, value: sourceValue })
      );
    } else {
      // If the destination is a gate's input, update its input state
      // This will then trigger the gate's evaluation listener
      dispatch(
        setGateInputState({
          gateId: destination.gateId,
          portId: destination.portId,
          value: sourceValue,
        })
      );
    }
  },
});
// --- END LISTENER ---

// --- LISTENER: Propagate initial state when a wire is added ---
simulationMiddleware.startListening({
  actionCreator: addWire, // When a new wire is successfully added
  effect: (action, listenerApi) => {
    const { payload: newWire } = action;
    const { getState, dispatch } = listenerApi;

    const { source, destination } = newWire;
    let sourceValue = false; // Default to false

    // Determine the current value of the source port
    if (source.gateId === "inputPanel") {
      const inputPort = selectInputPortById(getState(), source.portId);
      sourceValue = inputPort ? inputPort.value : false;
    } else {
      // Source is a gate's output port
      const sourceGate = selectGateById(getState(), source.gateId);
      sourceValue = sourceGate ? sourceGate.outputStates[source.portId] : false;
    }

    // 1. Set the new wire's value to the source's current value
    dispatch(setWireValue({ wireId: newWire.id, value: sourceValue }));

    // 2. If the destination is an output panel, update its value immediately
    if (destination.gateId === "outputPanel") {
      dispatch(
        setOutputPortValue({ id: destination.portId, value: sourceValue })
      );
    } else {
      // If the destination is a gate's input, update its input state
      // This will then trigger the gate's evaluation listener
      dispatch(
        setGateInputState({
          gateId: destination.gateId,
          portId: destination.portId,
          value: sourceValue,
        })
      );
    }
  },
});
// --- END LISTENER ---

// Listener 1: React to changes in Input Panel Ports (e.g., toggleInputPort action)
simulationMiddleware.startListening({
  actionCreator: toggleInputPort,
  effect: (action, listenerApi) => {
    const { id: changedPortId, value: newValue } = action.payload;
    const { getState, dispatch } = listenerApi;

    const wiresToUpdate = findWiresConnectedToPort(
      getState,
      "inputPanel",
      changedPortId,
      true
    );

    wiresToUpdate.forEach((wire) => {
      dispatch(setWireValue({ wireId: wire.id, value: newValue }));

      const { gateId: destGateId, portId: destPortId } = wire.destination;

      if (destGateId === "outputPanel") {
        dispatch(setOutputPortValue({ id: destPortId, value: newValue }));
      } else {
        dispatch(
          setGateInputState({
            gateId: destGateId,
            portId: destPortId,
            value: newValue,
          })
        );
      }
    });
  },
});

// Listener 2: React to changes in Gate Output States (after a gate evaluation)
simulationMiddleware.startListening({
  actionCreator: setGateOutputState,
  effect: (action, listenerApi) => {
    const {
      gateId: changedGateId,
      portId: changedPortId,
      value: newValue,
    } = action.payload;
    const { getState, dispatch } = listenerApi;

    const wiresToUpdate = findWiresConnectedToPort(
      getState,
      changedGateId,
      changedPortId,
      true
    );

    wiresToUpdate.forEach((wire) => {
      dispatch(setWireValue({ wireId: wire.id, value: newValue }));

      const { gateId: destGateId, portId: destPortId } = wire.destination;

      if (destGateId === "outputPanel") {
        dispatch(setOutputPortValue({ id: destPortId, value: newValue }));
      } else {
        dispatch(
          setGateInputState({
            gateId: destGateId,
            portId: destPortId,
            value: newValue,
          })
        );
      }
    });
  },
});

// Listener 3: React to changes in Gate Input States (trigger gate evaluation)
simulationMiddleware.startListening({
  actionCreator: setGateInputState,
  effect: (action, listenerApi) => {
    const { gateId: changedGateId } = action.payload;
    const { getState, dispatch } = listenerApi;

    const gate = selectGateById(getState(), changedGateId);
    if (!gate) return;

    const newOutputValue = performGateLogic(gate.type, gate.inputStates);

    const outputPortId = gate.ports.outputs[0]?.id;
    if (outputPortId && gate.outputStates[outputPortId] !== newOutputValue) {
      dispatch(
        setGateOutputState({
          gateId: changedGateId,
          portId: outputPortId,
          value: newOutputValue,
        })
      );
    }
  },
});

// --- Cleanup Listeners ---

// Listener: Cleanup wires when gates are removed
simulationMiddleware.startListening({
  actionCreator: removeGate,
  effect: (action, listenerApi) => {
    const { id: gateId } = action.payload;
    const state = listenerApi.getState(); // Get current state before wires are removed

    // Find all wires connected to this gate (both as source or destination)
    const wiresToCleanUp = selectAllWires(state).filter(
      (wire) =>
        wire.source.gateId === gateId || wire.destination.gateId === gateId
    );

    // First, turn off the destinations of these wires
    turnOffDestinationsOfWires(listenerApi.dispatch, state, wiresToCleanUp);

    // Then, remove the wires themselves
    listenerApi.dispatch(removeWiresConnectedToGate({ gateId }));
  },
});

// Listener: Cleanup wires when input panel ports are removed
simulationMiddleware.startListening({
  actionCreator: removeInputPort,
  effect: (action, listenerApi) => {
    const { id: portId } = action.payload;
    const state = listenerApi.getState(); // Get current state

    // Find wires where this input panel port is the source
    const wiresToCleanUp = selectAllWires(state).filter(
      (wire) =>
        wire.source.gateId === "inputPanel" && wire.source.portId === portId
    );

    // First, turn off the destinations of these wires
    turnOffDestinationsOfWires(listenerApi.dispatch, state, wiresToCleanUp);

    // Then, remove the wires themselves
    listenerApi.dispatch(
      removeWiresConnectedToGate({ gateId: "inputPanel", portId })
    );
  },
});

// Listener: Cleanup wires when output panel ports are removed
simulationMiddleware.startListening({
  actionCreator: removeOutputPort,
  effect: (action, listenerApi) => {
    const { id: portId } = action.payload;
    const state = listenerApi.getState(); // Get current state

    // Find wires where this output panel port is the destination
    const wiresToCleanUp = selectAllWires(state).filter(
      (wire) =>
        wire.destination.gateId === "outputPanel" &&
        wire.destination.portId === portId
    );

    // Note: For output ports, we don't need to turn off destinations
    // as they are the destination themselves.
    // The `removeWiresConnectedToGate` will handle the removal of the wire.

    listenerApi.dispatch(
      removeWiresConnectedToGate({ gateId: "outputPanel", portId })
    );
  },
});
