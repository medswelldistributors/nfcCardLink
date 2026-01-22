/**
 * [FILE ROLE]
 * - parse bulk products from raw text
 * - provide reusable form validation utilities
 *
 * [FLOW]
 * rawText → split → map → filter → Result
 *
 * [DEPENDENCIES]
 * - none
 */

/* Input:  "Product1\nCompanyName\nContent\nForm...\n\nProduct2..."
          (separated by empty lines)

Output: [{ name, companyName, content, form, mg, mrp, rate, unitOfSale, unitName, imageUrl }, ...]
*/
export function parseBulkProducts(rawText) {
  if (!rawText || typeof rawText !== "string") return [];

  const productBlocks = rawText.trim().split(/\n\s*\n/); // product separator

  return productBlocks
    .map((block, index) => {
      const lines = block.split("\n").map((line) => line.trim());

      // Remove trailing empty lines only
      while (lines.length && lines[lines.length - 1] === "") {
        lines.pop();
      }

      // Required fields count = 9 (including companyName)
      if (lines.length < 9) {
        console.warn(`❌ Product ${index + 1} skipped: missing required fields (need 9 lines)`);
        return null;
      }

      const [
        name,
        companyName,
        content,
        form,
        mg,
        mrp,
        rate,
        unitOfSale,
        unitName,
        imageUrl, // optional
      ] = lines;

      return {
        id: name.toLowerCase().replace(/\s+/g, ""),
        name,
        companyName,
        content,
        form,
        mg,
        mrp: Number(mrp),
        rate: Number(rate),
        unitOfSale,
        unitName,
        imageUrl: imageUrl || null, // ✅ safe default
      };
    })
    .filter(Boolean);
}

/* ======================
   VALIDATION UTILITIES
====================== */

/**
 * Check if a value is empty (null, undefined, or empty string after trim)
 * @param {any} value - Value to check
 * @returns {boolean} - true if empty
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  return false;
}

/**
 * Validate required fields in an object
 * @param {Object} data - Object with field values
 * @param {string[]} requiredFields - Array of required field names
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export function validateRequiredFields(data, requiredFields) {
  const errors = [];

  requiredFields.forEach((field) => {
    if (isEmpty(data[field])) {
      errors.push(`${field} is required`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate number fields (must be > 0)
 * @param {Object} data - Object with field values
 * @param {string[]} numberFields - Array of number field names
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export function validateNumberFields(data, numberFields) {
  const errors = [];

  numberFields.forEach((field) => {
    const value = data[field];
    if (value !== undefined && value !== null && value !== "") {
      const num = Number(value);
      if (isNaN(num)) {
        errors.push(`${field} must be a valid number`);
      } else if (num <= 0) {
        errors.push(`${field} must be greater than 0`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate URL format
 * @param {string} url - URL string to validate
 * @returns {boolean} - true if valid URL or empty
 */
export function isValidUrl(url) {
  if (isEmpty(url)) return true; // Empty is valid (optional field)
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Validate URL fields
 * @param {Object} data - Object with field values
 * @param {string[]} urlFields - Array of URL field names
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export function validateUrlFields(data, urlFields) {
  const errors = [];

  urlFields.forEach((field) => {
    if (!isEmpty(data[field]) && !isValidUrl(data[field])) {
      errors.push(`${field} must be a valid URL (https://...)`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - true if valid email
 */
export function isValidEmail(email) {
  if (isEmpty(email)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Combined form validation
 * @param {Object} data - Form data object
 * @param {Object} rules - Validation rules
 * @param {string[]} [rules.required] - Required field names
 * @param {string[]} [rules.numbers] - Number field names (must be > 0)
 * @param {string[]} [rules.urls] - URL field names
 * @returns {{ isValid: boolean, errors: string[], firstError: string|null }}
 */
export function validateForm(data, rules = {}) {
  const allErrors = [];

  // Required fields
  if (rules.required && rules.required.length > 0) {
    const { errors } = validateRequiredFields(data, rules.required);
    allErrors.push(...errors);
  }

  // Number fields
  if (rules.numbers && rules.numbers.length > 0) {
    const { errors } = validateNumberFields(data, rules.numbers);
    allErrors.push(...errors);
  }

  // URL fields
  if (rules.urls && rules.urls.length > 0) {
    const { errors } = validateUrlFields(data, rules.urls);
    allErrors.push(...errors);
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    firstError: allErrors.length > 0 ? allErrors[0] : null,
  };
}

/**
 * Validate login form
 * @param {string} email - Email input
 * @param {string} password - Password input
 * @returns {{ isValid: boolean, error: string|null }}
 */
export function validateLoginForm(email, password) {
  if (isEmpty(email)) {
    return { isValid: false, error: "Email is required" };
  }
  if (!isValidEmail(email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }
  if (isEmpty(password)) {
    return { isValid: false, error: "Password is required" };
  }
  if (password.length < 6) {
    return { isValid: false, error: "Password must be at least 6 characters" };
  }
  return { isValid: true, error: null };
}

/**
 * Validate product form for update
 * @param {Object} product - Product data object
 * @returns {{ isValid: boolean, errors: string[], firstError: string|null }}
 */
export function validateProductForm(product) {
  return validateForm(product, {
    required: ["name", "mrp", "rate", "unitOfSale", "unitName"],
    numbers: ["mrp", "rate"],
    urls: ["imageUrl"],
  });
}
