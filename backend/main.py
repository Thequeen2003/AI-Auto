from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
import csv
import datetime
import random
import asyncio
from datetime import date, timedelta
from pydantic import BaseModel

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Reuse existing logic adapted for API
class ProductionRules:
    LEAD_TIMES = {
        'Tech Pack': 90,
        'Strike-off': 75,
        'Lab Dip': 60,
        'Sample Approval': 45
    }

    @staticmethod
    def calculate_milestones(ship_date_str: str) -> Dict[str, str]:
        try:
            ship_date = datetime.datetime.strptime(ship_date_str, '%Y-%m-%d').date()
        except ValueError:
            return {}
        
        milestones = {}
        for milestone, days in ProductionRules.LEAD_TIMES.items():
            due_date = ship_date - timedelta(days=days)
            milestones[milestone] = due_date.strftime('%Y-%m-%d')
        
        milestones['Ship Date'] = ship_date.strftime('%Y-%m-%d')
        return milestones

@app.get("/api/dashboard")
def get_dashboard_data(simulation_date: str = "2026-04-01"):
    # Load data from CSV (in a real app, from DB)
    data = []
    try:
        with open('../production_data.csv', mode='r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                data.append(row)
    except FileNotFoundError:
        return {"error": "production_data.csv not found"}

    processed_data = []
    try:
        sim_date = datetime.datetime.strptime(simulation_date, '%Y-%m-%d').date()
    except ValueError:
        sim_date = date(2026, 4, 1)

    for row in data:
        milestones = ProductionRules.calculate_milestones(row['Ship Date'])
        
        # Calculate status for each milestone
        milestone_statuses = []
        for name, date_str in milestones.items():
            if name == 'Ship Date':
                continue
            
            due = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
            days_remaining = (due - sim_date).days
            
            status = "On Track"
            color = "green"
            if days_remaining < 0:
                status = f"Overdue"
                color = "red"
            elif days_remaining <= 14:
                status = f"Due Soon"
                color = "yellow"
                
            milestone_statuses.append({
                "name": name,
                "date": date_str,
                "days_remaining": days_remaining,
                "status": status,
                "color": color
            })

        processed_data.append({
            "factory": row['Factory'],
            "po": row['PO'],
            "sku": row['SKU'],
            "ship_date": row['Ship Date'],
            "milestones": milestone_statuses
        })

    return processed_data

@app.post("/api/parse-invoice")
async def parse_invoice(file: UploadFile = File(...)):
    await asyncio.sleep(2) # Simulate processing
    
    filename = file.filename.lower()
    
    # Mock Data Extraction
    # In a real system, this comes from OCR text analysis
    invoice_total = 12500.00
    expected_total = 12000.00 # Simulated PO total
    
    supplier_risk = "LOW"
    if "risky" in filename:
        supplier_risk = "HIGH"
    
    confidence = 0.98
    if "blur" in filename or "scan" in filename:
        confidence = 0.82
        
    discrepancy_amount = invoice_total - expected_total
    mismatch_percent = (discrepancy_amount / expected_total) * 100
    
    # --- AI AGENT DECISION LOGIC ---
    action = "APPROVE_INVOICE"
    reason = "Matches PO within acceptable limits."
    
    if mismatch_percent > 5:
        action = "BLOCK_PAYMENT"
        reason = f"Critical discrepancy of {mismatch_percent:.2f}% detected (Threshold: 5%)."
    elif mismatch_percent >= 1:
        action = "FLAG_DISCREPANCY"
        reason = f"Minor discrepancy of {mismatch_percent:.2f}% detected. Review recommended."
    elif confidence < 0.85:
        action = "REQUEST_HUMAN_REVIEW"
        reason = f"OCR Confidence ({confidence*100:.0f}%) is below threshold (85%)."
    elif supplier_risk == "HIGH":
        action = "ESCALATE_TO_FINANCE"
        reason = "Supplier flagged as High Risk in vendor database."
        
    # Mock Extracted Data for UI
    extracted_data = {
        "invoice_number": f"INV-{random.randint(10000, 99999)}",
        "date": date.today().strftime("%Y-%m-%d"),
        "total_amount": f"${invoice_total:,.2f}",
        "expected_amount": f"${expected_total:,.2f}",
        "line_items": [
            {"sku": "SKU-A123", "qty": 1000, "price": 5.50},
            {"sku": "SKU-B456", "qty": 500, "price": 12.00},
        ]
    }
    
    # Return STRUCTURED DECISION OBJECT
    return {
        "decision": {
            "action": action,
            "risk_level": "CRITICAL" if action == "BLOCK_PAYMENT" else "HIGH" if supplier_risk == "HIGH" else "MEDIUM" if action == "FLAG_DISCREPANCY" else "LOW",
            "reasoning": reason,
            "confidence": confidence
        },
        "extracted": extracted_data
    }

@app.get("/api/logistics")
def get_logistics_data():
    # Mock data for shipments
    # In reality, this would query FedEx/UPS APIs or a production DB
    
    shipments = [
        {
            "id": "SH-2026-001",
            "po": "PO-1001",
            "carrier": "Maersk",
            "tracking_number": "MSKU9832742",
            "status": "In Transit",
            "location": "Pacific Ocean",
            "eta": "2026-05-15",
            "progress": 65
        },
        {
            "id": "SH-2026-002",
            "po": "PO-3001",
            "carrier": "DHL Air",
            "tracking_number": "8473625190",
            "status": "Delivered",
            "location": "Warehouse A",
            "eta": "2026-03-05",
            "progress": 100
        },
        {
            "id": "SH-2026-003",
            "po": "PO-2002",
            "carrier": "MSC",
            "tracking_number": "MSCU1234567",
            "status": "Pending Pickup",
            "location": "Factory (Vietnam)",
            "eta": "2026-07-20",
            "progress": 10
        }
    ]
    return shipments


class MilestoneCheckRequest(BaseModel):
    factory_name: str
    po_number: str
    sku: str = ""
    milestone_name: str
    milestone_due_date: str  # YYYY-MM-DD
    current_date: str        # YYYY-MM-DD
    recipient_email: str
    factory_region: str = "China"

@app.post("/api/check-milestone")
def check_milestone(request: MilestoneCheckRequest):
    due_date = datetime.datetime.strptime(request.milestone_due_date, "%Y-%m-%d").date()
    curr_date = datetime.datetime.strptime(request.current_date, "%Y-%m-%d").date()
    
    days_diff = (due_date - curr_date).days
    
    # Defaults
    status = "ON_TRACK"
    risk_level = "LOW"
    action = "NO_ACTION"
    send_email = False
    subject = ""
    body = ""
    internal_flags = []

    # Logic Engine
    if days_diff < 0:
        status = "OVERDUE"
        risk_level = "HIGH"
        action = "SEND_ESCALATION_EMAIL"
        send_email = True
        internal_flags = ["FLAG_PO"]
        
        subject = f"URGENT: {request.milestone_name} OVERDUE - PO {request.po_number}"
        body = f"""Factory: {request.factory_name}
PO: {request.po_number}
Milestone: {request.milestone_name}
Due Date: {request.milestone_due_date}

This milestone is now OVERDUE. This poses a HIGH RISK to the shipment timeline.
IMMEDIATE ACTION REQUIRED: Provide recovery plan and revised completion date."""

    elif days_diff <= 14:
        status = "DUE_SOON"
        risk_level = "MEDIUM"
        action = "SEND_REMINDER_EMAIL"
        send_email = True
        
        subject = f"REMINDER: {request.milestone_name} Due Soon - PO {request.po_number}"
        body = f"""Factory: {request.factory_name}
PO: {request.po_number}
Milestone: {request.milestone_name}
Due Date: {request.milestone_due_date}

This milestone is due within 14 days.
Please confirm you are on track to meet this deadline."""
        
    # Construct Response
    if action == "NO_ACTION":
        return {
            "status": status,
            "risk_level": risk_level,
            "action": action,
            "send_email": False,
            "internal_flags": []
        }
    
    return {
        "status": status,
        "risk_level": risk_level,
        "action": action,
        "send_email": send_email,
        "recipient": request.recipient_email,
        "subject": subject,
        "body": body,
        "internal_flags": internal_flags
    }


