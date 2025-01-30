const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config();

//right now I am storing locally but in the future it will be really easy to attacch to a cloud service 
const sequelize = new Sequelize('postgres', process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST, 
    dialect: 'postgres',       
    port: 5432,                
    logging: false,
    //limit num of connections
    pool: {
        max: 5, 
        min: 0,
        acquire: 30000, 
        idle: 10000, 
    },
    dialectOptions: {
      ssl: {
        require: true,            
        rejectUnauthorized: false, 
      },
    },
  });

  /*
const userinfos = sequelize.define('userinfos', {
    id: {
        type: DataTypes.UUID, // Unique user ID
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING, // Hashed password
        allowNull: false,
    },
    createdat: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
    },
   },
    {  
        freezeTableName: false, // Prevent Sequelize from pluralizing table names
    }
);
*/
/*
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
  /*
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
        model: userinfos, // References the Users table
        key: 'id',    // Refers to the id column in the Users table
      },
    },
    
});
*/
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
    },
    /*
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: userinfos, // References the Users table
            key: 'id',    // Refers to the id column in the Users table
        },
    },*/
    
  });
  
const FlashCardEntries = sequelize.define('FlashCardEntries', {
    flashcardkey: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    filepath: {
        type: DataTypes.STRING, 
        allowNull: false,
    },
    scanname: {
        type: DataTypes.STRING, 
        allowNull: false,
    },
    flashcards: {
        type: DataTypes.JSONB,
    },
    date: {
        type: DataTypes.STRING,
    },
    /*
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: userinfos, // References the Users table
            key: 'id',    // Refers to the id column in the Users table
        },
    },*/
});

const MockTestEntries = sequelize.define('MockTestEntries', {
    mocktestkey: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    filepath: {
        type: DataTypes.STRING, 
        allowNull: false,
    },
    scanname: {
        type: DataTypes.STRING, 
        allowNull: false,
    },
    questions: {
        type: DataTypes.JSONB,
    },
    date: {
        type: DataTypes.STRING,
    },
    /*
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: userinfos, // References the Users table
            key: 'id',    // Refers to the id column in the Users table
        },
    },
    */
});
/*
userinfos.hasMany(UploadFile, { foreignKey: 'userId', onDelete: 'CASCADE' });
UploadFile.belongsTo(userinfos, { foreignKey: 'userId' });

userinfos.hasMany(ParsedTextEntries, { foreignKey: 'userId', onDelete: 'CASCADE' });
ParsedTextEntries.belongsTo(userinfos, { foreignKey: 'userId' });

userinfos.hasMany(FlashCardEntries, { foreignKey: 'userId', onDelete: 'CASCADE' });
FlashCardEntries.belongsTo(userinfos, { foreignKey: 'userId' });

userinfos.hasMany(MockTestEntries, { foreignKey: 'userId', onDelete: 'CASCADE' });
MockTestEntries.belongsTo(userinfos, { foreignKey: 'userId' });
*/

(async () => {
    try {
      await sequelize.authenticate();
      console.log('Database connected successfully!');
  
    await sequelize.sync({ alter: true });
    /*
    await userinfos.sync({ force: true });
    
    await UploadFile.sync({ force: true });
    await ParsedTextEntries.sync({ force: true });
    await FlashCardEntries.sync({ force: true });
    await MockTestEntries.sync({ force: true });
  */
      console.log('Database synced successfully!');
    } catch (error) {
      console.error('Error connecting to the database:', error);
    }
  })();
  
// Prevent memory leaks by ensuring the event listener is added only once
if (!process.listenerCount('SIGINT')) {
    process.on('SIGINT', async () => {
        console.log('Closing database connection...');
        await sequelize.close();
        console.log('Database connection closed.');
        process.exit(0);
    });
}


module.exports = { sequelize, ParsedTextEntries, FlashCardEntries, MockTestEntries};
