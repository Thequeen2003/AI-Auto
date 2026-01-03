import csv
import datetime
from datetime import timedelta, date
import time

# --- Configuration ---
TODAY = date(2026, 4, 1) # Specific simulation date for demo
LEAD_TIMES = {
    'Tech Pack': 90,
    'Strike-off': 75,
    'Lab Dip': 60,
    'Sample Approval': 45
}

class ProductionEngine:
    def __init__(self, data_file):
        self.data_file = data_file
        self.logs = []

    def load_data(self):
        data = []
        try:
            with open(self.data_file, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    data.append(row)
        except FileNotFoundError:
            print(f"Error: {self.data_file} not found.")
        return data

    def calculate_milestone_date(self, ship_date_str, milestone):
        try:
            ship_date = datetime.datetime.strptime(ship_date_str, '%Y-%m-%d').date()
            days = LEAD_TIMES.get(milestone, 0)
            return ship_date - timedelta(days=days)
        except ValueError:
            return None

    def generate_email(self, action, factory, po, milestone, due_date):
        if action == "ESCALATE":
            subject = f"URGENT: {milestone} Overdue – PO {po}"
            body = f"""Hi {factory},

This is a reminder that the {milestone} for PO {po} was due on {due_date} and is now overdue.

Please confirm submission as soon as possible to avoid shipment delays.

Thank you,
Production Team"""
        elif action == "REMIND":
            subject = f"Reminder: {milestone} Due Soon – PO {po}"
            body = f"""Hi {factory},

This is a reminder that the {milestone} for PO {po} is due on {due_date}.

Please ensure this is on track.

Thank you,
Production Team"""
        else:
            return None, None
        return subject, body

    def run_daily_check(self):
        print(f"--- Production OS: Daily Run ({TODAY}) ---\n")
        data = self.load_data()
        
        actions_taken = 0
        
        for row in data:
            factory = row['Factory']
            po = row['PO']
            ship_date = row['Ship Date']
            
            # Check each milestone
            for milestone in LEAD_TIMES:
                due_date = self.calculate_milestone_date(ship_date, milestone)
                if not due_date: continue
                
                days_remaining = (due_date - TODAY).days
                
                status = "ON TRACK"
                action = "NO_ACTION"
                
                if days_remaining < 0:
                    status = "OVERDUE"
                    action = "ESCALATE"
                elif 0 <= days_remaining <= 14:
                    status = "DUE SOON"
                    action = "REMIND"
                
                # Decision Moment
                if action != "NO_ACTION":
                    subject, body = self.generate_email(action, factory, po, milestone, due_date)
                    
                    # Log & Simulate Send
                    print(f"[{status}] PO {po} | {milestone} Due: {due_date}")
                    print(f"   -> Action: Sending {action} email to {factory}...")
                    # print(f"   -> Subject: {subject}")  # Uncomment for verbose detail
                    print("   -> Email sent successfully.\n")
                    
                    self.logs.append({
                        "po": po,
                        "status": status,
                        "action": action,
                        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    })
                    actions_taken += 1
        
        print(f"--- Run Complete ---")
        print(f"Processed {len(data)} orders.")
        print(f"Emails sent: {actions_taken}")
        print("System returning to sleep mode.")

if __name__ == "__main__":
    engine = ProductionEngine("production_data.csv")
    engine.run_daily_check()
