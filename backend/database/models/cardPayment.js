module.exports = (sequelize, DataTypes) => {
    const CardPayment = sequelize.define(
      "CardPayment",
      {
        cardNumber: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        cardHolderName: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        expirationDate: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        cvv: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        amount: {
          type: DataTypes.FLOAT,
          allowNull: true,
        },
        paymentDate: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        companyId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "companies",
            key: "id",
          },
        },
        contentCreatorId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "content_creators",
            key: "id",
          },
        },
      },
      {
        tableName: "card_payments",
        timestamps: true,
      }
    );
  
    return CardPayment;
  };