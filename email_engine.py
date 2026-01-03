import csv
import datetime
from datetime import date, timedelta
from typing import List, Dict

class ProductionRules:
    # Lead times (days before Ship Date)
    LEAD_TIMES = {
        'Tech Pack': 90,
        'Strike-off': 75,
        'Lab Dip': 60,
        'Sample Approval': 45
    }

    @staticmethod
    def calculate_milestones(ship_date_str: str) -> Dict[str, date]:
        try:
            ship_date = datetime.datetime.strptime(ship_date_str, '%Y-%m-%d').date()
        except ValueError:
            return {}
        
        milestones = {}
        for milestone, days in ProductionRules.LEAD_TIMES.items():
            due_date = ship_date - timedelta(days=days)
            milestones[milestone] = due_date
        
        milestones['Ship Date'] = ship_date
        return milestones

class DataLoader:
    def __init__(self, filepath: str):
        self.filepath = filepath

    def load_data(self) -> List[Dict]:
        data = []
        try:
            with open(self.filepath, mode='r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    data.append(row)
        except FileNotFoundError:
            print(f"Error: File not found at {self.filepath}")
        return data

class EmailGenerator:
    @staticmethod
    def generate_email(factory: str, po: str, milestone: str, due_date: date, days_remaining: int):
        status_color = "🔴" if days_remaining < 0 else "🟡" if days_remaining <= 7 else "🟢"
        
        subject = f"{status_color} ACTION REQUIRED: {milestone} Due for PO {po} - {factory}"
        
        urgency_msg = ""
        if days_remaining < 0:
            urgency_msg = f"This milestone is OVERDUE by {abs(days_remaining)} days. Please expedite immediately."
        elif days_remaining == 0:
            urgency_msg = "This milestone is due TODAY."
        else:
            urgency_msg = f"This milestone is due in {days_remaining} days."

        body = f"""
Subject: {subject}

Dear {factory} Team,

This is an automated reminder regarding the production schedule for PO #{po}.

Milestone: {milestone}
Due Date: {due_date.strftime('%Y-%m-%d')}
Status: {urgency_msg}

Please confirm when this step will be completed to avoid delays in the final Ship Date ({due_date + timedelta(days=ProductionRules.LEAD_TIMES.get(milestone, 0))}).

Thank you,
Production Team
-----------------------------------------------------------
"""
        return body

def run_demo():
    print("Initializing Automated Production Milestone Email Engine...\n")
    
    # Setup
    csv_path = 'production_data.csv'
    loader = DataLoader(csv_path)
    
    # Load Data
    print(f"Loading data from {csv_path}...")
    orders = loader.load_data()
    print(f"Loaded {len(orders)} orders.\n")
    
    # Simulation Date: Let's pretend today is April 1st, 2026 to trigger various alerts
    # PO-1001 Ship: June 1. Tech Pack (90d) due March 3 (OVERDUE). Sample (45d) due April 17 (Coming up).
    # PO-3001 Ship: March 1. Should be completely overdue/shipped.
    # PO-3002 Ship: April 15. Sample Approval (45d) due March 1 (OVERDUE).
    
    today = date(2026, 4, 1)
    print(f"--- SIMULATION DATE: {today} ---\n")

    emails_sent = 0
    
    for order in orders:
        factory = order['Factory']
        po = order['PO']
        ship_date_str = order['Ship Date']
        
        milestones = ProductionRules.calculate_milestones(ship_date_str)
        
        for milestone_name, due_date in milestones.items():
            if milestone_name == 'Ship Date':
                continue
                
            days_remaining = (due_date - today).days
            
            # Logic: Send email if overdue OR due within next 14 days
            if days_remaining < 0 or (0 <= days_remaining <= 14):
                email_content = EmailGenerator.generate_email(
                    factory, po, milestone_name, due_date, days_remaining
                )
                print(email_content)
                emails_sent += 1

    print(f"\nTotal Emails Generated: {emails_sent}")

if __name__ == "__main__":
    run_demo()
