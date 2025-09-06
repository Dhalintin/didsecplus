import Joi from "joi";

export const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().required(),
  name: Joi.string().required(),
  phone: Joi.string().optional(),
  role: Joi.string()
    .valid("superAdmin", "admin", "citizen")
    .optional()
    .messages({
      "any.only": "role must be either 'superAdmin', 'admin' or 'citizen' .",
    }),
  location: Joi.string().optional(),
  device: Joi.string().valid("Android", "iOS", "Web", "Unknown").optional(),
});
