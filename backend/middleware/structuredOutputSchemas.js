/**
 * ============================================================================
 *  STRUCTURED OUTPUT SCHEMAS — Zod-based Request/Response Validation
 * ============================================================================
 *
 *  CONCEPT: Structured Outputs (AI App Engineering)
 *
 *  Structured outputs ensure that all data flowing in and out of the API
 *  conforms to rigorously defined schemas. This provides:
 *
 *  1. INPUT VALIDATION  — Every request body is parsed against a Zod schema.
 *     Invalid payloads are rejected with structured, field-level error details.
 *
 *  2. OUTPUT CONSISTENCY — Response helpers ensure all API responses follow
 *     a predictable JSON envelope (success/error shapes), making the API
 *     easier to consume for frontend clients and AI-powered integrations.
 *
 *  3. TYPE SAFETY — Zod schemas serve as a single source of truth for data
 *     shapes, replacing ad-hoc inline checks scattered across controllers.
 *
 *  WHY ZOD?
 *  - Zero-dependency TypeScript-first schema library
 *  - Works in both Node.js and browser environments
 *  - Provides detailed, human-readable error messages
 *  - Can generate TypeScript types from schemas (useful for future migration)
 *
 * ============================================================================
 */

const { z } = require('zod');

// ─────────────────────────────────────────────────────────────────────────────
//  REQUEST BODY SCHEMAS — Define the exact shape of every API request
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schema for POST /api/signup
 * Validates user registration payload with email format and password length.
 */
const SignupSchema = z.object({
  name: z
    .string({ required_error: 'Name is required.' })
    .min(1, 'Name cannot be empty.')
    .max(255, 'Name must be 255 characters or fewer.'),
  email: z
    .string({ required_error: 'Email is required.' })
    .email('Please provide a valid email address.')
    .max(255, 'Email must be 255 characters or fewer.'),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(8, 'Password must be at least 8 characters long.')
    .max(128, 'Password must be 128 characters or fewer.')
});

/**
 * Schema for POST /api/login
 * Validates login credentials.
 */
const LoginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .email('Please provide a valid email address.'),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(1, 'Password cannot be empty.')
});

/**
 * Schema for PUT /api/user/email
 * Validates email update payload.
 */
const UpdateEmailSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .email('Please provide a valid email address.')
    .max(255, 'Email must be 255 characters or fewer.')
});

/**
 * Schema for PUT /api/user/password
 * Validates password update payload with both current and new passwords.
 */
const UpdatePasswordSchema = z.object({
  currentPassword: z
    .string({ required_error: 'Current password is required.' })
    .min(1, 'Current password cannot be empty.'),
  newPassword: z
    .string({ required_error: 'New password is required.' })
    .min(8, 'New password must be at least 8 characters long.')
    .max(128, 'New password must be 128 characters or fewer.')
});

/**
 * Schema for POST /api/folders
 * Validates folder creation payload.
 */
const CreateFolderSchema = z.object({
  name: z
    .string({ required_error: 'Folder name is required.' })
    .min(1, 'Folder name cannot be empty.')
    .max(255, 'Folder name must be 255 characters or fewer.'),
  parentId: z
    .union([z.number().int().positive(), z.string().transform(Number), z.null()])
    .optional()
    .nullable()
});

/**
 * Schema for PUT /api/folders/:id
 * Validates folder rename payload.
 */
const RenameFolderSchema = z.object({
  name: z
    .string({ required_error: 'New folder name is required.' })
    .min(1, 'Folder name cannot be empty.')
    .max(255, 'Folder name must be 255 characters or fewer.')
});

/**
 * Schema for PUT /api/documents/:id/move
 * Validates document move payload with target folder ID.
 */
const MoveDocumentSchema = z.object({
  folderId: z
    .union([z.number().int().positive(), z.string().transform(Number)])
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'Target folder ID must be a positive integer.'
    })
});

/**
 * Schema for PUT /api/documents/:id/favorite
 * Validates favorite toggle payload.
 */
const ToggleFavoriteSchema = z.object({
  isFavorite: z
    .boolean({ required_error: 'isFavorite boolean value is required.' })
});

/**
 * Schema for POST /api/share/:documentId
 * Validates share link creation payload with allowed expiry values.
 */
const CreateShareLinkSchema = z.object({
  expiry: z
    .enum(['10m', '1h', '24h'], {
      required_error: 'Expiry duration is required.',
      invalid_type_error: 'Expiry must be one of: "10m", "1h", "24h".'
    })
});


// ─────────────────────────────────────────────────────────────────────────────
//  RESPONSE ENVELOPE SCHEMAS — Define the shape of all API responses
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Standard success response envelope.
 * All successful API responses include a `message` field.
 */
const SuccessResponseSchema = z.object({
  message: z.string(),
  // Additional data fields are allowed and vary per endpoint
}).passthrough();

/**
 * Standard error response envelope.
 * All error API responses include an `error` field with a human-readable message.
 */
const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.array(z.object({
    field: z.string(),
    message: z.string()
  })).optional()
});

/**
 * Structured validation error response envelope.
 * Returned when Zod parsing fails — contains field-level error details.
 */
const ValidationErrorResponseSchema = z.object({
  error: z.string(),
  details: z.array(z.object({
    field: z.string(),
    message: z.string()
  }))
});


// ─────────────────────────────────────────────────────────────────────────────
//  MIDDLEWARE: validateBody(schema)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Express middleware factory for structured input validation.
 *
 * HOW IT WORKS:
 * 1. Receives a Zod schema as argument
 * 2. Parses req.body using schema.safeParse()
 * 3. If valid: replaces req.body with the parsed (coerced) data and calls next()
 * 4. If invalid: returns a structured 400 response with field-level error details
 *
 * STRUCTURED OUTPUT FORMAT for validation errors:
 * {
 *   "error": "Validation failed. Please check the highlighted fields.",
 *   "details": [
 *     { "field": "email", "message": "Please provide a valid email address." },
 *     { "field": "password", "message": "Password must be at least 8 characters long." }
 *   ]
 * }
 *
 * @param {z.ZodSchema} schema - The Zod schema to validate against
 * @returns {Function} Express middleware function
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // Transform Zod errors into structured field-level error details
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message
      }));

      // Return structured validation error response
      return res.status(400).json({
        error: 'Validation failed. Please check the highlighted fields.',
        details
      });
    }

    // Replace req.body with the parsed and coerced data
    // This ensures downstream controllers receive clean, typed values
    req.body = result.data;
    next();
  };
};


// ─────────────────────────────────────────────────────────────────────────────
//  HELPER: structuredResponse(res, statusCode, data)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send a structured JSON response with consistent envelope format.
 *
 * This helper ensures all API responses follow a predictable shape,
 * making the API easier to integrate with frontend clients and AI systems
 * that expect structured outputs.
 *
 * @param {Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {Object} data - Response payload (must include 'message' or 'error')
 * @returns {Response} Express response
 */
const structuredResponse = (res, statusCode, data) => {
  // Validate that the response conforms to expected envelope shape
  if (statusCode >= 400) {
    const validation = ErrorResponseSchema.safeParse(data);
    if (!validation.success) {
      console.warn('[StructuredOutput] Response does not match ErrorResponseSchema:', validation.error.issues);
    }
  }

  return res.status(statusCode).json(data);
};


// ─────────────────────────────────────────────────────────────────────────────
//  EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  // Request body schemas
  SignupSchema,
  LoginSchema,
  UpdateEmailSchema,
  UpdatePasswordSchema,
  CreateFolderSchema,
  RenameFolderSchema,
  MoveDocumentSchema,
  ToggleFavoriteSchema,
  CreateShareLinkSchema,

  // Response envelope schemas
  SuccessResponseSchema,
  ErrorResponseSchema,
  ValidationErrorResponseSchema,

  // Middleware and helpers
  validateBody,
  structuredResponse
};
