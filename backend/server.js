const express = require("express");
const cors = require("cors");
const googleTTS = require("google-tts-api");
const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// AWS S3 Configuration
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

// Generate Speech, Save Locally & Upload to S3
app.post("/tts", async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "Text is required" });

        // Get Google TTS MP3 URL
        const mp3Url = googleTTS.getAudioUrl(text, { lang: "en", slow: false });

        // Fetch MP3 file
        const response = await fetch(mp3Url);
        const buffer = await response.arrayBuffer();

        // Set headers to send MP3 file
        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Content-Disposition", 'attachment; filename="speech.mp3"');

        // Send MP3 file as response
        res.send(Buffer.from(buffer));

        // // Define local file path
        // const fileName = `tts-${Date.now()}.mp3`;
        // const filePath = path.join(__dirname, fileName);

        // // Save file locally
        // fs.writeFileSync(filePath, Buffer.from(buffer));
        // console.log(`MP3 saved locally at: ${filePath}`);

        // Upload to AWS S3
        // const params = {
        //     Bucket: process.env.AWS_BUCKET_NAME,
        //     Key: fileName,
        //     Body: fs.createReadStream(filePath),
        //     ContentType: "audio/mp3",
        //     ACL: "public-read"
        // };

        // const uploaded = await s3.upload(params).promise();
        // console.log(`MP3 uploaded to S3 at: ${uploaded.Location}`);

        // return res.json({
        //     // audioUrl: uploaded.Location,
        //     localPath: filePath
        // });

    } catch (error) {
        console.error("TTS Error:", error);
        res.status(500).json({ error: "Failed to generate speech" });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
