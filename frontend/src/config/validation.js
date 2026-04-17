
export const MOBILE_VALIDATION = () => {
    return ({ required: "Please enter your mobile number", pattern: { value: /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/i, message: "Please enter valid mobile number", }, maxLength: { value: 10, message: "Mobile number should not exceed 10 characters" }, minLength: { value: 8, message: "Please enter atleast 8 digits for mobile number" } })
};

export const EMAIL_VALIDATION = () => {
    return ({ required: "Please enter your email", pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Please enter valid email address", }, })
};

export const PASSWORD_VALIDATION = () => {
    return ({ required: "Please enter password", pattern: { value: /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/, message: "Password must contain at least 8 characters, one uppercase, one number and one special case character", }, })
};

export const CONFIRM_PASSWORD_VALIDATION = (value) => {
    return ({ required: "Please enter confirm password", pattern: { value: /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/, message: "Confirm password must contain at least 8 characters, one uppercase, one number and one special case character", }, validate: (v) => v === value || "Password and confirm password not match" })
};

export const PRICE_VALIDATION = () => {
    return ({
        required: "Please enter price", pattern: {
            value: /^\d+(\.\d{2})?$/,
            message: "Please enter valid price"
        }
    })
};

export const DURATION_NUMBER_VALIDATION = () => {
    return ({
        required: "Please enter duration number", pattern: {
            value: /^[1-9]\d*$/,
            message: "Please enter valid duration number"
        }
    })
};

export const DURATION_VALIDATION = () => {
    return ({ required: "Please select duration" })
};

export const DESCRIPTION_VALIDATION = (min, max) => {
    return {
        required: "Please write description",
        minLength: {
            value: min,
            message: `Description must be at least ${min} characters long`
        },
        maxLength: {
            value: max,
            message: `Description must be no more than ${max} characters long`
        }
    };
};

export const PLAN_NAME_VALIDATION = () => {
    return ({
        required: "Please enter plan name", pattern: {
            value: /^[A-Za-z0-9 _-]{3,50}$/,
            message: "Please enter a subscription plan name that is 3-50 characters long, using letters, numbers, spaces, underscores (_), and hyphens (-) only."
        }
    })
};

export const FIRST_NAME_VALIDATION = () => {
    return ({
        required: "Please enter first name",
        minLength: {
            value: 2,
            message: "Invalid first name."
        },
        pattern: {
            value: /^[A-Za-z]+$/,
            message: "First name should only contain letters"
        }
    })
};

export const TEXT_VALIDATION = (fieldName) => {
    return ({
        required: "Please enter " + fieldName,
        minLength: {
            value: 2,
            message: `Invalid ${fieldName}.`
        },
        pattern: {
            value: /^[A-Za-z]+$/,
            message: `${fieldName} should only contain letters`
        }
    })
};

export const NO_SPACE_TEXT = (fieldName,minValue,maxValue) => {
    return {
        required: "Please enter " + fieldName,
        min: {
            value: minValue,
            message: ` ${fieldName} to be at least ${minValue} characters long.`
        },
        max: {
            value: maxValue,
            message: `${fieldName} should not exceed ${maxValue} characters.`
        },
        // pattern: {
        //     value: /^[^\s].*[^\s]$/ ,
        //     message: `${fieldName} is invalid`
        // },
        // validate: {
        //     noLeadingOrTrailingSpaces: (value) =>
        //         value.trim() === value || `Please remove any spaces at the beginning or end.`
        // }
    }
};

export const ONLY_TEXT = (fieldName) => {
    return {
        required: "Please enter " + fieldName,
        min: {
            value: 2,
            message: `Invalid ${fieldName}.`
        },
        pattern: {
            value: /^[A-Za-z]+(?: [A-Za-z]+)*$/, // Regular expression to match multiple words separated by a single space
            message: `${fieldName} should only contain words separated by a single space`
        },
        validate: {
            noLeadingOrTrailingSpaces: (value) =>
                value.trim() === value || `${fieldName} should not have leading or trailing spaces`
        }
    }
};

export const NUMBER_VALIDATION = (fieldName, minLength, maxLength) => {
    return {
        required: `${fieldName} is required.`,
        min: {
            value: minLength,
            message: `${fieldName} must be at least ${minLength} digits.`
        },
        max: {
            value: maxLength,
            message: `${fieldName} must not exceed ${maxLength} digits.`
        },
        pattern: {
            value: /^[0-9]+$/,
            message: `${fieldName} should contain only numbers.`
        }
    };
};

export const FLOAT_VALIDATION = (fieldName, minLength, maxLength) => {
    return {
        required: `${fieldName} is required.`,
        min: {
            value: minLength,
            message: `${fieldName} must be at least ${minLength} digits.`
        },
        max: {
            value: maxLength,
            message: `${fieldName} must not exceed ${maxLength} digits.`
        },
        pattern: {
            value: /^\d+(.\d{1,2})?$/i,
            message: `Please enter valid ${fieldName}.`
        }
    };
};


export const LAST_NAME_VALIDATION = () => {
    return ({
        required: "Please enter last name",
        minLength: {
            value: 2,
            message: "Invalid last name."
        },
        pattern: {
            value: /^[A-Za-z]+$/,
            message: "Last name should only contain letters"
        }
    })
};

export const allowLettersAndSpaces = (event) => {
    const input = String.fromCharCode(event.which);
    if (!/^[A-Za-z]*$/.test(input) && input !== ' ') { // Adding check for space character
        event.preventDefault();
    }
};

export function formatTypeName(typeName) {
    // Split the string by underscores, capitalize each word, and join with spaces
    return typeName.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export const formatCountryCode = (code) => {
    if (!code.startsWith('+')) {
        return `+${code}`;
    }
    return code;
};