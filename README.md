**AUTHENTO**: Authenticity Validator for Academia 🛡️
AUTHENTO is a digital platform designed to combat the problem of fake academic degrees and certificates. It provides a secure, scalable, and intelligent system for employers, institutions, and government bodies to verify the authenticity of documents in real-time.

**Tech Stack 💻**
Frontend: React (Vite), Tailwind CSS
Backend: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
AI/OCR: Python, Tesseract / Google Vision API
Blockchain: Solidity, Polygon (Mumbai Testnet), Ethers.js
Chatbot: Dialogflow / Botpress

**Core Project Workflow**
Understanding how data flows through our system is crucial for integration. Here is the primary verification workflow:
  Upload: An employer uploads a certificate image/PDF via the Frontend.
  Store: The Frontend sends the file to the Backend, which saves it in Supabase Storage.
  Extract: The Backend sends the file URL to the AI/OCR Service. The service processes it and returns structured JSON data (name, marks, etc.).
  Compare: The Backend receives the OCR data and queries the Supabase Database for the trusted "golden record" of that certificate.
  Verify: The Backend compares the OCR data with the database record. It can also call the Blockchain to verify the document's hash for an extra layer of security.
  Respond: The Backend generates a final verdict (VALID, FORGERY_DETECTED, etc.) and sends it back to the Frontend.

**Team Roles & Responsibilities 👥**
1. Team Lead / Backend Integrator
Work:
Design and build the core backend using Supabase Edge Functions.
Create RESTful APIs for user authentication, certificate uploads, and the verification engine.
Integrate the outputs from the AI/OCR and Blockchain components into the main API response.
Manage the GitHub repository, branching strategy, and deployment.

Getting Started:
Finalize the database schema and RLS policies.
Build the initial POST /api/verify and POST /api/certificates endpoints with mock data.

2. **Frontend Developer (UI/UX)**
Work:
Develop the user-facing portals for Students, Employers, and Admins using React and Tailwind CSS.
Implement user authentication flows (signup/login).
Create clean, responsive forms for document uploads and display detailed verification results.

Getting Started:
Create wireframes for all major screens in Figma.
Set up the React project using Vite.
Build the static UI components for the Login and Upload pages.

3. **AI/OCR Specialist**
Work:
Build a Python script/service to extract key details (Name, Roll No, Marks, etc.) from certificate images and PDFs.
Clean and structure the extracted data into a reliable JSON format.
Implement rules to detect obvious tampering (e.g., mismatched fonts, formatting issues).

Getting Started:
Test OCR libraries (like Tesseract) on sample certificate images.
Create a basic script that takes an image path and prints the extracted JSON.
Work with the Backend Lead to finalize the JSON output format (see API Contracts).

4. **Blockchain Developer**
Work:
Write and deploy a Solidity smart contract to the Polygon Mumbai testnet for storing certificate hashes.
Create functions in the contract to storeHash and verifyHash.
Provide a library or module for the backend to interact with the smart contract using Ethers.js.

Getting Started:
Set up a development wallet (e.g., MetaMask) and get testnet MATIC from a faucet.
Write and deploy a simple "Hello World" contract to the testnet to confirm the setup.
Design the storeHash function.

5. **Admin & Security Specialist**
Work:
Implement role-based access control (RBAC) across the platform using Supabase Auth and RLS policies.
Build the Admin Dashboard UI to display analytics (e.g., verification stats), manage the user blacklist, and view logs.
Ensure all APIs are secured and require proper authentication.

Getting Started:
Configure Supabase Auth settings (email providers, templates).
Write the initial SQL policies for the certificates table (e.g., "Students can only see their own certificates").
Design the layout for the Admin Dashboard.

6. **Chatbot + Documentation & Demo Lead**
Work:
Build a simple, helpful chatbot to answer frequently asked questions.
Write clear, user-friendly documentation for the project's features.
Prepare the final presentation slides and a compelling demo script for the SIH evaluation.

Getting Started:
Create a list of potential user FAQs.
Sign up for a service like Dialogflow or Botpress and create a new agent.
Draft the project's "Problem-Solution" slide for the final presentation.




