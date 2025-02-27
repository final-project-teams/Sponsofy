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
    },
    isPremium: {
        type: DataTypes.BOOLEAN,
    },
    codeFiscal: {
        type: DataTypes.STRING,
    },
}, {
  tableName: 'companies',
  timestamps: true,
});
return Company;
}
