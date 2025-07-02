require('dotenv').config();
const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { OpenAI } = require('openai');
const fs = require('fs');

const app = express();
const port = 3000;

// File upload config
const upload = multer({ dest: 'uploads/' });

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Endpoint
app.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You summarize resumes.' },
        { role: 'user', content: `Summarize this resume:\n\n${pdfData.text}` },
      ],
    });

    res.json({ summary: response.choices[0].message.content });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).send('An error occurred.');
  }
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running: http://localhost:${port}`);
});
