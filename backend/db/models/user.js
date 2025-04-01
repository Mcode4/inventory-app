'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Folder,{foreignKey: "ownerId"})
    }
  }
  User.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 25]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 256],
        isEmail: true
      }
    },
    countryCode: {
      type: DataTypes.INTEGER,
      validate: {
        len: [1, 2]
      }
    },
    phone: {
      type: DataTypes.INTEGER,
      unique: true,
      validate: {
        len: [10]
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 25],
        safePassword(password){
          const cap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
          const num = '1234567890'
          const sym = '!@$%^&*+#'
          const passwordCheck = {cap: 0, low: 0, num: 0, sym: 0}

          for(let i=0; i<password.length; i++){
            if(cap.includes(password[i])) passwordCheck.cap++
            else if(cap.toLowerCase().includes(password[i])) passwordCheck.low++
            else if(num.includes(password[i])) passwordCheck.num++
            else if(sym.includes(password[i])) passwordCheck.sym++
            else throw new Error(`"${password[i]}" is an invalid character`)
          }
          Object.keys(passwordCheck).forEach(key=>{
            if(passwordCheck[key] === 0){
              throw new Error("Password must include a uppercased letter, a lowercased letter, a number, and one special character (!@$%^&*+#).")
            }
          })
        }
      }
    },
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};