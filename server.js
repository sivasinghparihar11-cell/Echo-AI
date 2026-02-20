const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// Groq Setup (Ye Render ki settings se key uthayega)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const systemInstruction = `
    Identity: ( mera naam Echo hai mere Malik Ram Singh Parihar )
    
    STRICT RULES:
    1. SIRF HINGLISH: WhatsApp style mein baat karein.
    2. NO SHUDDH HINDI: 'Tuajhko' ya 'Parihara' jaise shabd ban hain.
    3. SHORT & FAST: Jawab hamesha chota aur desi rakhein.
`;

app.post('/api/chat', async (req, res) => {
    const { prompt } = req.body;
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: prompt }
            ],
            model: "llama3-8b-8192", 
            temperature: 0.1, // Isse Echo bhatkegi nahi
        });

        res.json({ response: chatCompletion.choices[0].message.content });
    } catch (error) {
        res.json({ response: "Bhai, server busy hai. Thodi der baad try kar!" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Echo Cloud Brain is LIVE!`));
