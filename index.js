const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./models');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const organisationRoutes = require('./routes/organisations');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/organisations', organisationRoutes);

sequelize.sync({ force: true }).then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

module.exports = app;
