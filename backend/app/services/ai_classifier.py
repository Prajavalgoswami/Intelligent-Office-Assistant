import os
from google import genai

# Create Gemini client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

ALLOWED = ["Work", "Urgent", "Finance", "Notifications"]


def classify_email(subject: str, body: str) -> str:

    text = (subject + " " + body).lower()

    # =============================
    # STEP 1 — URGENT PRECHECK
    # =============================

    urgent_keywords = {
        "urgent": 5,
        "immediate": 4,
        "asap": 5,
        "deadline": 4,
        "today": 3,
        "now": 3,
        "critical": 5,
        "action required": 5
    }

    urgent_score = sum(
        weight for word, weight in urgent_keywords.items() if word in text
    )

    if urgent_score >= 5:
        return "Urgent"

    # =============================
    # STEP 2 — WORK PRECHECK
    # =============================

    work_keywords = {
        "meeting": 3,
        "project": 3,
        "client": 3,
        "task": 3,
        "assignment": 3,
        "schedule": 3,
        "presentation": 3,
        "proposal": 3
    }

    work_score = sum(
        weight for word, weight in work_keywords.items() if word in text
    )

    if work_score >= 4:
        return "Work"

    # =============================
    # STEP 3 — FINANCE PRECHECK
    # =============================

    finance_keywords = {
        "invoice": 5,
        "payment": 5,
        "billing": 4,
        "salary": 4,
        "transaction": 4,
        "investment": 3,
        "tax": 4,
        "reimbursement": 4,
        "bank": 4,
        "amount due": 5
    }

    finance_score = sum(
        weight for word, weight in finance_keywords.items() if word in text
    )

    if finance_score >= 5:
        return "Finance"

    # =============================
    # STEP 4 — Gemini Classification
    # =============================

    prompt = f"""
You are a financial-risk aware email classification engine.

Your decision directly affects business revenue.
Incorrect classification of financial emails may cause financial loss.

You MUST carefully analyze intent, context, and meaning.

Choose exactly ONE category from:

Finance
Work
Urgent
Notifications

DETAILED DEFINITIONS:

Finance:
Any email involving:
- Payment requests
- Invoices
- Billing
- Salary
- Investment proposals
- Fund transfers
- Bank details
- Reimbursements
- Financial approvals
- Budget discussions
- Money owed
- Money received

If money, payment, or financial obligation is mentioned,
you MUST classify as Finance.

Urgent:
Time-sensitive requests requiring immediate action,
deadlines, critical alerts.

Work:
Project discussions, meetings, collaboration,
client communication without financial risk.

Notifications:
Automated system emails, OTPs, newsletters,
subscription alerts, non-actionable updates.

Return ONLY one word.
No explanation.
No punctuation.

Email Subject:
{subject}

Email Body:
{body[:1500]}
"""

    try:
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt
        )

        raw = response.text.strip()

        # Clean response
        raw = raw.replace(".", "")
        raw = raw.replace("The category is", "")
        raw = raw.strip()

        # Extract first word only
        category = raw.split()[0].title()

        if category in ALLOWED:
            return category

        lower_raw = raw.lower()

        if "fin" in lower_raw:
            return "Finance"
        if "urgent" in lower_raw:
            return "Urgent"
        if "work" in lower_raw:
            return "Work"

        return "Notifications"

    except Exception as e:
        print("Gemini error:", e)
        return "Notifications"
