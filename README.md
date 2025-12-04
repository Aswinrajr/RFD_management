# AI-Powered RFP Management System

A full-stack web application that streamlines the Request for Proposal (RFP) procurement workflow using AI. The system helps procurement managers create RFPs from natural language, manage vendors, send RFPs via email, automatically parse vendor responses, and compare proposals with AI-powered recommendations.



## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [AI Integration](#ai-integration)
- [Email Setup](#email-setup)
- [Design Decisions](#design-decisions)
- [Assumptions](#assumptions)
- [Known Limitations](#known-limitations)
- [Future Improvements](#future-improvements)
- [AI Tools Usage](#ai-tools-usage)

---

## ✨ Features

### 1. **AI-Powered RFP Creation**
- Convert natural language procurement requirements into structured RFPs
- Automatically extract: title, description, budget, requirements, delivery timeline, payment terms, and warranty
- Preview and edit structured RFP before sending

### 2. **Vendor Management**
- Add, edit, and delete vendors
- Store vendor information: name, email, company, phone, address, specialization
- Track vendor status (active/inactive)

### 3. **Email Integration**
- Send RFPs to selected vendors via email with professional HTML formatting
- Automatic email receiving and parsing using IMAP
- Real-time email listener for incoming vendor responses

### 4. **AI-Powered Proposal Parsing**
- Automatically parse vendor response emails into structured proposals
- Extract pricing, delivery timeline, payment terms, warranty, and compliance details
- Calculate compliance scores based on RFP requirements

### 5. **Proposal Comparison & Recommendations**
- AI-powered comparison of multiple vendor proposals
- Overall vendor scores with detailed breakdowns (price, timeline, compliance)
- Pros and cons analysis for each vendor
- Key findings and risk factors
- Detailed pricing breakdown tables

---

## 🛠 Tech Stack

### Frontend
- **React** (v18.2.0) - UI framework
- **React Router** (v6.20.0) - Client-side routing
- **Axios** (v1.6.2) - HTTP client
- **React Toastify** (v9.1.3) - Toast notifications
- **CSS3** - Styling with modern gradients and animations

### Backend
- **Node.js** - Runtime environment
- **Express** (v4.18.2) - Web framework
- **MongoDB** with **Mongoose** (v8.0.0) - Database
- **Google Gemini API** (FREE!) - AI integration
- **Nodemailer** (v6.9.7) - Email sending (SMTP)
- **IMAP** (v0.8.19) + **Mailparser** (v3.6.5) - Email receiving and parsing

### Key Libraries
- **dotenv** - Environment configuration
- **cors** - Cross-origin resource sharing
- **uuid** - Unique ID generation
- **pdf-parse** - PDF attachment parsing (optional)

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Google Gemini API Key (FREE!)** - [Get one here](https://makersuite.google.com/app/apikey) - No credit card required!
- **Email Account** (Gmail recommended with App Password enabled)

---

## 🚀 Project Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd rfp-management-system
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

---

## ⚙️ Configuration

### Backend Configuration

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your credentials:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/rfp-management

# Google Gemini Configuration (FREE - No credit card required!)
GEMINI_API_KEY=your-gemini-api-key-here

# Email Configuration (SMTP for sending)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password-here

# Email Configuration (IMAP for receiving)
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your-email@gmail.com
IMAP_PASSWORD=your-app-password-here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Frontend Configuration (Optional)

Create a `.env` file in the `frontend` directory if you need to customize the API URL:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🏃 Running the Application

### Option 1: Run Backend and Frontend Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
Frontend will run on `http://localhost:3000`

### Option 2: Production Build

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the build folder using a static server
```

---

## 📧 Email Setup

### Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication**
   - Go to Google Account Settings
   - Security → 2-Step Verification → Turn On

2. **Generate App Password**
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password

3. **Use in .env file**
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-16-char-app-password
   IMAP_USER=your-email@gmail.com
   IMAP_PASSWORD=your-16-char-app-password
   ```

4. **Enable IMAP in Gmail**
   - Settings → See all settings → Forwarding and POP/IMAP
   - Enable IMAP → Save Changes

### Testing Email Functionality

1. Add a vendor with a real email address
2. Create an RFP and send it to the vendor
3. Reply to the RFP email as the vendor
4. The system will automatically parse the response

