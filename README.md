# My Security: Verify Your Identity Instantly

**My Security** is a digital trust platform designed to eliminate scams and build confidence in digital interactions. It allows users to verify each other's identity in real-time using government-issued IDs (MyKad) and AI-powered facial recognition.

## The Problem
In an era of deepfakes and sophisticated online scams, it's becoming impossible to know if the person you're talking to is who they claim to be. Whether it's a marketplace transaction, a dating profile, or a freelance contract, blind trust can lead to financial loss and safety risks.

## The Solution
My Security creates a secure, verified bridge between two parties.
1.  **Verified Digital ID**: Users create an immutable digital identity by scanning their physical MyKad and performing a liveness check.
2.  **Consent-Based Sharing**: Your data is yours. You only share your verified profile when you explicitly approve a request.
3.  **Real-Time Verification**: A "Verifier" enters a unique code provided by a "Prover" to instantly view their official name, photo, and safety status.

## Key Features

### 🛡️ Verified Digital Profile
- **Official Data Source**: Pulls data directly from a secure National Registry (mocked for this demo).
- **Liveness Detection**: Ensures the person creating the account is physically present and matches the ID photo.
- **Safety Status**: Instantly flags potential risks (e.g., "Safe", "Caution", "Unsafe") based on criminal records or past reports.

### 🔒 Privacy-First Architecture
- No public directory. You cannot search for users.
- Verification is peer-to-peer via temporary codes.
- Users can revoke access or deny requests at any time.

### ⚡ Seamless UX
- **No Passwords**: Identity is the key.
- **Instant Sync**: WebSocket-like updates ensure that as soon as a request is approved, the data appears on the verifier's screen.
- **Responsive Design**: Works on mobile and desktop for on-the-go verification.

## How It Works

### 1. Create Identity
Users scan their MyKad (simulated) and their face. The system validates the ID format and matches the face to the ID photo.

### 2. Prover Generates Code
Once verified, the user (Prover) gets a dynamic 6-digit code (e.g., `123-456`).

### 3. Verifier Checks Identity
The other party (Verifier) enters this code into My Security.

### 4. Approval & Result
The Prover receives a notification: *"Someone wants to verify your identity."*
If they click **Approve**, the Verifier sees the Prover's verified photo, name, occupation, and company.

## 🧪 Judge's Demo Data
To test the application, use these mock user profiles. Enter the MyKad number when prompted in the registration flow.

| Profile Type | Name | MyKad Number | Status |
| :--- | :--- | :--- | :--- |
| **Standard User** | Ali bin Ahmad | `990101-14-5678` | ✅ Safe |
| **Senior Citizen** | Siti binti Osman | `550505-10-1234` | ✅ Safe |
| **Scammer** | John Doe | `909090-90-9090` | ⚠️ Unsafe |

## Tech Stack
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: Tailwind CSS & Vanilla CSS for premium aesthetics
- **Icons**: Lucide React
- **State Management**: React Context API
- **Face Detection**: Tensorflow.js

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Run Development Server**:
    ```bash
    npm run dev
    ```
3.  **Open**: `http://localhost:9002`

---
*Built for NexG GodamLah 2.0 Smart ID Hackathon*
