import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import { DOTENV_PATH } from "../constants.js";
import { log } from "console";
import path from "path";
import axios from "axios";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET

})

const uploadOnCloudinary = async (localFilePath) =>{
    try{
        if(!localFilePath) return null
        //upload file on cloudnary
        const responce = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        fs.unlinkSync(localFilePath)
        return responce


    }catch(error){
        console.error("Upload error:", error);

        fs.unlinkSync(localFilePath)
        return null
    }
}

const deleteFromCloudinary = async (publicId) =>{
    try{
        console.log("Deleting from Cloudinary:", publicId);
        
        if(!publicId) {
            console.log("No public id provided");
            return null
        }
        const responce = await cloudinary.uploader.destroy(publicId, { invalidate: true })
        console.log("Cloudinary delete response:", responce);

        if (responce.result === 'not found') {
            console.error(`Cloudinary: Public ID ${publicId} not found`);
            throw new Error(`Cloudinary: Public ID ${publicId} not found`);
        }
        
        return responce
    } catch (error) {
        console.error("Cloudinary delete error:", error.message, error.http_code);
        throw new Error(`Cloudinary delete error: ${error.message} ${error.http_code}`);
    }
}


function extractPublicId(cloudinaryUrl) {
  try {
    const pathname = new URL(cloudinaryUrl).pathname; // e.g. /dwb1jtrym/image/upload/v1746897239/filename.pdf
    const parts = pathname.split('/');

    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) {
      throw new Error("Invalid Cloudinary URL: 'upload' not found");
    }

    // All parts after "upload"
    const afterUpload = parts.slice(uploadIndex + 1);

    // Remove version if it starts with "v" and a number
    if (/^v\d+$/.test(afterUpload[0])) {
      afterUpload.shift(); // remove version
    }

    const filenameWithExt = afterUpload.join('/'); // now just the file path
    const lastDot = filenameWithExt.lastIndexOf('.');
    return lastDot !== -1
      ? filenameWithExt.substring(0, lastDot)
      : filenameWithExt;

  } catch (err) {
    console.error("Error extracting public ID:", err.message);
    return null;
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const downloadFromCloudinary = async (cloudinaryUrl,filename) => {
    const localPath = path.join(__dirname,"../../public/temp",filename)
    const writer = fs.createWriteStream(localPath);
    const responce = await axios({
        url:cloudinaryUrl,
        method:"GET",
        responseType:"stream"
    })

    return new Promise((resolve,reject) =>{
        responce.data.pipe(writer)
        let error = null
        writer.on("error", err =>{
            error = err
            writer.close()
            reject(err)
        })
        writer.on("close", () => {
            if(!error){
                resolve(localPath)
            }else{
                reject(error)
            }
        })
    })
}

const extractFilenameFromUrl = (cloudinaryUrl) => {
  return path.basename(new URL(cloudinaryUrl).pathname); // returns 'abc.pdf'
};

export {uploadOnCloudinary, deleteFromCloudinary, extractPublicId, downloadFromCloudinary,extractFilenameFromUrl}



// .upload(localFilePath,{
//     resource_type:"auto",
//     // timeout: 30000
    
// })

// .upload_stream((error,res)=>console.log(error,res)).end(imageBuffer)
        // console.log("Uploaded successfully:", responce);
