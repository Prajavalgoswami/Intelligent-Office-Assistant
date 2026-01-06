# Intelligent Office Assistant (IOA)
## API Contract – Version 1.0

---

## Overview

The Intelligent Office Assistant (IOA) is a multi-tenant, AI-powered office productivity platform that integrates authentication, email intelligence, task automation, collaboration, document intelligence (RAG), and analytics.

This document defines the REST API contract used between frontend and backend services.

---

## Base Configuration

Base URL:

Authentication:
- Google OAuth 2.0
- Backend-issued JWT
- Role-Based Access Control (RBAC)

Required Headers:
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
1. Authentication APIs
1.1 Google Login

POST /auth/google-login

Request:

{
  "id_token": "google_id_token"
}


Response:

{
  "access_token": "jwt_token",
  "user": {
    "id": "u01",
    "name": "Kaviraj",
    "email": "kaviraj@company.com",
    "company_id": "c01",
    "department": "Development",
    "roles": ["Employee"]
  }
}

1.2 Logout

POST /auth/logout

2. Company Management APIs (Super Admin)
2.1 Create Company

POST /companies

{
  "company_name": "TechNova Pvt Ltd",
  "domain": "technova.com"
}

2.2 List Companies

GET /companies

3. Department APIs
3.1 Create Department

POST /departments

{
  "company_id": "c01",
  "department_name": "HR"
}


Automatically creates a department chat group.

3.2 List Departments

GET /departments?company_id=c01

4. User APIs
4.1 Get Logged-in User

GET /users/me

4.2 List Users (Admin)

GET /users?department_id=d01

5. Role & Permission APIs (RBAC)
5.1 Create Role

POST /roles

{
  "company_id": "c01",
  "role_name": "Manager"
}

5.2 Assign Role to User

POST /roles/assign

{
  "user_id": "u01",
  "role_id": "r01"
}

5.3 Create Permission

POST /permissions

{
  "permission_name": "create_task"
}

5.4 Assign Permission to Role

POST /permissions/assign

{
  "role_id": "r01",
  "permission_id": "p01"
}

6. Gmail & Email Intelligence APIs
6.1 Connect Gmail

POST /gmail/connect

6.2 Fetch Emails

GET /emails/fetch

6.3 List Emails

GET /emails?category=HR&priority=High

{
  "emails": [
    {
      "id": "e01",
      "sender": "hr@company.com",
      "subject": "Policy Update",
      "category": "HR",
      "priority_score": 0.92,
      "follow_up_required": true
    }
  ]
}

6.4 Inbox Digest

GET /emails/digest

7. Task Management APIs
7.1 Create Task

POST /tasks

{
  "title": "Prepare HR Report",
  "assigned_to": "u02",
  "deadline": "2025-01-15",
  "priority": "High"
}

7.2 List Tasks

GET /tasks?status=pending

7.3 Update Task

PATCH /tasks/{task_id}

{
  "status": "completed"
}

8. Meeting & Schedule APIs
8.1 Schedule Meeting

POST /meetings

{
  "meeting_title": "Sprint Review",
  "start_time": "2025-01-10T10:00",
  "end_time": "2025-01-10T11:00",
  "participants": ["u01", "u02"]
}

8.2 List Meetings

GET /meetings?date=2025-01-10

9. Chat & Collaboration APIs
9.1 List Chat Groups

GET /chat/groups

9.2 Send Message

POST /chat/messages

{
  "group_id": "g01",
  "message_type": "TASK",
  "reference_id": "t01",
  "message_text": "Please review this task"
}

9.3 Fetch Messages

GET /chat/messages?group_id=g01

10. Office Assistant APIs
10.1 Ask Assistant

POST /assistant/query

{
  "query": "Show pending tasks"
}

11. Document Intelligence (RAG) APIs
11.1 Upload Document

POST /documents/upload

{
  "title": "Leave Policy",
  "file": "leave_policy.pdf"
}

11.2 Query Document

POST /documents/query

{
  "question": "What is the leave policy?"
}

{
  "answer": "Employees are entitled to 12 casual leaves per year..."
}

12. Analytics APIs
12.1 Productivity Insights

GET /analytics/productivity

12.2 Burnout Risk Detection

GET /analytics/burnout

{
  "risk_level": "Medium",
  "reason": "Frequent late-night emails and meeting overload"
}

13. Dashboard APIs
13.1 Dashboard Summary

GET /dashboard/summary

13.2 Daily Agenda

GET /dashboard/daily-agenda

{
  "meetings": 2,
  "pending_tasks": 5,
  "urgent_emails": 3
}
Security Notes

JWT authentication required for all endpoints

Company-level data isolation enforced

RBAC permission checks applied

Gmail access is read-only