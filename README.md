# Production OS (Apple-Style)

A minimalist, high-performance Production Operating System designed for supply chain automation.

## Features
- **Production Monitoring (Calm UI)**: Daily milestone tracking with automated risk classification.
- **AI Invoice Parser**: Drag-and-drop PDF analysis using discrepancy logic.
- **Global Logistics**: Real-time shipment tracking with carrier integration.
- **Automated Email Engine**: Background daily loops for Overdue/Reminder communications.

## Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion.
- **Backend**: FastAPI (Python), Uvicorn.
- **Automation**: Python-based Cron Job (`production_core.py`).

## Getting Started

### Prerequisites
- Node.js > 18
- Python > 3.9

### Installation

1. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install fastapi uvicorn python-multipart
   python3 -m uvicorn main:app --reload
   ```

3. **Run Automation Engine (Manual Trigger)**
   ```bash
   python3 production_core.py
   ```

## Deployment
- **Frontend**: Ready for Vercel import (`/frontend`).
- **Backend**: Ready for Railway/Render import (`/backend`).

## License
Proprietary.

loom link:
https://www.loom.com/share/9b18c9bf3bcb496fa456f4a160e9adfc
loom link 2:
https://www.loom.com/share/bf1f72f9fbbc444f9783210a04c02199

