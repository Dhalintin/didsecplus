import Joi from "joi";

export const alertSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().optional(),
  status: Joi.string().valid("active", "investigating", "resolved").optional(),
  source: Joi.string().valid("phone", "app", "web").required(),
  latitude: Joi.number().min(-90).max(90).required().messages({
    "number.base": "latitude must be a number",
    "number.min": "latitude must be between -90 and 90",
    "number.max": "latitude must be between -90 and 90",
    "any.required": "latitude is required",
  }),
  longitude: Joi.number().min(-180).max(180).required().messages({
    "number.base": "longitude must be a number",
    "number.min": "longitude must be between -180 and 180",
    "number.max": "longitude must be between -180 and 180",
    "any.required": "longitude is required",
  }),
  state: Joi.string().required(),
  lga: Joi.string().required(),
  recipients: Joi.array().items(Joi.string()).optional(),
});
