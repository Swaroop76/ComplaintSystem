const express = require('express');
const sql = require('mssql');
const multer = require('multer');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// SQL Server Configuration
const config = {
    user: 'Swaroop76',
    password: 'C@nfidential',
    server: 'complaint.database.windows.net',
    database: 'User_Credentials',
    options: {
        encrypt: true, // Use this if you're on Windows Azure
    },
};

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Serve HTML form
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/image.html');
});

// Handle file upload
app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        const { originalname, mimetype, buffer } = req.file;

        await sql.connect(config);

        // Insert image data into the database
        const result = await sql.query`
            INSERT INTO Images (FileName, MimeType, ImageData)
            VALUES (${originalname}, ${mimetype}, ${buffer})
        `;

        console.log('Image uploaded successfully:', result);

        res.send('Image uploaded successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    } finally {
        sql.close();
    }
});

// Retrieve and serve image based on name
app.get('/images/:name', async (req, res) => {
    const imageName = req.params.name;

    try {
        await sql.connect(config);

        // Retrieve image data from the database based on the FileName
        const result = await sql.query`
            SELECT FileName, MimeType, ImageData
            FROM Images
            WHERE FileName = ${imageName}
        `;

        if (result.recordset.length > 0) {
            const { FileName, MimeType, ImageData } = result.recordset[0];

            // Set the appropriate headers for the response
            res.setHeader('Content-Disposition', `inline; filename=${FileName}`);
            res.setHeader('Content-Type', MimeType);

            // Send the image data as the response
            res.send(Buffer.from(ImageData, 'base64'));
        } else {
            // Image not found
            res.status(404).send('Image not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    } finally {
        sql.close();
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});