import express from "express";
import dotenv from "dotenv";
import userRouter from "./Routes/User.js";
import cookieParser from "cookie-parser";
import sequelize from "./Config/db.js";
import cors from "cors";

dotenv.config({ path: "./.env" });

const PORT = process.env.PORT || 3000;

const server = express();

// parser and cors
server.use(express.json());
server.use(cookieParser());
server.use(cors({
    origin:["http://localhost:3000"],
    credentials:true,
}));  

// simple get req to server to check if server is running or not.
server.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        data: "Server Running"
    });
})

// Routers
server.use("/api/v1", userRouter);

sequelize.sync()
.then(() => {
    console.log("Connection to Db Successfull");
    server.listen(PORT, ()=>{
        console.log(`Server Running on Port ${PORT}`)
    })
})
.catch((err) => {
    console.log(err.name);  
 })     