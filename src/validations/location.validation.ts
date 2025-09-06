import Joi from "joi";

export const getStatesSchema = Joi.object({}).options({ stripUnknown: true });

export const getLgasByStateSchema = Joi.object({
  stateId: Joi.string().required().messages({
    "string.base": "State ID must be a string.",
    "any.required": "State ID is required.",
  }),
}).options({ stripUnknown: true });

export const getLgasSchema = Joi.object({
  bbox: Joi.string()
    .pattern(/^-?\d+\.?\d*,-?\d+\.?\d*,-?\d+\.?\d*,-?\d+\.?\d*$/)
    .optional()
    .messages({
      "string.pattern.base":
        "Bbox must be in format minLng,minLat,maxLng,maxLat (e.g., 3.0,6.0,4.0,7.0).",
    }),
  state: Joi.string().optional().allow("", null),
}).options({ stripUnknown: true });
