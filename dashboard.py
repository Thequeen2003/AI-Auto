import streamlit as st
import pandas as pd
from datetime import date, timedelta
from email_engine import ProductionRules, DataLoader, EmailGenerator

# Page Config
st.set_page_config(page_title="Production Milestone Dashboard", page_icon="🏭", layout="wide")

# Title and Intro
st.title("🏭 Automated Production Milestone Dashboard")
st.markdown("Monitor production timelines, track overdue milestones, and preview automated emails.")

# Sidebar - Simulation Controls
st.sidebar.header("⚙️ Simulation Settings")
simulation_date = st.sidebar.date_input("Simulate Today's Date", value=date(2026, 4, 1))

# Load Data
@st.cache_data
def load_production_data():
    loader = DataLoader('production_data.csv')
    data = loader.load_data()
    return pd.DataFrame(data)

df = load_production_data()

# Processing Logic
def get_milestone_status(row, current_date):
    ship_date_str = row['Ship Date']
    milestones = ProductionRules.calculate_milestones(ship_date_str)
    
    status_list = []
    
    for milestone, due_date in milestones.items():
        if milestone == 'Ship Date':
            continue
            
        days_remaining = (due_date - current_date).days
        status = "On Track"
        color = "green"
        
        if days_remaining < 0:
            status = f"Overdue by {abs(days_remaining)} days"
            color = "red"
        elif days_remaining <= 7:
            status = f"Due in {days_remaining} days"
            color = "orange"
        elif days_remaining <= 14:
            status = f"Due in {days_remaining} days"
            color = "yellow"
            
        status_list.append({
            "Factory": row['Factory'],
            "PO": row['PO'],
            "Milestone": milestone,
            "Due Date": due_date,
            "Days Remaining": days_remaining,
            "Status": status,
            "Color": color
        })
    return status_list

# Generate Status Data
all_statuses = []
for index, row in df.iterrows():
    all_statuses.extend(get_milestone_status(row, simulation_date))

status_df = pd.DataFrame(all_statuses)

# Metrics
col1, col2, col3 = st.columns(3)
overdue_count = len(status_df[status_df['Color'] == 'red'])
upcoming_count = len(status_df[status_df['Color'].isin(['orange', 'yellow'])])
total_active_pos = len(df)

col1.metric("🔴 Overdue Milestones", overdue_count)
col2.metric("🟡 Upcoming (14 days)", upcoming_count)
col3.metric("📋 Active POs", total_active_pos)

# Tabs
tab1, tab2, tab3 = st.tabs(["📊 Dashboard", "✉️ Email Preview", "📄 Raw Data"])

with tab1:
    st.subheader("Milestone Status Board")
    
    # Filter options
    filter_status = st.multiselect("Filter by Status", ["Overdue", "Upcoming", "On Track"], default=["Overdue", "Upcoming"])
    
    start_df = status_df.copy()
    
    # Map colors to filterable text
    def map_color_to_status(c):
        if c == 'red': return 'Overdue'
        if c in ['orange', 'yellow']: return 'Upcoming'
        return 'On Track'
    
    start_df['StatusGroup'] = start_df['Color'].apply(map_color_to_status)
    filtered_df = start_df[start_df['StatusGroup'].isin(filter_status)]
    
    # Display colorful dataframe
    def highlight_rows(row):
        color = row['Color']
        if color == 'red':
            return ['background-color: #ffcccc'] * len(row)
        elif color == 'orange':
            return ['background-color: #ffe5cc'] * len(row)
        elif color == 'yellow':
            return ['background-color: #ffffcc'] * len(row)
        else:
            return [''] * len(row)

    st.dataframe(
        filtered_df[['Factory', 'PO', 'Milestone', 'Due Date', 'Status']],
        use_container_width=True
    )

with tab2:
    st.subheader("Generated Email Previews")
    st.markdown("Emails that would be sent based on the **simulation date**.")
    
    for index, item in filtered_df.iterrows():
        # Only show emails for overdue or upcoming
        if item['StatusGroup'] in ['Overdue', 'Upcoming']:
            with st.expander(f"{'🔴' if item['Color'] == 'red' else '🟡'} {item['Factory']} - {item['PO']} - {item['Milestone']}"):
                email_body = EmailGenerator.generate_email(
                    item['Factory'], 
                    item['PO'], 
                    item['Milestone'], 
                    item['Due Date'], 
                    item['Days Remaining']
                )
                st.code(email_body, language="text")

with tab3:
    st.subheader("Master Production Schedule")
    st.dataframe(df)

