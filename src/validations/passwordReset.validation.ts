import Joi from "joi";

const passwordResetSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email must be a valid email",
    "any.required": "Email is required",
  }),
  code: Joi.string().required().messages({
    "any.required": "token is required",
  }),
  newPassword: Joi.string().min(8).required().messages({
    "string.min": "newPassword must be at least 8 characters long",
    "any.required": "newPassword is required",
  }),
  confirmPassword: Joi.string().min(8).required().messages({
    "string.min": "confirmPassword must be at least 8 characters long",
    "any.required": "confirmPassword is required",
  }),
}).options({ stripUnknown: true });

export default passwordResetSchema;
