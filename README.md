# 🚀 Identity Reconciliation API

A backend service for **Bitespeed's Identity Reconciliation Task**.  
It consolidates customer contacts across multiple purchases by linking emails and phone numbers.  

Built with **Node.js**, **TypeScript**, **Express**, and **PostgreSQL (Prisma ORM)**.

---

## 🌐 Live Endpoint

Your deployed API (Render.com):

**🔗 (https://identity-reconciliation-rveh.onrender.com/)**

---

## 🛠️ API Endpoint

### **POST `/identify`**

Consolidates contact information and returns the **primary + secondary contact details**.

**Request Body (JSON):**

```json
{
  "email": "user@example.com",
  "phoneNumber": "1234567890"
}

Either email or phoneNumber is required.

Success Response (200):

{
  "contact": {
    "primaryContactId": 1,
    "emails": ["primary@example.com","secondary@example.com"],
    "phoneNumbers": ["1234567890","0987654321"],
    "secondaryContactIds": [2,3]
  }
}

Error Response (400 - Missing Input):

{
  "error": "Either email or phoneNumber must be provided"
}
📚 Example Requests
1️⃣ New user
{
  "email": "lorraine@hillvalley.edu",
  "phoneNumber": "123456"
}

Response:

{
  "contact": {
    "primaryContactId": 1,
    "emails": ["lorraine@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": []
  }
}
2️⃣ Existing email, new phone
{
  "email": "lorraine@hillvalley.edu",
  "phoneNumber": "999999"
}

Response:

{
  "contact": {
    "primaryContactId": 1,
    "emails": ["lorraine@hillvalley.edu"],
    "phoneNumbers": ["123456", "999999"],
    "secondaryContactIds": [2]
  }
}
✅ All Test Scenarios
#	Scenario	Expected Outcome
1	🆕 New user	Creates a new primary contact
2	✉️ Existing email, new phone	Creates a secondary contact linked to primary
3	📞 Existing phone, new email	Creates a secondary contact linked to primary
4	🔀 Two primaries merging	Oldest contact remains primary, other becomes secondary
5	⚠️ Missing input	Returns 400 with error message
6	✉️ Only email provided	Works correctly, primary or secondary created
7	📞 Only phone provided	Works correctly, primary or secondary created
8	🔁 Duplicate exact data	Does not create new contact; returns existing primary and secondary details
9	🆕 New email + existing primary phone	Adds new email as secondary
10	🆕 New phone + existing primary email	Adds new phone as secondary
⚙️ Setup Locally

Clone the repo:

git clone https://github.com/<your-username>/identity-reconciliation.git
cd identity-reconciliation

Install dependencies:

npm install

Create .env file based on .env.example:

DATABASE_URL=postgresql://username:password@host:port/db
PORT=3000

Run Prisma migration:

npx prisma migrate dev --name init

Start the server:

npm run build
npm start

Test endpoint at:

http://localhost:3000/identify
🗂️ Folder Structure
identity-reconciliation/
├─ src/
│  ├─ app.ts
│  ├─ server.ts
│  ├─ routes/
│  │  └─ identify.route.ts
│  ├─ controllers/
│  │  └─ identify.controller.ts
│  └─ services/
│     └─ identify.services.ts
├─ prisma/
│  └─ schema.prisma
├─ .env.example
├─ package.json
├─ tsconfig.json
└─ README.md
💻 Tech Stack

Node.js + TypeScript

Express for API routing

Prisma ORM for database abstraction

PostgreSQL as database

Render.com for free hosting

🔎 Notes

This project focuses on backend correctness and identity reconciliation.

Frontend/UI is minimal by design; the API returns JSON responses.

Fully tested across all edge cases (see Test Scenarios table).

