import { ChatGroq } from "@langchain/groq";
import "dotenv/config";

const llm = new ChatGroq({
    model: "openai/gpt-oss-20b",
    temperature: 0,
     maxTokens: 2048,
       reasoningEffort: "low"
});

export const generateTestCases = async (code) => {

    const prompt = `
You are an expert software testing engineer.

Analyze ONLY the source code provided below.

Generate test cases based strictly on behavior that can be inferred
from the provided source code.

DO NOT invent validations, HTTP status codes, database behavior,
or business rules that are not present in the code.

For every test case provide:

- name
- description
- input
- expectedOutput
- priority
- sourceFile
  
    The input MUST be structured as:

{
  "method": "HTTP method",
  "path": "API path",
  "body": {},
  "headers": {}
}

The expectedOutput MUST be structured as:

{
  "status": 200,
  "body": {}
}

Return ONLY valid JSON.

The response must have exactly this structure:

  {
  "testCases": [
    {
      "name": "string",
      "description": "string",
      "input": {
        "method": "POST",
        "path": "/example",
        "body": {},
        "headers": {}
      },
      "expectedOutput": {
        "status": 200,
        "body": {}
      },
      "priority": "HIGH",
      "sourceFile": "string"
    }
  ]
}

SOURCE CODE:

${code}
`;

  const response = await llm.invoke(prompt);



return JSON.parse(response.content);
};