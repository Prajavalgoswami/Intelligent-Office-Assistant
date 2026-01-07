# Frontend API Contract – Intelligent Office Assistant
## Role-Based UI Contracts

This document defines frontend API contracts for all system roles.
Each section is UI-driven and can be used to build frontend pages
independently of backend readiness.

---

# ROLES SUPPORTED

- SUPER_ADMIN
- ADMIN
- EMPLOYEE

---

# 1. COMMON (ALL ROLES)

## 1.1 Authentication

### Page
- LoginPage

### Route
- /login

### API Dependency
- GET /auth/google/login
- GET /auth/google/callback

### Frontend Data Model

#### AuthUser
| Field | Type | Required | UI Usage |
|-----|------|----------|----------|
| id | string | ✅ | Session |
| name | string | ✅ | Header |
| email | string | ✅ | Profile |
| role | enum | ✅ | Route guard |

### UI States
- Loading: OAuth redirect spinner
- Error: Authentication failed message

---

## 1.2 Logged-in User Profile

### Component
- UserMenu

### API Dependency
- GET /users/me

### Frontend Data Model

#### UserProfile
| Field | Type | Required | UI Usage |
|------|------|----------|----------|
| id | string | ✅ | Key |
| name | string | ✅ | Display |
| email | string | ✅ | Info |
| role | enum | ✅ | Permission |
| department | string | ❌ | Badge |

---

# 2. EMPLOYEE CONTRACT

## 2.1 Employee Dashboard

### Page
- EmployeeDashboard

### Route
- /dashboard

### API Dependency
- GET /dashboard/employee

### Frontend Data Model

#### EmployeeDashboardData
| Field | Type | Required | UI Usage |
|------|------|----------|----------|
| total_emails | number | ✅ | Stat card |
| pending_tasks | number | ✅ | Stat card |
| upcoming_meetings | number | ✅ | Stat card |

---

## 2.2 Emails

### Page
- EmailsPage

### Route
- /emails

### API Dependency
- GET /emails

### Frontend Data Model

#### EmailItem
| Field | Type | Required | UI Usage |
|------|------|----------|----------|
| id | string | ✅ | Key |
| from | string | ✅ | Sender |
| subject | string | ✅ | Title |
| snippet | string | ❌ | Preview |
| category | enum | ✅ | Badge |
| received_at | string | ✅ | Date |

### UI States
- Loading: Skeleton list
- Empty: No emails message
- Error: Retry banner

---

## 2.3 Tasks

### Page
- TasksPage

### Route
- /tasks

### API Dependency
- GET /tasks/my
- POST /tasks

### Frontend Data Model

#### TaskItem
| Field | Type | Required | UI Usage |
|------|------|----------|----------|
| id | string | ✅ | Key |
| title | string | ✅ | List |
| status | enum | ✅ | Chip |
| due_date | string | ❌ | Reminder |

---

## 2.4 Meetings

### Page
- MeetingsPage

### Route
- /meetings

### API Dependency
- GET /meetings/my
- POST /meetings

### Frontend Data Model

#### MeetingItem
| Field | Type | Required | UI Usage |
|------|------|----------|----------|
| id | string | ✅ | Key |
| title | string | ✅ | Card |
| date | string | ✅ | Calendar |
| time | string | ✅ | Display |
| meeting_type | enum | ✅ | Icon |

---

# 3. ADMIN CONTRACT

## 3.1 Admin Dashboard

### Page
- AdminDashboard

### Route
- /admin/dashboard

### API Dependency
- GET /dashboard/admin

### Frontend Data Model

#### AdminDashboardData
| Field | Type | Required | UI Usage |
|------|------|----------|----------|
| total_users | number | ✅ | Stat |
| total_departments | number | ✅ | Stat |
| active_tasks | number | ✅ | Stat |

---

## 3.2 User Management

### Page
- AdminUsersPage

### Route
- /admin/users

### API Dependency
- GET /admin/users
- POST /admin/users

### Frontend Data Model

#### ManagedUser
| Field | Type | Required | UI Usage |
|------|------|----------|----------|
| id | string | ✅ | Key |
| name | string | ✅ | Table |
| email | string | ✅ | Table |
| role | enum | ✅ | Dropdown |
| status | enum | ✅ | Badge |

---

# 4. SUPER ADMIN CONTRACT

## 4.1 Super Admin Dashboard

### Page
- SuperAdminDashboard

### Route
- /super-admin/dashboard

### API Dependency
- GET /dashboard/super-admin

### Frontend Data Model

#### SuperAdminDashboardData
| Field | Type | Required | UI Usage |
|------|------|----------|----------|
| total_companies | number | ✅ | Stat |
| total_admins | number | ✅ | Stat |
| system_health | string | ✅ | Status |

---

## 4.2 Organization Management

### Page
- CompaniesPage

### Route
- /super-admin/companies

### API Dependency
- GET /super-admin/companies
- POST /super-admin/companies

### Frontend Data Model

#### CompanyItem
| Field | Type | Required | UI Usage |
|------|------|----------|----------|
| id | string | ✅ | Key |
| name | string | ✅ | Table |
| admin_email | string | ✅ | Info |
| status | enum | ✅ | Badge |

---

# 5. GLOBAL UI STATE CONTRACT

## Authorization
- Role-based route protection
- Redirect to /login on 401

## Error Handling
- 403 → Access denied page
- 404 → Page not found
- 500 → Global error banner

## Data Strategy
- Mock data used until backend integration
- Axios services replace mocks later

---

# END OF FRONTEND API CONTRACT
