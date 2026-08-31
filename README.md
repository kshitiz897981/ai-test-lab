# AI Test Lab 🧪🤖

**AI-powered API testing and code intelligence platform that analyzes GitHub repositories, generates source-aware test cases using RAG and LLMs, executes them against a target API, and provides AI-assisted failure analysis.**

## 🚀 Overview

AI Test Lab automates a large part of the API testing workflow.

Instead of manually reading a backend codebase and writing test cases, developers can connect a GitHub repository and let the platform:

1. Analyze the repository source code
2. Extract relevant code using RAG
3. Generate meaningful API test cases with an LLM
4. Detect and prevent duplicate test cases
5. Store test cases in MongoDB
6. Execute the generated tests against a target API
7. Compare expected and actual responses
8. Analyze failed tests using AI
9. Track execution history and pass rates

The goal is to provide a single workspace for **AI-assisted API test generation, execution, and debugging**.

---

## ✨ Features

### 🔐 Authentication

* User registration
* User login
* User logout
* Protected API routes
* Cookie-based authentication

### 📦 Project Management

* Create projects
* Connect GitHub repositories
* Configure target API URLs
* Delete projects
* View project-specific testing data

### 🔍 Repository Analysis

AI Test Lab connects to a GitHub repository and analyzes its source code.

The system:

* Retrieves repository files using GitHub APIs
* Filters relevant source files
* Fetches file contents
* Converts source code into LangChain documents
* Creates a vector store
* Performs multiple semantic searches against the codebase

Analysis queries include:

* Authentication
* Authorization
* API validation
* CRUD operations
* Database operations
* Business logic
* API routes
* Error handling
* HTTP responses

### 🧠 RAG-Based Test Generation

Instead of sending the entire repository directly to the LLM, AI Test Lab uses Retrieval-Augmented Generation.

```text
GitHub Repository
       ↓
Source Files
       ↓
Code Documents
       ↓
Vector Store
       ↓
Semantic Retrieval
       ↓
Relevant Code
       ↓
LLM
       ↓
API Test Cases
```

This allows generated tests to be grounded in the actual implementation instead of relying purely on generic testing assumptions.

### 🧪 AI Test Generation

Generated test cases contain:

* Test name
* Description
* HTTP method
* API path
* Request body
* Request headers
* Expected status
* Expected response
* Priority
* Source file

The system is instructed to generate tests only when the behavior can be inferred from the source code.

### ♻️ Duplicate Test Detection

AI-generated tests are compared against existing project tests before being stored.

The system creates behavior-based keys using request information such as:

```text
HTTP method
API path
Expected status
Request body structure
Request headers
```

Only genuinely new test cases are inserted into MongoDB.

This prevents repeated repository analysis from continuously filling the database with duplicate tests.

### ▶️ Test Execution

Generated tests can be executed against a configured target API.

For every test execution, AI Test Lab records:

* PASS / FAIL status
* Expected output
* Actual output
* Execution time
* Error information
* Test run ID

### 🤖 AI Failure Analysis

When a test fails, the failure is sent to an AI-powered failure analysis service.

The system compares:

```text
Expected Response
        vs
Actual Response
        ↓
AI Failure Analysis
        ↓
Failure Explanation
```

This helps developers understand why an API test failed instead of simply seeing a red `FAILED` status.

### 📊 Test Run History

Every execution receives a unique run ID.

The platform tracks:

* Total tests
* Passed tests
* Failed tests
* Pass rate
* Execution timestamp
* Individual test results

### 🗑️ Test Management

Users can:

* Delete individual test cases
* Delete all test cases for a project
* Delete projects

---

## 🏗️ Architecture

```text
                         ┌──────────────────┐
                         │     Frontend     │
                         │      React       │
                         │     Vite         │
                         └────────┬─────────┘
                                  │
                                  │ REST API
                                  ▼
                         ┌──────────────────┐
                         │     Express      │
                         │     Backend      │
                         └────────┬─────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
       ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
       │   GitHub    │     │  MongoDB    │     │   Target    │
       │     API     │     │             │     │     API     │
       └──────┬──────┘     └─────────────┘     └──────┬──────┘
              │                                        │
              ▼                                        │
       ┌─────────────┐                                  │
       │ Source Code │                                  │
       └──────┬──────┘                                  │
              ▼                                          │
       ┌─────────────┐                                  │
       │ LangChain   │                                  │
       │ Documents   │                                  │
       └──────┬──────┘                                  │
              ▼                                          │
       ┌─────────────┐                                  │
       │ Vector      │                                  │
       │ Store       │                                  │
       └──────┬──────┘                                  │
              ▼                                          │
       ┌─────────────┐                                  │
       │ RAG         │                                  │
       │ Retrieval   │                                  │
       └──────┬──────┘                                  │
              ▼                                          │
       ┌─────────────┐                                  │
       │   Groq /    │                                  │
       │    LLM      │                                  │
       └──────┬──────┘                                  │
              │                                          │
              ▼                                          │
       ┌─────────────┐                                  │
       │ Test Case   │──────────────────────────────────┘
       │ Generation  │
       └──────┬──────┘
              ▼
       ┌─────────────┐
       │ Test Runner │
       └──────┬──────┘
              ▼
       ┌─────────────┐
       │ Test Result │
       └──────┬──────┘
              ▼
       ┌─────────────┐
       │ AI Failure  │
       │  Analysis   │
       └─────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* React Router
* Tailwind CSS
* Axios

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT / Cookie Authentication

### AI / RAG

* LangChain
* Groq
* `openai/gpt-oss-20b`
* Vector embeddings
* Semantic similarity search

### Integrations

* GitHub API
* Octokit

### Development

* Git
* GitHub
* npm

---

## 📁 Project Structure

```text
ai-test-lab/
│
├── backend/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       └── services/
│
├── frontend/
│   └── vite-project/
│       └── src/
│           ├── components/
│           ├── pages/
│           ├── services/
│           └── ...
│
└── README.md
```

---

## 🔄 Complete Workflow

```text
1. User creates a project
             ↓
2. Connect GitHub repository
             ↓
3. Configure target API URL
             ↓
4. Analyze repository
             ↓
5. Fetch source files
             ↓
6. Create code documents
             ↓
7. Build vector store
             ↓
8. Retrieve relevant source code
             ↓
9. Generate API test cases
             ↓
10. Detect duplicate behaviors
             ↓
11. Store new tests in MongoDB
             ↓
12. Execute test suite
             ↓
13. Compare expected vs actual
             ↓
14. Analyze failures with AI
             ↓
15. Store execution results
             ↓
16. View results and test history
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the backend directory.

```env
PORT=3000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

GITHUB_TOKEN=your_github_token

GROQ_API_KEY=your_groq_api_key
```

Never commit your `.env` file to GitHub.

---

## 🏃 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/kshitiz897981/ai-test-lab.git

cd ai-test-lab
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure backend environment variables

Create:

```text
backend/.env
```

and add the required credentials.

### 4. Start the backend

```bash
npm run dev
```

### 5. Install frontend dependencies

Open another terminal:

```bash
cd frontend/vite-project
npm install
```

### 6. Start the frontend

```bash
npm run dev
```

Open the URL displayed by Vite in your browser.

---

## 📸 Screenshots

Add screenshots of the following sections here:

### Dashboard

```text
Add dashboard screenshot
```

### Repository Analysis

```text
Add repository analysis screenshot
```

### AI Test Lab

```text
Add test generation screenshot
```

### Test Results

```text
Add execution results screenshot
```

### Failure Analysis

```text
Add failure analysis screenshot
```

---

## 🎯 Why This Project?

Traditional API testing requires developers to manually:

* Understand an unfamiliar codebase
* Identify API endpoints
* Determine validation rules
* Write test cases
* Execute tests
* Analyze failures

AI Test Lab combines **source-code retrieval, LLM reasoning, automated execution, and failure analysis** into a single workflow.

The system is designed to keep generated tests grounded in the actual source code rather than generating arbitrary API scenarios.

---

## 🔮 Future Improvements

* CI/CD integration
* Scheduled test execution
* Parallel test execution
* More embedding/vector-store options
* Test editing and versioning
* API schema/OpenAPI import
* Automatic regression detection
* Coverage reporting
* Team collaboration
* Role-based access control
* Production deployment
* Support for additional LLM providers

---

## 👨‍💻 Author

**Kshitiz Varshney**

Full Stack Developer | AI Engineering | MERN | LangChain

GitHub: [kshitiz897981](https://github.com/kshitiz897981)

---

## ⭐ Project Highlights

> AI-powered source-aware API test generation using RAG + LLMs, automated test execution, duplicate detection, and AI-assisted failure analysis.

If you find the project useful, consider giving it a ⭐ on GitHub.
