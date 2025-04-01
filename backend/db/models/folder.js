'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Folder extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Folder.hasMany(models.File, {foreignKey: "folderId"})
      Folder.belongsTo(models.User, {foreignKey: "userId"})
    }
  }
  Folder.init({
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
    },
    template: {
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    modelName: 'Folder',
  });
  return Folder;
};