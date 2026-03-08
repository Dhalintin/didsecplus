import Joi from "joi";

export const mailSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "email must be a valid email address",
    "any.required": "email is required",
  }),
  message: Joi.string().required().messages({
    "string.base": "message must be a string",
    "any.required": "message is required",
  }),
  name: Joi.string().required().messages({
    "string.base": "name must be a string",
  }),
}).options({ stripUnknown: true });
