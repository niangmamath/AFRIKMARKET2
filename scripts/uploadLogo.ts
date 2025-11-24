import { v2 as cloudinary } from 'cloudinary';
import '../config/env'; // Ensure environment variables are loaded

// Manually configure Cloudinary here as well for direct script execution
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

const uploadLogo = async () => {
    // Check if Cloudinary config is correctly loaded
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
        console.error('Cloudinary configuration is missing. Make sure your .env file is correct.');
        return;
    }

    try {
        console.log('Uploading logo to Cloudinary...');
        const result = await cloudinary.uploader.upload('public/images/logo.png', {
            public_id: 'afrikmarket_logo',
            overwrite: true,
            folder: 'site_assets'
        });

        console.log('\n--- Logo Uploaded Successfully! ---');
        console.log('Secure URL:', result.secure_url);
        console.log('------------------------------------\n');
        console.log('Next step: Update the URL in your views/partials/header.ejs file.');

    } catch (error) {
        console.error('\nError uploading logo to Cloudinary:', error);
    }
};

uploadLogo();
