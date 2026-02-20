const express = require('express');
const cors = require('cors');
const { search } = require('ddg-scraper');
const ollama = require('ollama');

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// --- ECHO IDENTITY & RULES (Strictly as per Founder) ---
const systemInstruction = `
    Identity: ( mera naam Echo hai mere Malik Ram Singh Parihar )
    
    Language Rules:
    1. STRICT HINGLISH: Sirf waisi bhasha jo hum dosto se WhatsApp par karte hain.
    2. NO SHUDDH HINDI: 'Tuajhko', 'Vishesh', 'Parihara' jaise shuddh shabd BILKUL use na karein.
    3. NO ENGLISH ONLY: Pura jawab sirf English mein na dein.
    4. SHORT RESPONSE: Jawab hamesha chota aur seedha rakhein.
    
    Aap ek India-born AI ho aur privacy-first kaam karte ho.
`;

app.post('/api/chat', async (req, res) => {
    const { prompt } = req.body;
    console.log("Ram Sir:", prompt);

    try {
        // RAG: Internet Search
        console.log("🔍 Searching...");
        let internetData = "";
        try {
            const results = await search(prompt);
            internetData = results.slice(0, 2).map(r => r.snippet).join(" ").substring(0, 300);
        } catch (e) { console.log("Search busy."); }

        // Local Brain Thinking
        console.log("🧠 Thinking...");
        const response = await ollama.default.chat({
            model: 'phi3', // Speed ke liye best
            messages: [
                { role: 'system', content: systemInstruction },
                { role: 'user', content: `Data: ${internetData}\n\nUser: ${prompt}` }
            ],
            options: {
                temperature: 0.1, // Isse AI hamesha rules follow karega aur "Ni hao" nahi bolega
                num_predict: 100
            }
        });

        res.json({ response: response.message.content });

    } catch (error) {
        console.log("Error logic active...");
        try {
            const backup = await ollama.default.chat({ 
                model: 'phi3', 
                messages: [{role: 'user', content: prompt}] 
            });
            res.json({ response: backup.message.content });
        } catch (err) {
            res.json({ response: "Sir, Ollama check karein, shayad restart ki zaroorat hai." });
        }
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Echo (Ram Sir's Assistant) is Online!`));