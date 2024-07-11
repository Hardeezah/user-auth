const { Organisation, UserOrganisation } = require('../models/index.js');

const createOrganisation = async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user.userId;

  try {
    const orgId = `${name.replace(/\s+/g, '_')}_org_${Date.now()}`;
    const organisation = await Organisation.create({
      orgId,
      name,
      description,
    });

    await UserOrganisation.create({
      userId,
      orgId: organisation.orgId,
      UserId: req.user.id,
      OrganisationId: organisation.id,
    });

    res.status(201).json({
      status: 'success',
      message: 'Organisation created successfully',
      data: {
        orgId: organisation.orgId,
        name: organisation.name,
        description: organisation.description,
      },
    });
  } catch (error) {
    console.error('Create organisation error:', error);
    res.status(400).json({
      status: 'Bad request',
      message: 'Client error',
      statusCode: 400,
    });
  }
};

const getOrganisations = async (req, res) => {
  try {
    const userOrganisations = await UserOrganisation.findAll({ where: { userId: req.user.userId } });
    const organisationIds = userOrganisations.map(uo => uo.orgId);

    const organisations = await Organisation.findAll({ where: { orgId: organisationIds } });

    res.status(200).json({
      status: 'success',
      message: 'Organisations retrieved successfully',
      data: {
        organisations,
      },
    });
  } catch (error) {
    console.error('Get organisations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

const getOrganisation = async (req, res) => {
  try {
    const organisation = await Organisation.findOne({ where: { orgId: req.params.orgId } });
    if (!organisation) {
      return res.status(404).json({
        status: 'error',
        message: 'Organisation not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Organisation found',
      data: {
        orgId: organisation.orgId,
        name: organisation.name,
        description: organisation.description,
      },
    });
  } catch (error) {
    console.error('Get organisation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
    });
  }
};

const addUserToOrganisation = async (req, res) => {
  const { userId } = req.body;

  try {
    const userOrganisation = await UserOrganisation.create({
      userId,
      orgId: req.params.orgId,
      UserId: req.user.id,
      OrganisationId: req.params.orgId,
    });

    res.status(200).json({
      status: 'success',
      message: 'User added to organisation successfully',
    });
  } catch (error) {
    console.error('Add user to organisation error:', error);
    res.status(400).json({
      status: 'Bad request',
      message: 'Client error',
      statusCode: 400,
    });
  }
};

module.exports = {
  createOrganisation,
  getOrganisations,
  getOrganisation,
  addUserToOrganisation,
};
