const express = require('express');
const {
  createOrganisation,
  getOrganisations,
  getOrganisation,
  addUserToOrganisation,
} = require('../controllers/organisationController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validateOrganisation } = require('../validations/organisationValidation');
const router = express.Router();

router.post('/', authMiddleware, validateOrganisation, createOrganisation);
router.get('/', authMiddleware, getOrganisations);
router.get('/:orgId', authMiddleware, getOrganisation);
router.post('/:orgId/users', authMiddleware, addUserToOrganisation);

module.exports = router;
