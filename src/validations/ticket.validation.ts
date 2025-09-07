import Joi from "joi";

export const ticketSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().optional(),
  status: Joi.string().optional(),
  priority: Joi.string().required(),
  alert_id: Joi.string().required(),
  assigned_to: Joi.string().required(),
});
