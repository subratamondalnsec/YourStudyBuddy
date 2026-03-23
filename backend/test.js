import { v2 } from "cloudinary";

import { DOTENV_PATH } from "./src/constants.js";

v2.config({
    secure:true,
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})
console.log(v2.config);

const responce = await v2.uploader.upload("/home/glxalokesh/Desktop/vs code/chai-aur-backend-express-/Final project/public/temp/v617batch2-kul-05-technology.jpg",{
    resource_type:"auto",
    timeout: 60000
    
})