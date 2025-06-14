import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  inputs: {}, // { portId: { id, name, value (true/false) } }
  outputs: {}, // { portId: { id, name, value (true/false) } }
};

const panelPortsSlice = createSlice({
  name: 'panelPorts',
  initialState,
  reducers: {
    addInputPort: {
      reducer(state, action) {
        state.inputs[action.payload.id] = action.payload;
      },
      prepare(name) {
        return {
          payload: {
            id: nanoid(),
            name: name || `Input ${Object.keys(initialState.inputs).length + 1}`,
            value: false, // Default to off
          },
        };
      },
    },
    addOutputPort: {
      reducer(state, action) {
        state.outputs[action.payload.id] = action.payload;
      },
      prepare(name) {
        return {
          payload: {
            id: nanoid(),
            name: name || `Output ${Object.keys(initialState.outputs).length + 1}`,
            value: false, // Default to off
          },
        };
      },
    },
    toggleInputPort: (state, action) => {
      const { id } = action.payload;
      if (state.inputs[id]) {
        state.inputs[id].value = !state.inputs[id].value;
      }
    },
    // This action will be used to update output port values from gate logic
    setOutputPortValue: (state, action) => {
      const { id, value } = action.payload;
      if (state.outputs[id]) {
        state.outputs[id].value = value;
      }
    },
    removeInputPort: (state, action) => {
      delete state.inputs[action.payload.id];
    },
    removeOutputPort: (state, action) => {
      delete state.outputs[action.payload.id];
    },
    updateInputPortName: (state, action) => {
      const { id, name } = action.payload;
      if (state.inputs[id]) {
        state.inputs[id].name = name;
      }
    },
    updateOutputPortName: (state, action) => {
      const { id, name } = action.payload;
      if (state.outputs[id]) {
        state.outputs[id].name = name;
      }
    },
  },
});

export const {
  addInputPort,
  addOutputPort,
  toggleInputPort,
  setOutputPortValue,
  removeInputPort,
  removeOutputPort,
  updateInputPortName,
  updateOutputPortName,
} = panelPortsSlice.actions;

export const selectAllInputPorts = (state) => Object.values(state.panelPorts.inputs);
export const selectAllOutputPorts = (state) => Object.values(state.panelPorts.outputs);
export const selectInputPortById = (state, id) => state.panelPorts.inputs[id];
export const selectOutputPortById = (state, id) => state.panelPorts.outputs[id];


export default panelPortsSlice.reducer;