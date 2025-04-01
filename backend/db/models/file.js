'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class File extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      File.belongsTo(models.Folder, {foreignKey: "folderId"})
    }
  }
  File.init({
    folderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    order: DataTypes.INTEGER,
    template: DataTypes.STRING,
    data: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'File',
  });
  return File;
};