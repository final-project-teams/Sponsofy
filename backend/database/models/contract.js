module.exports = (sequelize, DataTypes) => {
  const Contract = sequelize.define('Contract', {
      title: {
          type: DataTypes.STRING,
          allowNull: false,
      },
      description: {
          type: DataTypes.TEXT,
          allowNull: true,
      },
      start_date: {
          type: DataTypes.DATE,
          allowNull: false,
      },
      end_date: {
          type: DataTypes.DATE,
          allowNull: false,
      },
      status: {
          type: DataTypes.ENUM('active', 'completed', 'terminated'),
          defaultValue: 'active',
      },
      payment_terms: {
          type: DataTypes.TEXT,
          allowNull: true,
      },
      rank: {
          type: DataTypes.ENUM('plat', 'gold', 'silver'),
          allowNull: true,
      },
 
  
      accepted: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
      },
  }, {
      tableName: 'contracts',
      timestamps: true,
  });

  return Contract;
};