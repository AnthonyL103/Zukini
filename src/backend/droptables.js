const { sequelize } = require('./db'); // Adjust path to your Sequelize instance

const dropAllTables = async () => {
  try {
    await sequelize.drop(); // Drops all tables
    console.log("All tables dropped successfully.");
  } catch (error) {
    console.error("Error dropping tables:", error);
  } finally {
    await sequelize.close(); // Close the database connection
  }
};

dropAllTables();
