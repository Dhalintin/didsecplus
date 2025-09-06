import Joi from "joi";

export const alertSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().optional(),
  status: Joi.string().valid("active", "investigating", "resolved").optional(),
  source: Joi.string().valid("phone", "app", "web").required(),
  latitude: Joi.string().required(),
  longitude: Joi.string().required(),
  state: Joi.string().required(),
  lga: Joi.string().required(),
});
