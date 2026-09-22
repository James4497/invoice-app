# Invoice Management App — Backend API

A backend API for managing customers and invoices: create customers, raise invoices,
record payments, and track outstanding balances. Built with Node.js, Express, and
MongoDB (Mongoose).

## Tech stack
- Node.js + Express
- MongoDB Atlas + Mongoose
- JWT authentication, bcrypt password hashing

## Getting started

1. Clone the repo and install dependencies:

2. Create a `.env` file in `backend/` with:
PORT=8000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=a_long_random_string

3. Run the server:
npm run dev
4. Health check: `GET http://localhost:8000/api/health`

## Authentication

All endpoints below except register and login require a JWT sent as:

Authorization: Bearer <token>

The first account ever registered becomes `admin`. All others are `staff`.
Admin-only actions are marked below.

Every response follows this shape:
```json
{ "success": true, "message": "...", "data": { ... } }
```
or, on error:
```json
{ "success": false, "message": "...", "data": null }
```

---

## Auth routes (`/api/auth`)

### Register
`POST /api/auth/register`
Auth: none

Request body:
```json
{ "name": "Ada Okafor", "email": "ada@example.com", "password": "test1234" }
```
Success: `201` — user object + token
Errors: `400` (missing/invalid fields), `409` (email already exists)

### Login
`POST /api/auth/login`
Auth: none

Request body:
```json
{ "email": "ada@example.com", "password": "test1234" }
```
Success: `200` — user object + token
Errors: `400` (missing fields), `401` (invalid credentials)

### Get current user
`GET /api/auth/me`
Auth: required

Success: `200` — current user's details
Errors: `401` (missing/invalid/expired token)

---

## Customer routes (`/api/customers`)

### Create customer
`POST /api/customers`
Auth: required

Request body:
```json
{ "name": "Ada Okafor", "email": "ada@example.com", "phone": "08012345678", "address": "12 Marina Road, Lagos" }
```
Only `name` is required. Success: `201`. Errors: `400` (invalid data)

### List customers
`GET /api/customers`
Auth: required

Query params: `search` (matches name/email/phone), `page`, `limit`
Success: `200` — `customers` array + `pagination` object

### Get one customer
`GET /api/customers/:id`
Auth: required
Success: `200`. Errors: `400` (invalid ID), `404` (not found)

### Update customer
`PUT /api/customers/:id`
Auth: required

Request body: any of `name`, `email`, `phone`, `address`
Success: `200`. Errors: `400`, `404`

### Delete customer
`DELETE /api/customers/:id`
Auth: required, **admin only**
Success: `200`. Errors: `400`, `403` (not admin), `404`,
`409` (customer has invoices and cannot be deleted)

---

## Invoice routes (`/api/invoices`)

### Create invoice
`POST /api/invoices`
Auth: required

Request body:
```json
{
  "customer": "customerIdHere",
  "dueDate": "2026-10-15",
  "notes": "Thanks for your business",
  "items": [
    { "description": "Website design", "quantity": 1, "unitPrice": 150000 },
    { "description": "Hosting (12 months)", "quantity": 12, "unitPrice": 5000 }
  ]
}
```
The server generates `invoiceNumber` and calculates `total` automatically.
Success: `201`. Errors: `400` (invalid data), `404` (customer not found)

### List invoices
`GET /api/invoices`
Auth: required

Query params: `status` (`unpaid`/`part-paid`/`paid`), `customer` (ID), `search` (invoice number), `page`, `limit`
Success: `200` — `invoices` array + `pagination` object

### Get one invoice
`GET /api/invoices/:id`
Auth: required
Success: `200`. Errors: `400`, `404`

### Update invoice
`PUT /api/invoices/:id`
Auth: required

Request body: any of `items`, `dueDate`, `notes`
Success: `200`. Errors: `400`, `404`, `409` (invoice is fully paid and cannot be edited)

### Record a payment
`POST /api/invoices/:id/payments`
Auth: required

Request body:
```json
{ "amount": 100000 }
```
Recalculates `amountPaid`, `balance` and `status` automatically.
Success: `200`. Errors: `400` (invalid amount, or exceeds balance), `404`, `409` (already fully paid)

### Delete invoice
`DELETE /api/invoices/:id`
Auth: required, **admin only**
Success: `200`. Errors: `400`, `403`, `404`

### Dashboard summary
`GET /api/invoices/summary`
Auth: required

Success: `200` — total customers, total invoiced, total collected,
total outstanding, and invoice counts by status.

