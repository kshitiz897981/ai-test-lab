import { ChatGroq } from "@langchain/groq";
import "dotenv/config";

const llm = new ChatGroq({
    model: "openai/gpt-oss-20b",
    temperature: 0,
     maxTokens: 2048,
       reasoningEffort: "low"
});


export const generateTestCases = async (
    code,
    existingTests = []
) => {

    const existingBehaviorText = existingTests
        .map(test => {
            return `${test.method || ""}|${test.path || ""}|${test.expectedStatus || ""}`;
        })
        .join("\n");

  const prompt = `

You are an expert software testing engineer.

Your task is to generate UNIQUE API test cases from the provided source code.

Analyze ONLY the provided source code.

The most important requirement is BEHAVIORAL UNIQUENESS.

Do NOT generate multiple tests for the same API behavior.

==================================================
CORE RULE
==================================================

A test is considered a DUPLICATE if it tests the same endpoint behavior,
even if:

- the test name is different
- the description is different
- the input values are slightly different
- the priority is different
- the source file is different
- the expected body is slightly different

For example, these should NOT both be generated:

1. Login with missing email
2. Login with missing password

If both result from the same "email and password are required" validation,
they represent ONE behavior.

Similarly:

1. Transaction with missing amount
2. Transaction with missing idempotencyKey
3. Transaction with missing fromAccount

If the source code handles all of them with the same validation condition
and same response, generate ONLY ONE test.

==================================================
EXISTING TESTS
==================================================

The following tests are ALREADY stored in the database:

${JSON.stringify(existingTests, null, 2)}

These tests MUST NOT be regenerated.

Before creating a test, compare it against the existing tests.

If an existing test already covers the same behavior, SKIP it.

==================================================
BEHAVIOR CATEGORIES
==================================================

Look for genuinely different behaviors such as:

1. SUCCESS
   - successful endpoint operation

2. AUTHENTICATION
   - missing authentication
   - invalid authentication
   - authenticated access

3. VALIDATION
   - missing required input
   - malformed input
   - invalid input
   - boundary condition

4. RESOURCE
   - resource exists
   - resource does not exist
   - invalid resource ID

5. BUSINESS LOGIC
   - different business rule
   - different state transition
   - duplicate/idempotency behavior

6. ERROR HANDLING
   - distinct error path
   - server-side failure

Only generate a category when the source code clearly supports it.

==================================================
VERY IMPORTANT
==================================================

DO NOT generate tests merely to increase the number of tests.

DO NOT generate similar tests.

DO NOT generate tests for hypothetical behavior.

DO NOT invent behavior.

DO NOT invent endpoints.

DO NOT invent HTTP methods.

DO NOT invent status codes.

DO NOT invent response bodies.

DO NOT invent validation rules.

DO NOT assume behavior that is not visible in the source code.

Every test MUST correspond to a distinct code path or meaningful behavior.

==================================================
BEHAVIORAL DEDUPLICATION
==================================================

Before generating each test, ask:

"Does an existing test already cover this exact behavior?"

Then ask:

"Does another generated test already cover this behavior?"

If YES to either question, DO NOT generate the test.

Two tests are considered the same behavior when they have:

- same HTTP method
- same API endpoint
- same validation/business condition
- same expected response behavior

Changing only input values does NOT make a test unique.

Changing only the test name does NOT make a test unique.

Changing only the description does NOT make a test unique.

==================================================
TEST COUNT
==================================================

Generate AT MOST 10 tests.

Generate fewer if fewer unique behaviors exist.

If only 2 genuinely unique behaviors exist, generate 2.

If there are no new behaviors, return:

{
  "testCases": []
}

==================================================
TEST QUALITY
==================================================

Prefer:

ONE strong test per distinct behavior

over

MANY tests covering the same behavior.

Prioritize meaningful coverage across different endpoints and code paths.

==================================================
OUTPUT FORMAT
==================================================

Return ONLY valid JSON.

Do not use markdown.

Do not include explanations.

Use exactly this structure:

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

==================================================
FIELD RULES
==================================================

name:
Short and unique.

description:
Briefly describe the behavior being tested.

input:
Must contain:

{
  "method": "HTTP method",
  "path": "API path",
  "body": {},
  "headers": {}
}

expectedOutput:
Must contain:

{
  "status": <status from source code>,
  "body": <response body from source code>
}

priority:
Must be exactly:

"HIGH"
"MEDIUM"
"LOW"

sourceFile:
Use the actual relevant source file path.

==================================================
FINAL CHECK BEFORE OUTPUT
==================================================

Before returning the JSON:

1. Remove tests that duplicate existing tests.
2. Remove tests that duplicate another generated test.
3. Remove tests that differ only by input values.
4. Remove tests that differ only by names/descriptions.
5. Remove tests that exercise the same validation condition.
6. Remove hypothetical tests.
7. Ensure every remaining test represents a genuinely different behavior.

Then return ONLY the final JSON.

==================================================
SOURCE CODE
==================================================

${code}
`;

    const response = await llm.invoke(prompt);

    let content = response.content;

    if (Array.isArray(content)) {
        content = content
            .map(item => item.text || "")
            .join("");
    }

    content = content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    const parsed = JSON.parse(content);

if (Array.isArray(parsed)) {
    return {
        testCases: parsed
    };
}

if (!Array.isArray(parsed?.testCases)) {
    return {
        testCases: []
    };
}

return parsed;
};



  