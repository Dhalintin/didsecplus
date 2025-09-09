import Joi from "joi";

const userSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "email must be a valid email address",
    "any.required": "email is required",
  }),
  username: Joi.string().allow("", null).optional().messages({
    "string.base": "username must be a string",
  }),
  name: Joi.string().allow("", null).optional().messages({
    "string.base": "name must be a string",
  }),
  phone: Joi.string()
    // .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])"))
    .allow("", null)
    .optional()
    .messages({
      "string.pattern.base":
        "phone must be a valid phone number (e.g., +1234567890)",
    }),
  role: Joi.string()
    .valid("superAdmin", "admin", "citizen")
    .required()
    .messages({
      "any.only": "role must be one of superAdmin, admin, citizen",
      "any.required": "role is required",
    }),
  device: Joi.string()
    .valid("Android", "iOS", "Web", "Unknown")
    .allow(null)
    .optional()
    .messages({
      "any.only": "device must be one of Android, iOS, Web, Unknown",
    }),
  location: Joi.string().allow("", null).optional().messages({
    "string.base": "location must be a string",
  }),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])"))
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, and one special character.",
    }),
}).options({ stripUnknown: true });

export default userSchema;
