import Joi from "joi";

export const googleAuthSchema = Joi.object({
  email: Joi.string().email().required(),

  picture: Joi.string().optional(),

  given_name: Joi.string().required(),

  family_name: Joi.string().required(),

  sub: Joi.string().required(),

  userType: Joi.string().valid("job_seeker", "recruiter").required().messages({
    "any.only": "userType must be either 'job_seeker', or 'recruiter' .",
  }),
});

export const updateCompanyTeamSchema = googleAuthSchema.fork(
  Object.keys(googleAuthSchema.describe().keys),
  (schema) => schema.optional()
);
