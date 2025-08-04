export const reducer = (state: any, action: any) => {
    const { validationResult, inputId, inputValue } = action;

    const updatedValues = {
        ...state.inputValues,
        [inputId]: inputValue,
    };

    // Fix: validationResult is undefined when valid, so we need to invert the logic
    const updatedValidities = {
        ...state.inputValidities,
        [inputId]: validationResult === undefined, // true if valid (no error), false if invalid (has error)
    };

    let updatedFormIsValid = true;

    for (const key in updatedValidities) {
        if (!updatedValidities[key]) {
            updatedFormIsValid = false;
            break;
        }
    }

    return {
        inputValues: updatedValues,
        inputValidities: updatedValidities,
        formIsValid: updatedFormIsValid,
    };
};