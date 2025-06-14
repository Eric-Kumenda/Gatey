import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./appSlice";
import gatesReducer from "./gatesSlice";
import wiresReducer from "./wiresSlice";
import toastReducer from "./toastSlice";
import panelPortsReducer from "./panelPortsSlice";
import { simulationMiddleware } from "./middleware/simulationMiddleware";

const store = configureStore({
  reducer: {
    app: appReducer,
    gates: gatesReducer,
    wires: wiresReducer,
    toast: toastReducer,
    panelPorts: panelPortsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(simulationMiddleware.middleware),
});

export default store;
