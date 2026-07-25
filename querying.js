import { VectorStore } from "@langchain/core/vectorstores"
import { OpenAIEmbeddings } from "@langchain/openai"
import { QdrantVectorStore } from "@langchain/qdrant"
import { Embeddings } from "openai/resources";
import OpenAI from "openai";
import 'dotenv/config';

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

async function query(userQuery) {
    // 1. Convert user query to vector Embeddings 
    const embedding = new OpenAIEmbeddings({
        model: "text-embedding-3-small",
        apiKey: process.env.OPENAI_API_KEY
    })

    // 2. search the vector in the qdrant 
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embedding, {
        url: "http://localhost:6333",
        collectionName: "chai-code-docs"
    }
    )

    // 3. get similar vector and chunks
    const vectorRetriever = vectorStore.asRetriever({ k: 5 }); // top 5 search
    const result = await vectorRetriever.invoke(userQuery);

    //4. feed those chunks to llm model and do a simple chat with(UserQuery)
    const SYSTEM_PROMPT = `
        You are an expert TypeScript documentation assistant.

        Your task is to answer the user's question ONLY using the provided documentation context.

        Rules:
        1. Answer only from the provided context.
        2. Never use outside knowledge or make assumptions.
        3. If the answer is not present in the context, reply:
           "I couldn't find this information in the provided TypeScript documentation."
        4. Be concise and technically accurate.
        5. When possible, mention the page number where the information was found.
        6. If multiple context chunks contain relevant information, combine them into a single clear answer.
        7. Do not invent APIs, syntax, examples, or explanations that are not present in the context.
        8. Always give answer in simple english language with sort examples and use-cases of that

        Context:
        ${result
            .map(
                (doc, index) => `
        Document ${index + 1}
        Page: ${doc.metadata.loc?.pageNumber ?? "Unknown"}
                    
        ${doc.pageContent}
        `
            )
            .join("\n---------------------------------\n")}
    `;
    const llmResponse = await client.chat.completions.create({
        model: "gpt-5-mini",
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userQuery }
        ]
    })

    console.log("LLMResponse=>", llmResponse.choices[0].message.content);
}
query(' What is an Interface in TypeScript ? ');