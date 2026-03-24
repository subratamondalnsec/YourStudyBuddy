import mongoose from "mongoose";
import {DB_NAME} from "../constants.js"

const connectDB = async ()=>{
    try{
        const baseDbUri = (process.env.DB_URI || "").replace(/\/+$/, "");
        const dbName = (process.env.DB_NAME || DB_NAME || "").replace(/^\/+/, "");

        const connectionUri = dbName ? `${baseDbUri}/${dbName}` : baseDbUri;
        const connectionInstance = await mongoose.connect(connectionUri)
        console.log(`mongoDB connected!! : ${connectionInstance.connection.host}`)
    }
    catch(error){
        console.log("MongoDB connection faild: ",error)
        process.exit(1)
    }
}

export default connectDB