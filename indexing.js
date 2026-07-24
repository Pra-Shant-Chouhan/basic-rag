import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';

async function generateVectorEmbeddingsForFile(filepath) {
    const loader = new PDFLoader(filepath)
    const document = await loader.load() //Already chunks data page by page

    // Initialize the embedding model
    const embeddings = new OpenAIEmbeddings({
        model: "text-embedding-3-small",
        apiKey: ""
    });

    // The vector store
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
        {
            embeddings, // use this embedding model
            url: "http://localhost:6333",
            collectionName: "chai-code-docs"
        }
    )
    await vectorStore.addDocuments(document);
    console.log("All the documents are indexed.")
};

generateVectorEmbeddingsForFile('./typescripts-docs.pdf');


