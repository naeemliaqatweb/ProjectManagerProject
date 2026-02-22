This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.








🛠 Tech Stack (The "MERN+" Stack)
Frontend: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Shadcn/ui, Framer Motion (for smooth UI).

Backend: NestJS (Modular Architecture), Socket.io (Real-time), Passport.js (JWT Strategy).

Database: MongoDB Atlas with Prisma ORM.

AI Integration: OpenAI GPT-4 API (Structured JSON outputs).

Security: speakeasy or otplib (for TOTP/2FA), qrcode (for QR generation).

🚀 Key Features to Highlight
1. AI Task Architect (Sidebar Feature)
Instead of manual entry, users describe a task in natural language.

Functionality: AI analyzes raw text to generate a Title, Description, and Priority.

Intelligence: The AI suggests an existing Label (Bug, Feature, etc.) based on your project's specific database history.

UX: A "Review & Edit" screen allows users to select a destination Project/Column before the task is committed to MongoDB.

2. Enterprise-Grade Security (2FA)
Enrollment: Uses otplib to generate a secret key and qrcode to render a scanable code for apps like Google Authenticator.

Verification: A 6-digit TOTP (Time-based One-Time Password) is required during login if 2FA is enabled.

Implementation: Securely stores the 2FA secret in MongoDB (encrypted) and uses a custom NestJS Guard to protect routes.

3. Real-Time Collaborative Engine
Live Updates: Socket.io ensures that if one user moves a task, it slides across the screens of all other project members instantly.

Presence: Visual indicators showing which teammates are currently online in the project board.

📝 Portfolio Description (Copy & Paste)
Title: ZenTask AI – Enterprise Project Management Platform

Overview: A high-performance, real-time Project Management Tool built to solve complex workflows with AI-driven automation and robust security. This platform allows teams to collaborate seamlessly while leveraging LLMs to reduce administrative overhead.

My Role & Contributions:

AI-Driven Onboarding: Developed an "AI Architect" sidebar using OpenAI API that converts unstructured user thoughts into categorized, labeled, and assigned tasks with 95% accuracy.

Security First: Engineered a 2FA (Two-Factor Authentication) system from scratch, integrating QR code generation and TOTP verification to ensure user data protection.

Real-Time Architecture: Scaled a NestJS WebSocket gateway to handle real-time Kanban board updates and collaborative "User Presence" tracking.

Cloud Data Management: Optimized complex relational queries in MongoDB Atlas using Prisma, ensuring sub-second response times for project boards with hundreds of tasks.