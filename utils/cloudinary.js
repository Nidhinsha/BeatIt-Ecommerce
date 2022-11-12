require('dotenv').config()
const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
    // cloud_name:'driuxmoax',
    // api_key:'934211895269566',
    // api_secret:'PDzSBrvYifMDdg-nEYiht0wtRP0'

})
module.exports = cloudinary