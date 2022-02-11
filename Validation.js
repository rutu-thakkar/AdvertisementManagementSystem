const Joi = require("@hapi/joi");

const userSchema = Joi.object({
  name: Joi.string().required().min(5),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .lowercase()
    .required(),
  password: Joi.string().min(8).max(16).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).max(16).required(),
});

module.exports = {
  userSchema,
  loginSchema,
};
