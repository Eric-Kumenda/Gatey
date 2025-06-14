-----

# Circuit Simulator

## Overview

This Circuit Simulator is a web-based application built with **React** and **Redux Toolkit** that allows users to design and simulate basic digital logic circuits directly in their browser. Drag-and-drop gates, connect them with wires, and observe the live propagation of `true` (ON) and `false` (OFF) states throughout your circuit. It's an intuitive tool for learning and experimenting with fundamental digital logic concepts.

## Features

  * **Drag-and-Drop Interface**: Easily add logic gates (AND, NOT) to the workspace by dragging them from a palette.
  * **Interactive Wiring**: Connect gates and panel inputs/outputs with intuitive drag-and-drop wiring. Wires visually indicate their active state (ON/OFF).
  * **Live Simulation**: Witness real-time state changes as you toggle inputs or modify connections.
  * **Panel Inputs & Outputs**: Utilize dedicated input and output panels to control the circuit and observe final results.
  * **Gate Logic**: Supports fundamental logic gates like AND and NOT, with easy extensibility for more gate types.
  * **Context Menus**: Right-click on gates or wires to quickly delete them from the workspace.
  * **Redux State Management**: Robust and predictable state management using Redux Toolkit for circuit configuration and simulation data.

## Technologies Used

  * **React**: For building the user interface.
  * **Redux Toolkit**: For efficient and scalable state management.
  * **React Dnd**: For powerful drag-and-drop functionality.
  * **Bootstrap**: For responsive and modern UI components.
  * **JavaScript (ES6+)**: The core language for development.
  * **HTML5/CSS3**: For structuring and styling the application.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have [Node.js](https://nodejs.org/en/) and [npm](https://www.npmjs.com/) (Node Package Manager) installed on your machine.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/circuit-simulator.git
    cd circuit-simulator
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Running the Application

To run the application in development mode:

```bash
npm start
```

This will open the application in your browser at `http://localhost:3000`. The page will reload if you make edits.

## Usage

1.  **Add Gates**: Drag "AND" or "NOT" gates from the left panel onto the main workspace.
2.  **Add Inputs/Outputs**: Use the "Add Input" and "Add Output" buttons in the left and right panels, respectively.
3.  **Connect Wires**:
      * Click on a port (small circles on gates or panels) to start a connection.
      * Drag the wire to another compatible port (input to output, or output to input) and click again to complete the connection.
      * Wires will automatically adjust their path and turn **lime green** when "ON" (true) and **dark green** when "OFF" (false).
4.  **Toggle Inputs**: Click on the circular ports of the **Input Panel** to toggle their state (ON/OFF). Observe how this propagates through connected wires and gates.
5.  **Move Gates**: Drag gates around the workspace to rearrange your circuit layout.
6.  **Delete Elements**: Right-click on any gate or wire to open a context menu and select "Delete" to remove it.

## Circuit Logic Explained

The simulation logic is built upon a reactive system powered by Redux Toolkit's `createListenerMiddleware`.

  * **State Representation**:
      * **Input Panel Ports**: Store a `value` (boolean) representing their current state.
      * **Logic Gates**: Each gate stores `inputStates` (an object mapping input port IDs to boolean values) and `outputStates` (an object mapping output port IDs to boolean values).
      * **Wires**: Each wire stores a `value` (boolean) representing the signal it's currently carrying.
  * **Propagation**:
    1.  When an **Input Panel Port** is toggled, it dispatches an action.
    2.  A Redux middleware listens for this action, identifies all wires originating from that port, updates their `value`, and propagates this value to their destinations (either a gate's input or an output panel port).
    3.  When a **Gate's Input State** changes, another middleware listener triggers the gate's `performGateLogic` function. This function calculates the new output based on the gate's specific boolean logic (e.g., for an AND gate, all inputs must be true for the output to be true).
    4.  If the gate's calculated **Output State** is different from its current state, it dispatches an action to update its output.
    5.  A final middleware listener catches changes in **Gate Output States**, identifies all wires originating from that output, and propagates the new value down the circuit, restarting the cycle.
  * **Visual Feedback**: Wires and gate ports dynamically change color to reflect their `true` (ON) or `false` (OFF) state, providing immediate visual feedback on the circuit's operation.

## Future Enhancements

  * More logic gates (OR, XOR, NAND, NOR, etc.)
  * Circuit saving and loading functionality
  * Undo/Redo actions
  * Improved wire routing algorithms
  * Customizable gate properties
  * Visual indicators for gate input/output labels
  * Error handling for invalid connections (e.g., output to output)

-----
