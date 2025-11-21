import pkg from "sequelize";

const { DataTypes } = pkg;

import sequelize from "../Config/db.js";

const User = sequelize.define("User", {
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    resetPasswordOTP: {
        type: DataTypes.STRING(6),
        allowNull: true,
    },
    resetPasswordOTPExpiresAt:{
       type:DataTypes.DATE,
       allowNull:true,
    }
})

export default User; 