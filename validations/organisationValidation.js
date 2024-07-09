const { check, validationResult } = require('express-validator');

const validateOrganisation = [
  check('name').notEmpty().withMessage('Organisation name is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = {
  validateOrganisation,
};
