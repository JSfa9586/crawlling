
import json
import os
import time
import calendar
import sys
import subprocess
from datetime import datetime
from collect_contracts import collect_contracts, QuotaExceededError

STATE_FILE = "collection_state.json"
INIT_YEAR = 2025
INIT_MONTH = 11
END_YEAR = 2005

def load_state():
    """Load collection state from JSON file."""
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    else:
        # Initialize state
        return {
            "current_year": INIT_YEAR,
            "current_month": INIT_MONTH,
            "status": "READY",
            "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

def save_state(state):
    """Save collection state to JSON file."""
    state["last_updated"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=4)
    print(f"State saved: {state}")

def get_prev_month(year, month):
    """Calculate the previous month (backwards in time)."""
    month -= 1
    if month == 0:
        year -= 1
        month = 12
    return year, month

def disable_scheduler():
    """Disable the Windows Scheduled Task when collection is complete."""
    task_name = "G2B_Auto_Collector"
    print(f"Attempting to disable scheduled task: {task_name}")
    try:
        # Schtasks command to disable the task
        subprocess.run(["schtasks", "/Change", "/TN", task_name, "/DISABLE"], check=True)
        print(f"Successfully disabled task: {task_name}")
    except Exception as e:
        print(f"Failed to disable task: {e}")

def main():
    print(f"=== Auto Collector Started at {datetime.now()} ===")
    
    state = load_state()
    year = state["current_year"]
    month = state["current_month"]
    
    # If already finished
    if year < END_YEAR:
        print("Collection completed down to target year.")
        disable_scheduler() # Check just in case it runs again
        return

    print(f"Resuming from: {year}-{month:02d}")

    # Maximum attempt to collect continuous months until quota hit
    while year >= END_YEAR:
        # Calculate date range for the month
        _, last_day = calendar.monthrange(year, month)
        start_date_str = f"{year}-{month:02d}-01"
        end_date_str = f"{year}-{month:02d}-{last_day}"
        
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
        end_date = datetime.strptime(end_date_str, "%Y-%m-%d")

        print(f"\n>> Collecting: {start_date_str} ~ {end_date_str}")
        
        try:
            # Run collection
            collect_contracts(start_date, end_date)
            
            # If successful, move to previous month
            year, month = get_prev_month(year, month)
            
            # Update state immediately
            state["current_year"] = year
            state["current_month"] = month
            state["status"] = "IN_PROGRESS"
            save_state(state)
            
            # Check completion inside loop
            if year < END_YEAR:
                print("Collection All Completed!")
                disable_scheduler()
                break
            
            # Brief pause between months
            time.sleep(2)
            
        except QuotaExceededError:
            print(f"!!! API Quota Exceeded at {year}-{month:02d} !!!")
            print("Stopping execution. Will resume tomorrow.")
            
            # Save state (stay on current month to retry next time)
            state["status"] = "STOPPED_QUOTA"
            save_state(state)
            break
            
        except Exception as e:
            print(f"!!! Critical Error at {year}-{month:02d}: {e}")
            # Save state to retry this month next time
            state["status"] = "ERROR"
            save_state(state)
            # Exit on critical error to avoid infinite loops or data corruption
            sys.exit(1)

    print("=== Auto Collector Finished ===")

if __name__ == "__main__":
    main()
