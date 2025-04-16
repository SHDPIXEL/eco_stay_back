const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        
        if (file.mimetype.startsWith('image')) {
            cb(null, 'assets/images/');
        }else {
            cb(new Error('Invalid file type'));
        }
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  
    }
});


const fileFilter = (req, file, cb) => {
    const imageTypes = /jpeg|jpg|png|webp/;

    if (file.mimetype.match(imageTypes)) {
        return cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, WebP, MP4, and MOV files are allowed.'));
    }
};

// Multer configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 3 * 1024 * 1024 }  // Limit file size to 10MB
});

module.exports = upload;