// models/company.js

module.exports = (sequelize, DataTypes) => {
const Company = sequelize.define('Company', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  industry: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
  },
    verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isPremium: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    codeFiscal: {
        type: DataTypes.STRING,
    },
    website: {
        type: DataTypes.STRING,
    },
    targetContentType: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    budget: {
        type: DataTypes.JSON,
        defaultValue: { min: 0, max: 0, currency: 'USD' }
    },
    collaborationPreferences: {
        type: DataTypes.JSON,
        defaultValue: { contentTypes: [], duration: '', requirements: '' }
    },
    profileViews: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    dealsPosted: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
  tableName: 'companies',
  timestamps: true,
});
return Company;
}
