/**
 * Performs the boolean logic for a given gate type based on its input values.
 * @param {string} gateType - The type of gate (e.g., "AND", "NOT").
 * @param {Object} inputStates - An object where keys are input port IDs and values are booleans.
 * @returns {boolean} The calculated output value.
 */
export const performGateLogic = (gateType, inputStates) => {
    switch (gateType) {
        case "AND":
            // AND gate output is true if ALL inputs are true.
            // If an input is missing/undefined, treat it as false.
            const andIn1 = inputStates.in1 || false;
            const andIn2 = inputStates.in2 || false;
            return andIn1 && andIn2;

        case "NOT":
            // NOT gate output is the inverse of its single input.
            // If input is missing/undefined, treat it as false (so output is true).
            const notIn1 = inputStates.in1 || false;
            return !notIn1;

        // Add more gate types here as you expand your circuit (e.g., OR, XOR, NAND, NOR)
        // case "OR":
        //     const orIn1 = inputStates.in1 || false;
        //     const orIn2 = inputStates.in2 || false;
        //     return orIn1 || orIn2;
        // case "XOR":
        //     const xorIn1 = inputStates.in1 || false;
        //     const xorIn2 = inputStates.in2 || false;
        //     return xorIn1 !== xorIn2;

        default:
            console.warn(`Unknown gate type: ${gateType}. Returning false.`);
            return false;
    }
};