import { ChatGroq } from "@langchain/groq";
import "dotenv/config";

const llm = new ChatGroq({
    model: "openai/gpt-oss-20b",
    temperature: 0,
     maxTokens: 4096,
       reasoningEffort: "low"
});

export const generateTestCases = async (code,existingTests = []) => {

const prompt = `

You are an expert software testing engineer responsible for generating
a comprehensive API test suite from source code.

Analyze ONLY the source code provided below.

Your goal is to identify distinct API behaviors that can be reasonably
inferred from the provided source code.

Do NOT artificially generate tests just to reach a number.
Quality and source-code coverage are more important than quantity.

IMPORTANT OUTPUT LIMIT:

- Generate AT MOST 15 test cases.
- Generate fewer than 15 if fewer distinct behaviors are available.
- Never create duplicate or near-duplicate tests.
- Keep every field concise.
- name must be concise.
- description must be concise.
- sourceFile must contain only the relevant file path.
- Do not include explanations outside the JSON.
- Do not include markdown code fences.
- Do not include comments inside the JSON.

PRIORITIZE COVERAGE ACROSS THESE CATEGORIES:

1. AUTHENTICATION
   - register
   - login
   - logout

2. AUTHORIZATION
   - protected routes
   - missing authentication
   - invalid authentication
   - authenticated access

3. CRUD OPERATIONS
   - create
   - read
   - update
   - delete

4. VALIDATION
   - missing fields
   - invalid input
   - malformed input
   - boundary values

5. ERROR HANDLING
   - resource not found
   - duplicate resources
   - invalid requests
   - server-side failures

6. BUSINESS LOGIC
   - important service/controller behavior
   - state changes
   - database operations

7. EDGE CASES
   - empty input
   - nonexistent resources
   - repeated operations
   - unusual but code-supported inputs

IMPORTANT RULES:

- Generate tests ONLY for behavior supported by the provided source code.
- DO NOT invent endpoints.
- DO NOT invent HTTP methods.
- DO NOT invent status codes.
- DO NOT invent response bodies.
- DO NOT invent database behavior.
- DO NOT invent validation rules.
- DO NOT assume an endpoint exists unless it can be inferred from the code.
- DO NOT generate duplicate or near-duplicate test cases.
- Prefer different endpoints and different behaviors.
- Cover multiple source files whenever possible.
- If a category is not supported by the source code, skip it.
- Every test must represent a meaningful unique scenario.
- Expected status codes MUST be inferred from the actual source code.
- Expected response bodies MUST be inferred from the actual source code.
- Do not use generic or assumed values when the source code provides specific ones.

FOR EVERY TEST CASE PROVIDE:

- name
- description
- input
- expectedOutput
- priority
- sourceFile

The input MUST follow this structure:

{
  "method": "HTTP method",
  "path": "API path",
  "body": {},
  "headers": {}
}

The expectedOutput MUST follow this structure:

{
  "status": <HTTP status inferred from source code>,
  "body": <response body inferred from source code>
}

PRIORITY MUST BE ONE OF:

"HIGH"
"MEDIUM"
"LOW"

RETURN ONLY VALID JSON.

DO NOT wrap the JSON in markdown.

Return exactly this structure:

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

The values in the example above are illustrative only.
Use values inferred from the actual source code.

EXISTING TEST CASES:

${JSON.stringify(existingTests, null, 2)}

IMPORTANT TEST DEDUPLICATION RULES:

The existing test cases above are ALREADY implemented and stored.

DO NOT generate a test case that covers the same API behavior
as any existing test case.

Different test names, descriptions, priorities, or source files
DO NOT make a test different.

Consider a test duplicate when it covers the same:
- HTTP method
- API path
- meaningful input
- expected response behavior

If an API behavior is already covered, SKIP it.

Generate ONLY genuinely new test scenarios that can be inferred
from the source code.

DO NOT create tests just to increase the test count.

If there are no additional behaviors to test, return:

{
  "testCases": []
}

OUTPUT LIMIT:

Generate only the test cases that are genuinely useful.

Maximum 15 test cases.

Keep every field concise.

Do not include unnecessary explanation.

Return complete valid JSON.

SOURCE CODE:

${code}
`;


  const response = await llm.invoke(prompt);



return JSON.parse(response.content);
};