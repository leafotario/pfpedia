require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { GridFSBucket } = require('mongodb');

const app = express();
const PORT = process.env.UPLOAD_SERVER_PORT || 4000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
let gfs;

db.on('error', console.error.bind(console, 'MongoDB error:'));
db.once('open', () => {
    console.log('MongoDB connected');
    gfs = new GridFSBucket(db.db, { bucketName: 'uploads' });
});

const ImageSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    width: { type: Number },
    height: { type: Number },
    characterName: { type: String, required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    uploadedBy: { type: String, default: 'Anonymous' },
    uploadDate: { type: Date, default: Date.now },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    fileId: { type: mongoose.Schema.Types.ObjectId, required: true }
});

const Image = mongoose.model('Image', ImageSchema);

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueName + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|bmp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only images allowed'));
        }
    }
});

async function convertToJPEG(inputPath, outputPath) {
    try {
        await sharp(inputPath)
            .jpeg({
                quality: 85,
                progressive: true,
                optimizeScans: true
            })
            .resize(800, 800, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .toFile(outputPath);
        
        return true;
    } catch (error) {
        throw error;
    }
}

async function saveToGridFS(filePath, filename) {
    return new Promise((resolve, reject) => {
        const uploadStream = gfs.openUploadStream(filename, {
            contentType: 'image/jpeg'
        });
        
        const readStream = fs.createReadStream(filePath);
        
        uploadStream.on('error', reject);
        uploadStream.on('finish', () => {
            resolve(uploadStream.id);
        });
        
        readStream.pipe(uploadStream);
    });
}

app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }
        
        const { characterName, category, tags, uploadedBy } = req.body;
        
        if (!characterName || !category) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Character name and category required' });
        }
        
        const tempPath = req.file.path;
        const jpegPath = tempPath.replace(path.extname(tempPath), '.jpg');
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.jpg';
        
        await convertToJPEG(tempPath, jpegPath);
        
        const metadata = await sharp(jpegPath).metadata();
        const fileId = await saveToGridFS(jpegPath, uniqueName);
        
        const image = new Image({
            filename: uniqueName,
            originalName: req.file.originalname,
            mimeType: 'image/jpeg',
            size: fs.statSync(jpegPath).size,
            width: metadata.width,
            height: metadata.height,
            characterName: characterName,
            category: category,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            uploadedBy: uploadedBy || 'Anonymous',
            fileId: fileId
        });
        
        await image.save();
        
        fs.unlinkSync(tempPath);
        fs.unlinkSync(jpegPath);
        
        const imageUrl = `${req.protocol}://${req.get('host')}/api/image/${image._id}`;
        
        res.json({
            success: true,
            message: 'Upload successful',
            imageId: image._id,
            imageUrl: imageUrl,
            filename: uniqueName,
            characterName: characterName,
            category: category
        });
        
    } catch (error) {
        console.error('Upload error:', error);
        
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({
            error: 'Image processing error',
            details: error.message
        });
    }
});

app.get('/api/image/:id', async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        
        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }
        
        image.views += 1;
        await image.save();
        
        const downloadStream = gfs.openDownloadStream(image.fileId);
        
        res.set('Content-Type', 'image/jpeg');
        res.set('Cache-Control', 'public, max-age=86400');
        
        downloadStream.pipe(res);
        
        downloadStream.on('error', (err) => {
            res.status(500).json({ error: 'Error serving image' });
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/images', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        const filter = {};
        if (req.query.category) filter.category = req.query.category;
        if (req.query.character) filter.characterName = new RegExp(req.query.character, 'i');
        if (req.query.tag) filter.tags = req.query.tag;
        
        const sort = {};
        if (req.query.sort === 'newest') sort.uploadDate = -1;
        else if (req.query.sort === 'popular') sort.views = -1;
        else if (req.query.sort === 'likes') sort.likes = -1;
        else sort.uploadDate = -1;
        
        const images = await Image.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .select('-fileId');
        
        const total = await Image.countDocuments(filter);
        
        const imagesWithUrl = images.map(img => ({
            ...img.toObject(),
            imageUrl: `${req.protocol}://${req.get('host')}/api/image/${img._id}`
        }));
        
        res.json({
            success: true,
            images: imagesWithUrl,
            total: total,
            page: page,
            totalPages: Math.ceil(total / limit)
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/images/search', async (req, res) => {
    try {
        const searchTerm = req.query.q || '';
        const limit = parseInt(req.query.limit) || 50;
        
        if (!searchTerm.trim()) {
            const images = await Image.find()
                .sort({ uploadDate: -1 })
                .limit(limit)
                .select('-fileId');
            
            const imagesWithUrl = images.map(img => ({
                ...img.toObject(),
                imageUrl: `${req.protocol}://${req.get('host')}/api/image/${img._id}`
            }));
            
            return res.json({
                success: true,
                images: imagesWithUrl,
                searchTerm: ''
            });
        }
        
        const images = await Image.find({
            $or: [
                { characterName: new RegExp(searchTerm, 'i') },
                { category: new RegExp(searchTerm, 'i') },
                { tags: new RegExp(searchTerm, 'i') }
            ]
        })
        .sort({ uploadDate: -1 })
        .limit(limit)
        .select('-fileId');
        
        const imagesWithUrl = images.map(img => ({
            ...img.toObject(),
            imageUrl: `${req.protocol}://${req.get('host')}/api/image/${img._id}`
        }));
        
        res.json({
            success: true,
            images: imagesWithUrl,
            searchTerm: searchTerm
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/images/:id/like', async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        
        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }
        
        image.likes += 1;
        await image.save();
        
        res.json({
            success: true,
            likes: image.likes
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        const stats = await Image.aggregate([
            {
                $group: {
                    _id: null,
                    totalImages: { $sum: 1 },
                    totalViews: { $sum: '$views' },
                    totalLikes: { $sum: '$likes' },
                    totalSize: { $sum: '$size' }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalImages: 1,
                    totalViews: 1,
                    totalLikes: 1,
                    totalSize: {
                        $divide: ['$totalSize', 1024 * 1024]
                    }
                }
            }
        ]);
        
        const categories = await Image.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);
        
        res.json({
            success: true,
            stats: stats[0] || {
                totalImages: 0,
                totalViews: 0,
                totalLikes: 0,
                totalSize: 0
            },
            categories: categories
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Image.distinct('category');
        res.json({
            success: true,
            categories: categories.sort()
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/tags', async (req, res) => {
    try {
        const tags = await Image.aggregate([
            { $unwind: '$tags' },
            {
                $group: {
                    _id: '$tags',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 50 }
        ]);
        
        res.json({
            success: true,
            tags: tags.map(tag => ({
                name: tag._id,
                count: tag.count
            }))
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/health', (req, res) => {
    res.json({
        status: 'online',
        service: 'PFPedia Upload API',
        timestamp: new Date().toISOString(),
        mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

app.listen(PORT, () => {
    console.log(`Upload server running on port ${PORT}`);
});