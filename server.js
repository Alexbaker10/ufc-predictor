require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Gemini API
const ai = new GoogleGenAI({});

app.post('/api/predict', async (req, res) => {
    const { fighter1, fighter2 } = req.body;

    if (!fighter1 || !fighter2) {
        return res.status(400).json({ error: 'Please provide both fighters.' });
    }

    try {
        const prompt = `
        You are an expert MMA analyst and prediction engine. 
        Analyze a hypothetical UFC matchup between ${fighter1} and ${fighter2}.
        
        Use the following logic to assess the fighters:
        1. Compare their physical traits (Height, Reach, Age, Record).
        2. Compare their MMA skills (Boxing, Muay Thai, BJJ, Wrestling).
        3. Assign an edge to one fighter in each category. The favored fighter gets a "Fav" (-1) and the underdog gets a "Dog" (+1).
        4. Based on these Fav/Dog assessments, calculate a realistic win probability percentage for each fighter (must add up to 100%).
        5. Look to see if they have faced in the past and if either fighter has improved since then to chaneg the outcome.

        Output your response STRICTLY as a JSON object with the following structure (no markdown, no extra text):
        {
            "matchup": "${fighter1} vs ${fighter2}",
            "stats": {
                "height": {"fav": "Fighter Name", "dog": "Fighter Name"},
                "reach": {"fav": "Fighter Name", "dog": "Fighter Name"},
                "striking": {"fav": "Fighter Name", "dog": "Fighter Name"},
                "grappling": {"fav": "Fighter Name", "dog": "Fighter Name"}
            },
            "analysis": "A brief 3-sentence summary of how the fight plays out based on the Fav/Dog advantages.",
            "probabilities": {
                "${fighter1}": 80,
                "${fighter2}": 20
            }
        }
        `;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview", // Using the newest model from your docs!
            contents: prompt
        });
        
        const responseText = response.text;
        const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const predictionData = JSON.parse(cleanedJson);

        res.json(predictionData);

    } catch (error) {
        console.error("Prediction Error:", error);
        res.status(500).json({ error: 'Failed to generate prediction. Please try again.' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});