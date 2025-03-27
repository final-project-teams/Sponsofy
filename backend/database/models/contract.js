module.exports = (sequelize, DataTypes) => {
  const Contract = sequelize.define('Contract', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,  // Title of the contract
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,  // Optional description for the contract
    },
    budget: {
      type: DataTypes.FLOAT,
      allowNull: false,  // Budget of the contract
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,  // Start date of the contract
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,  // End date of the contract
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'terminated'),
      defaultValue: 'active',  // Status of the contract
    },
    payment_terms: {
      type: DataTypes.TEXT,
      allowNull: true,  // Optional payment terms
    },
    rank: {
      type: DataTypes.ENUM('plat', 'gold', 'silver'), // Define contract ranks
      allowNull: false,  // Rank must be specified
    },
    serialNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true, // We'll set this during creation
    },
    contractData: {
      type: DataTypes.TEXT, // Store JSON data for QR code generation
      allowNull: true,
    }
  }, {
    tableName: 'contracts',
    timestamps: true,  // Automatically add createdAt and updatedAt columns
    hooks: {
      beforeValidate: async (contract) => {
        // Generate a unique serial number if not provided
        if (!contract.serialNumber) {
          const timestamp = new Date().getTime();
          const randomNum = Math.floor(Math.random() * 10000);
          contract.serialNumber = `SPF-${timestamp}-${randomNum}`;
        }
      }
    }
  });

  return Contract;
};