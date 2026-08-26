import { HuggingFaceTransformersEmbeddings } 
    from "@langchain/community/embeddings/huggingface_transformers";

import { MemoryVectorStore } 
    from "@langchain/classic/vectorstores/memory";


const embeddings = new HuggingFaceTransformersEmbeddings({
    model: "Xenova/all-MiniLM-L6-v2"
});


export const createVectorStore = async (documents) => {

    const vectorStore = await MemoryVectorStore.fromDocuments(
        documents,
        embeddings
    );

    return vectorStore;
};