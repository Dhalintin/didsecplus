import Joi from "joi";

export const signinSchema = Joi.object({
  email: Joi.string().email().required(),

  firstname: Joi.string().required(),

  lastname: Joi.string().required(),

  password: Joi.string()
    .min(8)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])"))
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, and one special character.",
    }),

  userType: Joi.string().valid("job_seeker", "recruiter").required().messages({
    "any.only": "userType must be either 'job_seeker', or 'recruiter' .",
  }),
});

export const updateCompanyTeamSchema = signinSchema.fork(
  Object.keys(signinSchema.describe().keys),
  (schema) => schema.optional()
);
