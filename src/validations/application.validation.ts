import Joi from "joi";

export const applicationSchema = Joi.object({
  applicantId: Joi.string().required(),
  jobPostingId: Joi.string().required(),
  status: Joi.string()
    .valid("pending", "reviewed", "accepted", "rejected")
    .optional(),
  coverLetter: Joi.string().max(5000).allow(null, ""),
});
