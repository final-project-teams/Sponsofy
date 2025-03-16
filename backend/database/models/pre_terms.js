// models/term.js
module.exports = (sequelize, DataTypes) => {
    const pre_Term = sequelize.define('pre_Term', {
      title: {
        type: DataTypes.STRING,
        allowNull: false,  // Title of the term (e.g., "Payment Term", "Delivery Time")
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,  // Optional description of the term
      },
      status: {
        type: DataTypes.ENUM('active', 'negotiating', 'accepted'),
        defaultValue: 'negotiating',  // Status of the term
      },
    }, {
      tableName: 'pre_terms',
      timestamps: true,  // Automatically add createdAt and updatedAt columns
    });
    return pre_Term;
    }