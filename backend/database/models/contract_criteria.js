// models/contract_criteria.js

module.exports = (sequelize, DataTypes) => {
const ContractCriteria = sequelize.define('ContractCriteria', {

}, {
  
  timestamps: true,  // Automatically add createdAt and updatedAt columns
});
return ContractCriteria;
}
 
