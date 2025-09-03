import Joi from "joi";

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])"))
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, and one special character.",
    }),
});

export const updateCompanyTeamSchema = loginSchema.fork(
  Object.keys(loginSchema.describe().keys),
  (schema) => schema.optional()
);
