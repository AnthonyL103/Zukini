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


  const userinfos = sequelize.define('userinfos', {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
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
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    verified: { 
        type: DataTypes.BOOLEAN, 
        allowNull: false, 
        defaultValue: false  
    },
    verification_token: {
        type: DataTypes.STRING,
        allowNull: true, 
    },
    
    stripe_customer_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    subscription_status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'free', 
    }
   },
    {  
        freezeTableName: false, 
    }
);

const ParsedTextEntries = sequelize.define('ParsedTextEntries', {
    scankey: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    filepath: {
      type: DataTypes.STRING, 
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
    userid: {
        type: DataTypes.STRING,  
        allowNull: false,
        references: {
            model: userinfos, 
            key: 'id',        
        },
        onDelete: 'CASCADE',
    }
    
    
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
    fcsessionname: {
        type: DataTypes.STRING, 
        allowNull: false,
    },
    flashcards: {
        type: DataTypes.JSONB,
    },
    date: {
        type: DataTypes.STRING,
    },
    scankey: {  
        type: DataTypes.STRING,  
        allowNull: false,
        references: {
            model: ParsedTextEntries, 
            key: 'scankey',        
        },
        onDelete: 'CASCADE',
    },
    userid: {
        type: DataTypes.STRING,  
        allowNull: false,
        references: {
            model: userinfos, 
            key: 'id',        
        },
        onDelete: 'CASCADE',
    }
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
    mtsessionname: {
        type: DataTypes.STRING, 
        allowNull: false,
    },
    questions: {
        type: DataTypes.JSONB,
    },
    date: {
        type: DataTypes.STRING,
    },
    scankey: {  
        type: DataTypes.STRING,  
        allowNull: false,
        references: {
            model: ParsedTextEntries, 
            key: 'scankey',        
        },
        onDelete: 'CASCADE',
    },
    userid: {
        type: DataTypes.STRING,  
        allowNull: false,
        references: {
            model: userinfos, 
            key: 'id',        
        },
        onDelete: 'CASCADE',
    }
});

userinfos.hasMany(ParsedTextEntries, { foreignKey: 'userid', onDelete: 'CASCADE' });
ParsedTextEntries.belongsTo(userinfos, { foreignKey: 'userid' });

userinfos.hasMany(FlashCardEntries, { foreignKey: 'userid', onDelete: 'CASCADE' });
FlashCardEntries.belongsTo(userinfos, { foreignKey: 'userid' });

userinfos.hasMany(MockTestEntries, { foreignKey: 'userid', onDelete: 'CASCADE' });
MockTestEntries.belongsTo(userinfos, { foreignKey: 'userid' });

ParsedTextEntries.hasMany(FlashCardEntries, { foreignKey: 'scankey', onDelete: 'CASCADE' });
FlashCardEntries.belongsTo(ParsedTextEntries, { foreignKey: 'scankey' });

ParsedTextEntries.hasMany(MockTestEntries, { foreignKey: 'scankey', onDelete: 'CASCADE' });
MockTestEntries.belongsTo(ParsedTextEntries, { foreignKey: 'scankey' });


(async () => {
    try {
      await sequelize.authenticate();
      console.log('Database connected successfully!');
  
      await userinfos.sync({ force: false });
      await ParsedTextEntries.sync({ force: false });
      await FlashCardEntries.sync({ force: false });
      await MockTestEntries.sync({ force: false });
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


module.exports = { sequelize, userinfos, ParsedTextEntries, FlashCardEntries, MockTestEntries};
