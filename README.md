**AUTHENTO: Authenticity Validator for Academia 🛡️**

A digital platform to combat the problem of fake academic degrees and certificates. It provides a secure and scalable system for employers, institutions, and government bodies to verify the authenticity of documents in real-time.

**✨ Key Features**

OCR Data Extraction: Automatically pulls key details from uploaded documents.

Database Verification: Cross-references extracted data against a trusted database to flag mismatches.

Role-Based Access: Secure portals for Students, Employers, and Admins.

Admin Dashboard: Monitor verification trends, view logs, and manage a blacklist of offenders.

Blockchain Support: Optional hash verification for an added layer of security.

**💻 Tech Stack**

Frontend: ⚛️ React (Vite), Tailwind CSS

Backend: 🌲 Supabase (PostgreSQL, Auth, Storage, Edge Functions)

AI/OCR: 🐍 Python, Tesseract / Google Vision API

Blockchain: ⛓️ Solidity, Polygon (Mumbai Testnet), Ethers.js

Chatbot: 🤖 Dialogflow / Botpress

**🚀 Core Verification Workflow**

Upload: A user uploads a document via the React Frontend.

Store & Extract: The Backend saves the file to Supabase Storage and triggers the AI/OCR service.

Compare: The Backend receives the extracted JSON data and compares it against the trusted record in the database.

Verify: The Backend (optionally) verifies the document's hash on the Blockchain.

Respond: A final verdict (VALID, FORGERY_DETECTED, etc.) is generated and sent back to the Frontend for display.

**👥 Team Roles & Responsibilities**

👤 1. **Team Lead / Backend Integrator**

Key Responsibilities:

Design and build the core backend APIs using Supabase Edge Functions.

Integrate outputs from the AI/OCR and Blockchain services.

Manage the GitHub repository and deployment pipeline.

First Steps:

Finalize the database schema and Row Level Security (RLS) policies.

Build the initial POST /api/verify and POST /api/certificates endpoints.

🎨 2. **Frontend Developer (UI/UX)**

Key Responsibilities:

Develop portals for Students, Employers, and Admins.

Implement authentication flows and forms for document uploads.

Display detailed verification results in a clean, user-friendly way.

First Steps:

Create wireframes for all major screens in Figma.

Set up the React project with Vite and Tailwind CSS.

Build the static UI for the Login and Upload pages.

🧠 3. **AI/OCR Specialist**

Key Responsibilities:

Build a service to extract key details (Name, Roll No, etc.) from documents.

Clean and structure the extracted data into a reliable JSON format.

Implement rules to detect obvious tampering.

First Steps:

Test OCR libraries (e.g., Tesseract) on sample documents.

Create a basic script that takes an image and outputs a JSON object.

Finalize the JSON output format with the Backend Lead (see API Contracts).

🔗 4. **Blockchain Developer**

Key Responsibilities:

Write and deploy a Solidity smart contract for storing certificate hashes.

Create storeHash and verifyHash functions in the contract.

Provide a way for the backend to interact with the contract using Ethers.js.

First Steps:

Set up a development wallet and get testnet MATIC from a faucet.

Deploy a simple test contract to the Polygon Mumbai testnet.

🔒 5.** Admin & Security Specialist**
Key Responsibilities:

Implement Role-Based Access Control (RBAC) using Supabase Auth and RLS.

Build the Admin Dashboard for analytics, blacklisting, and logs.

Ensure all APIs are secure and require proper authentication.

First Steps:

Configure Supabase Auth settings (email providers, etc.).

Write initial RLS policies for the certificates table.

Design the layout for the Admin Dashboard.

🤖 6. **Chatbot + Documentation & Demo Lead**

Key Responsibilities:

Build a chatbot to answer frequently asked questions.

Write clear user guides and project documentation.

Prepare the final SIH presentation and demo script.

First Steps:

Create a list of potential user FAQs.

Sign up for a service like Dialogflow or Botpress.

Draft the "Problem-Solution" slide for the final presentation.
