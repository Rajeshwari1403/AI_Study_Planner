import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GROQ_API_KEY) {
    console.error("FATAL ERROR: GROQ_API_KEY is missing in .env");
    process.exit(1);
}

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const callGroq = async (prompt, retries = 3) => {

    let lastError;

    for (let i = 0; i < retries; i++) {

        try {

            const response = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content:
                            "You generate ONLY valid JSON. Never include markdown or explanations."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.2,
                response_format: {
                    type: "json_object"
                }
            });

            return response;

        } catch (error) {

            lastError = error;

            const status = error.status || error.code;

            if ((status === 429 || status === 503) && i < retries - 1) {

                console.log(`Groq busy... Retry ${i + 1}/${retries}`);

                await sleep((i + 1) * 2000);

                continue;
            }

            throw error;
        }
    }

    throw lastError;
};

export const generateMindMap = async (text, topic) => {

    const prompt = `
Create a hierarchical mind map ONLY about "${topic}".

Rules:

1. Use only information present in the document.

2. Ignore unrelated content.

3. Return ONLY JSON.

4. Never return markdown.

5. Maximum depth = 3.

6. Maximum 6 children per node.

JSON format:

{
    "name":"${topic}",
    "children":[
        {
            "name":"Main Concept",
            "children":[
                {
                    "name":"Sub Concept",
                    "children":[]
                }
            ]
        }
    ]
}

If the topic is absent return:

{
    "name":"${topic}",
    "children":[
        {
            "name":"Topic not found"
        }
    ]
}

Document:

${text.substring(0,6000)}
`;

    try {

        const response = await callGroq(prompt);

        let output = response.choices[0].message.content;

        output = output
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const parsed = JSON.parse(output);

        if (!parsed.name) {

            return {
                name: topic,
                children: [
                    {
                        name: "Topic not found"
                    }
                ]
            };
        }

        if (!parsed.children) {
            parsed.children = [];
        }

        return parsed;

    } catch (error) {

        console.error("Groq Error:", error);

        if (error.status === 429) {
            error.message = "Groq rate limit exceeded. Please try again in a few seconds.";
        }

        if (error.status === 503) {
            error.message = "Groq is temporarily unavailable.";
        }

        throw error;
    }
};