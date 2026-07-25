import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import 'dotenv/config';
async function generateVectorEmbeddingsForFile(filepath) {
    const loader = new PDFLoader(filepath)
    const document = await loader.load() // 1.Already chunks data page by page
    console.log(document[0].metadata)

    //2. Initialize the embedding model
    const embeddings = new OpenAIEmbeddings({
        model: "text-embedding-3-small",
        apiKey: process.env.OPENAI_API_KEY
    });

    //3. The vector store
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,// use this embedding model
        {
            url: "http://localhost:6333",
            collectionName: "chai-code-docs"
        }
    )
    await vectorStore.addDocuments(document);
    console.log("All the documents are indexed...")
};

generateVectorEmbeddingsForFile('./Pro_TypeScript_2nd.www.EBooksWorld.ir.pdf');


