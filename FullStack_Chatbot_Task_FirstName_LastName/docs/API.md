# API Documentation

Base URL (development): `http://localhost:5000/api`
All responses are JSON. Success: `{ "success": true, "data": ..., "message"?: ..., "meta"?: ... }`.
Errors: `{ "success": false, "message": "...", "errors"?: { "field": "reason" } }`.

Admin endpoints need the header `Authorization: Bearer <token>` from `POST /auth/login`.

## Enquiry object
```json
{
  "id": 1, "name": "Aarav Sharma", "email": "aarav@example.com", "phone": "+91 98765 43210",
  "userType": "Student", "interest": "Drone Pilot Certification",
  "message": "I want to join the next batch.", "status": "New", "source": "chatbot",
  "createdAt": "2026-10-10T09:00:00.000Z", "updatedAt": "2026-10-10T09:00:00.000Z"
}
```
Allowed `userType`: `Student`, `Customer`, `Other`. Allowed `status`: `New`, `Contacted`, `In Progress`, `Closed`.

## Auth

### POST /auth/login
Body: `{ "email": "admin@example.com", "password": "..." }`
200: `{ "success": true, "data": { "token": "<jwt>", "email": "admin@example.com" } }`
400 validation, 401 wrong credentials, 429 too many attempts (10 per 15 min).

### GET /auth/me  (admin)
200: `{ "success": true, "data": { "email": "...", "role": "admin" } }`

## Enquiries

### POST /enquiries  (public, 20 per hour per IP)
Body:
```json
{ "name": "Priya Verma", "email": "priya@example.com", "phone": "9123456780",
  "userType": "Customer", "interest": "Land Survey & Mapping",
  "message": "Need a survey for 40 acres.", "source": "form" }
```
Rules: name 2-100 chars; valid email; phone 10-13 digits; message 5-2000 chars; `source` optional (`form` or `chatbot`).
201: `{ "success": true, "message": "Thanks! Your enquiry has been received.", "data": { ...enquiry } }`
400: `{ "success": false, "message": "Enter a valid email address", "errors": { "email": "Enter a valid email address" } }`

### GET /enquiries  (admin)
Query parameters (all optional): `search`, `userType`, `status`, `sort` (`newest` | `oldest` | `name`), `page` (default 1), `limit` (default 10, max 100).
200: `{ "success": true, "data": [ ...enquiries ], "meta": { "total": 42, "page": 1, "limit": 10, "pages": 5 } }`

### GET /enquiries/:id  (admin)
200 with the enquiry, 400 if the id is not a number, 404 `Enquiry not found`.

### PUT or PATCH /enquiries/:id  (admin)
Send any subset of `name, email, phone, userType, interest, message, status`.
Example: `{ "status": "Contacted" }`
200: `{ "success": true, "message": "Enquiry updated", "data": { ...enquiry } }`; 400 validation; 404 not found.

### DELETE /enquiries/:id  (admin)
200: `{ "success": true, "message": "Enquiry deleted" }`; 404 not found.

### GET /enquiries/stats/summary  (admin)
200: `{ "success": true, "data": { "total": 6, "new": 2, "contacted": 2, "inProgress": 1, "closed": 1, "students": 2, "customers": 3, "other": 1, "lastSevenDays": 6 } }`

## Utility

### GET /health
200 `{ "status": "ok", "database": "connected" }` or 503 when the database is unreachable.

## Status codes
| Code | Meaning |
|---|---|
| 200 / 201 | OK / created |
| 400 | Invalid input or invalid ID |
| 401 | Missing, invalid or expired token; wrong login |
| 404 | Enquiry or route not found |
| 413 | Body larger than 10 KB |
| 429 | Rate limit exceeded |
| 500 | Server or database error (generic message only) |

## cURL examples
```bash
# create
curl -X POST http://localhost:5000/api/enquiries -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","phone":"9876543210","userType":"Student","interest":"Drone Pilot Certification","message":"Please share batch dates"}'

# login, then list
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-password"}' | node -pe "JSON.parse(require('fs').readFileSync(0)).data.token")
curl "http://localhost:5000/api/enquiries?status=New&search=drone" -H "Authorization: Bearer $TOKEN"

# update status / delete
curl -X PATCH http://localhost:5000/api/enquiries/1 -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"status":"Contacted"}'
curl -X DELETE http://localhost:5000/api/enquiries/1 -H "Authorization: Bearer $TOKEN"
```
