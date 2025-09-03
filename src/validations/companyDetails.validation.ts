import Joi from 'joi';

export const companyTeamSchema = Joi.object({
  companyName: Joi.string().required(),
  description: Joi.string().required(),
  industry: Joi.string().required(),
  website: Joi.string().uri().optional(),
  location: Joi.string().optional(),
  numberOfEmployees: Joi.string().optional(),
  teamMembers: Joi.array().items(
    Joi.object({
      email: Joi.string().email().required(),
      role: Joi.string().required(),
    })
  ).min(1).required(),
});

export const updateCompanyTeamSchema = companyTeamSchema.fork(Object.keys(companyTeamSchema.describe().keys), (schema) => 
  schema.optional()
);