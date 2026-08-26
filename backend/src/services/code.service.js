import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200
});

export const createCodeDocuments = async (codeFiles) => {

    const documents = codeFiles.map((file) => {
        return new Document({
            pageContent: file.content,
            metadata: {
                path: file.path
            }
        });
    });

    const chunks = await splitter.splitDocuments(documents);

    return chunks;
};