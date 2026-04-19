const Joi = require('joi');

const userSchema = Joi.object({
    nom: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    telephone: Joi.string().pattern(/^[0-9]+$/)
});

exports.validateUser = (req, res, next) => {
    const { error } = userSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};