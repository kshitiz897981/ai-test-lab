import { ChatGroq } from "@langchain/groq";

const llm = new ChatGroq({
    model: "openai/gpt-oss-20b",
    temperature: 0,
    maxTokens: 1000
});

export const analyzeFailure = async ({
    testCase,
    expected,
    actual
}) => {

    const prompt = `
You are an expert software testing engineer.

Analyze the failed API test below.

TEST CASE:
${JSON.stringify(testCase, null, 2)}

EXPECTED:
${JSON.stringify(expected, null, 2)}

ACTUAL:
${JSON.stringify(actual, null, 2)}

Return ONLY valid JSON using exactly this structure:

{
    "reason": "string",
    "severity": "HIGH | MEDIUM | LOW",
    "suggestedFix": "string"
}

Do not invent information that cannot be inferred from the test case,
expected output, or actual output.
`;

    const response = await llm.invoke(prompt);

    return JSON.parse(response.content);
};