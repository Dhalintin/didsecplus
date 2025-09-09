import Joi from "joi";

export const ticketSchema = Joi.object({
  alert_Id: Joi.string().required().messages({
    "any.required": "alert_Id is required",
  }),
  title: Joi.string().min(1).required().messages({
    "string.base": "title must be a string",
    "string.min": "title must not be empty",
    "any.required": "title is required",
  }),
  description: Joi.string().allow("", null).optional().messages({
    "string.base": "description must be a string",
  }),
  status: Joi.string()
    .valid("open", "in_progress", "closed")
    .default("open")
    .messages({
      "any.only": "status must be one of open, in_progress, closed",
    }),
  priority: Joi.string().valid("low", "mid", "high").default("low").messages({
    "any.only": "priority must be one of low, medium, high",
  }),
  assigned_to: Joi.string().allow("", null).optional().messages({
    "string.base": "assigned_to must be a string",
  }),
  note: Joi.string().allow("", null).optional().messages({
    "string.base": "note must be a string",
  }),
}).options({ stripUnknown: true });
