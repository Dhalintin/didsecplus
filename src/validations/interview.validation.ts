import Joi from "joi";

export const interviewSchema = Joi.object({
  jobPostingId: Joi.string().required(),
  applicantId: Joi.string().required(),
  companyProfileId: Joi.string().optional(),
  location: Joi.string().required().optional(),
  interviewType: Joi.string().required().optional(),
  duration: Joi.string().required().optional(),
  dateTime: Joi.date().optional(),
  status: Joi.string()
    .valid(
      "pending",
      "reviewed",
      "accepted",
      "rejected",
      "interviewed",
      "hired"
    )
    .optional(),
  notes: Joi.string().optional().allow(null),
});

export const updateInterviewSchema = interviewSchema.fork(
  Object.keys(interviewSchema.describe().keys),
  (schema) => schema.optional()
);
