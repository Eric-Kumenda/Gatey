import React from "react";
import AppSidebar from "../Components/AppSidebar";
import Workspace from "../Components/workspace/Workspace";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AppHeader from "../Components/AppHeader";

const AppLayout = () => {
  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <div className="container-fluid">
        <div className="row">
          <AppSidebar />

          <div className="wrapper d-flex flex-column min-vh-100 col">
            <AppHeader />
            <div className="body flex-grow-1">
              <Workspace />
            </div>
            {/* <AppFooter /> */}
          </div>
        </div>
        </div>
      </DndProvider>
    </>
  );
};

export default AppLayout;
