const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

//right now I am storing locally but in the future it will be really easy to attacch to a cloud service 
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'), // SQLite database file
});

const UploadFile = sequelize.define('UploadFile', {
  filename: {
    type: DataTypes.STRING, // Store the original file name
    allowNull: false,
  },
  content: {
    type: DataTypes.BLOB, // Store binary data (images, PDFs, etc.)
    allowNull: false,
  },
  uploadDate: {
    type: DataTypes.DATE, // Store the upload date
    allowNull: false,
  },
});

const ParsedTextEntries = sequelize.define('ParsedTextEntries', {
    scankey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    filepath: {
      type: DataTypes.STRING, // Adjust as needed for your JSON structure
      allowNull: false,
    },
    scanname: {
      type: DataTypes.STRING, // JSONB for structured JSON data (PostgreSQL) or JSON (MySQL)
      allowNull: false,
    },
    value: {
      type: DataTypes.TEXT,
    },
    date: {
      type: DataTypes.STRING,
    }
  });

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully!');
    await sequelize.sync({ alter: true }); // Sync model with database
    console.log('Database synced successfully!');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
})();

module.exports = { sequelize, UploadFile, ParsedTextEntries };
