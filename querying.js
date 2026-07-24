import { VectorStore } from "@langchain/core/vectorstores"
import { OpenAIEmbeddings } from "@langchain/openai"
import { QdrantVectorStore } from "@langchain/qdrant"
import { Embeddings } from "openai/resources"

async function query (userQuery){
    // 1. Convert user query to vector Embeddings 
    const embedding = new OpenAIEmbeddings({
        model: "text-embedding-3-small",
        apiKey: process.env.OPENAI_API_KEY
    })

    // 2. search the vector in the qdrant 
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embedding,{
            url:"http://localhost:6363",
        }
    )

    // 3. get similar vector and chunks
    const vectorRetriever = vectorStore.asRetriever({ k: 5 }); // top 5 search
    const result = await vectorRetriever.invoke(userQuery);

    //4. feed those chunks to llm model and do a simple chat with(UserQuery)
    const SYSTEM_PROMPT = `You are expert in answering user query base on provided context about document. Do not answer anything beyond what is not provided.
    ${result.map(e=>JSON.stringify({pageContent :e.pageContent,pageNumber:e.metadata.loc.pageContent}))}`;
}