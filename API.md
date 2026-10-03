# Invoice App — API Documentation

Base URL (local): `http://localhost:5000/api`
Base URL (live): `https://invoice-app-backend-cyb3.onrender.com/api`

## Conventions

**Every response** follows the same shape:

```json
{
  "success": true,
  "message": "Human-readable description",
  "data": { }
}
```

On error, `success` is `false`, `data` is `null`, and `message` explains what went wrong.

**Authentication**: most routes require a valid JSON Web Token, sent as:

```
Authorization: Bearer <token>
```

The token is returned by `/auth/login` and `/auth/register`, and expires according to the server's configured lifetime.

**Roles**: every account is either `staff` or `admin`. The first account ever registered becomes `admin` automatically; every account after that is `staff`. A handful of routes are admin-only, marked below.

**Standard error responses**, returned by most routes when applicable:

| Status | Meaning |
|---|---|
| 400 | Validation failed — the message explains which field and why |
| 401 | Missing or invalid token |
| 403 | Valid token, but the account's role isn't allowed to do this |
| 404 | The record (invoice, customer, etc.) doesn't exist |
| 409 | Conflict — e.g. duplicate email, or an action not allowed in the record's current state |
| 500 | Unexpected server error |

---

## Auth

### `POST /auth/register`
Creates an account. No token required.

**Body**
```json
{ "name": "Jane Doe", "email": "jane@example.com", "password": "secret123" }
```
- `name`, `email`, `password` all required
- `email` must look like a real email address
- `password` must be at least 6 characters
- Fails with 409 if the email is already registered

**Response** `201`
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": "651f...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "staff",
      "defaultCurrency": "NGN"
    },
    "token": "eyJhbGciOi..."
  }
}
```

### `POST /auth/login`
No token required.

**Body**
```json
{ "email": "jane@example.com", "password": "secret123" }
```

**Response** `200` — same shape as register. Returns `401` on a wrong email or password.

### `GET /auth/me`
Requires a token. Returns the currently logged-in user.

**Response** `200`
```json
{
  "success": true,
  "message": "Current user fetched successfully",
  "data": { "user": { "id": "651f...", "name": "Jane Doe", "email": "jane@example.com", "role": "staff", "defaultCurrency": "NGN" } }
}
```

### `PUT /auth/profile`
Requires a token. Updates your own name and/or default invoice currency.

**Body** (either or both)
```json
{ "name": "Jane A. Doe", "defaultCurrency": "USD" }
```
- `defaultCurrency` must be one of `NGN`, `USD`, `EUR`, `GBP`
- Fails with 400 if neither field is given

**Response** `200` — returns the updated `user`, same shape as login.

### `PUT /auth/password`
Requires a token. Changes your own password.

**Body**
```json
{ "currentPassword": "secret123", "newPassword": "newsecret456" }
```
- `newPassword` must be at least 6 characters and different from the current one
- Fails with 400 (not 401) if `currentPassword` is wrong, so a typo here doesn't look like an expired login

**Response** `200`, `data: null`

### `GET /auth/users`
**Admin only** — `403` for a staff account. Lists every account on the system (safe fields only — no password hashes).

**Response** `200`
```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": {
    "users": [
      { "_id": "651f...", "name": "Jane Doe", "email": "jane@example.com", "role": "staff", "defaultCurrency": "NGN", "createdAt": "2026-09-01T10:00:00.000Z" }
    ]
  }
}
```

### `PUT /auth/users/:id/reset-password`
**Admin only** — `403` for a staff account. Resets another user's password to a randomly generated temporary one, so an admin can hand it to a user who's forgotten theirs. No body required.

- Fails with `400` if you try to reset your own account this way — use `/auth/password` instead
- `404` if the user doesn't exist

**Response** `200`
```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": { "tempPassword": "aB3dK9pL" }
}
```
The temporary password is only ever returned in this one response — it is hashed before saving and not retrievable afterward. The admin is responsible for sharing it with the user directly.

---

## Customers

All routes below require a token.

### `POST /customers`
Creates a customer.

**Body**
```json
{ "name": "Tade Bayo", "email": "tade@yahoo.com", "phone": "08099999998", "address": "12 Oshin Road, Lagos" }
```
- `name` is required and cannot be empty
- `email`, if provided and non-empty, must look like a valid email address
- `phone` and `address` are optional free text

**Response** `201`
```json
{ "success": true, "message": "Customer created successfully", "data": { "customer": { "_id": "...", "name": "Tade Bayo", "email": "tade@yahoo.com", "phone": "08099999998", "address": "12 Oshin Road, Lagos" } } }
```

### `GET /customers`
Lists customers, newest first.

**Query params**
- `search` — matches against name, email, or phone
- `page`, `limit` — pagination (`limit` capped at 50, same as `/invoices`)

**Response** `200`
```json
{
  "success": true,
  "message": "Customers fetched successfully",
  "data": {
    "customers": [ { "_id": "...", "name": "Tade Bayo", "email": "tade@yahoo.com", "phone": "08099999998", "address": "12 Oshin Road, Lagos" } ],
    "pagination": { "page": 1, "limit": 10, "total": 4, "pages": 1 }
  }
}
```

### `GET /customers/:id`
Fetches one customer. `404` if not found.

### `PUT /customers/:id`
Updates a customer. Send only the fields you want to change; at least one is required. Same validation rules as create, except `name` is only checked if you're actually changing it.

### `DELETE /customers/:id`
**Admin only** — `403` for a staff account. Fails with `409` if the customer has any existing invoices, to protect invoice history — delete or reassign those first.

---

## Invoices

All routes below require a token.

### `POST /invoices`
Creates an invoice. `invoiceNumber` is generated automatically (`INV-0001`, `INV-0002`, ...) — don't send it.

**Body**
```json
{
  "customer": "651f2a...",
  "items": [ { "description": "Web design", "quantity": 1, "unitPrice": 150000 } ],
  "dueDate": "2026-10-15",
  "notes": "Optional free text",
  "poNumber": "Optional",
  "taxNumber": "Optional",
  "currency": "NGN",
  "subject": "Optional one-line summary"
}
```
- `customer` must be a real customer's ID
- `items` must have at least one entry; each needs a non-empty `description`, and `quantity`/`unitPrice` greater than 0
- `currency` must be one of `NGN`, `USD`, `EUR`, `GBP` (defaults to `NGN`)
- `total` is calculated automatically from the items — never sent by the client

**Response** `201` — returns the created `invoice`, with `customer` populated (`name`, `email`, `phone`), `createdBy` populated (`name`), and a computed `balance` field (`total - amountPaid`).

**Audit trail:** every invoice records `createdBy` (set once, at creation) and `lastEditedBy` / `lastEditedAt` (updated on every `PUT /invoices/:id` and every `POST /invoices/:id/payments`). This makes it possible to see who created an invoice and who most recently changed it, even though any staff member is allowed to edit any invoice.

### `GET /invoices`
Lists invoices, newest first.

**Query params**
- `status` — `unpaid`, `part-paid`, or `paid`
- `customer` — filter to one customer's ID
- `search` — matches against invoice number
- `page`, `limit` — pagination (`limit` capped at 50)

**Response** `200`
```json
{
  "success": true,
  "message": "Invoices fetched successfully",
  "data": {
    "invoices": [ /* array of invoice objects */ ],
    "pagination": { "page": 1, "limit": 10, "total": 5, "pages": 1 }
  }
}
```

### `GET /invoices/:id`
Fetches one invoice. `404` if not found.

### `PUT /invoices/:id`
Updates an invoice. Any of `items`, `dueDate`, `notes`, `poNumber`, `taxNumber`, `currency`, `subject` may be sent; only the fields present are changed. **The customer cannot be changed after creation.**

- Fails with `409` if the invoice's status is already `paid`
- If `items` is included, the new total can't be less than the amount already paid (`400` if it would be)
- `lastEditedBy` and `lastEditedAt` are set automatically to the logged-in user and the current time — this cannot be overridden by the request body

### `POST /invoices/:id/payments`
Records a payment against an invoice.

**Body**
```json
{ "amount": 50000 }
```
- `amount` must be a number greater than 0
- Fails with `409` if the invoice is already fully paid
- Fails with `400` if the amount is more than the outstanding balance

**Response** `200` — returns the updated `invoice`. `status` is recalculated automatically: `unpaid` → `part-paid` → `paid` as payments come in. `lastEditedBy` and `lastEditedAt` are also updated, same as `PUT /invoices/:id`.

### `DELETE /invoices/:id`
**Admin only** — `403` for a staff account.

### `GET /invoices/summary`
Dashboard totals across all invoices, all currencies combined.

**Response** `200`
```json
{
  "success": true,
  "message": "Summary fetched successfully",
  "data": {
    "totalCustomers": 4,
    "totalInvoiced": 1367000,
    "totalCollected": 630000,
    "totalOutstanding": 737000,
    "invoicesByStatus": { "unpaid": 0, "part-paid": 2, "paid": 3 }
  }
}
```
Note: money figures here add every currency together, so this is only meaningful when every invoice shares one currency. `/invoices/report` below is currency-aware.

### `GET /invoices/report`
Fuller reporting: totals split by currency, top 5 customers by amount invoiced, and overdue invoices.

**Response** `200`
```json
{
  "success": true,
  "message": "Report fetched successfully",
  "data": {
    "totals": [
      { "currency": "NGN", "invoiced": 1330000, "collected": 607000, "outstanding": 723000, "byStatus": { "unpaid": 1, "part-paid": 0, "paid": 3 } },
      { "currency": "USD", "invoiced": 37000, "collected": 23000, "outstanding": 14000, "byStatus": { "unpaid": 1, "part-paid": 0, "paid": 0 } }
    ],
    "topCustomers": [
      { "customerId": "...", "name": "Lekan Adejoba", "currency": "NGN", "invoices": 2, "total": 750000, "amountPaid": 27000, "outstanding": 723000 }
    ],
    "overdue": [
      { "_id": "...", "invoiceNumber": "INV-0004", "customer": "Lekan Adejoba", "currency": "NGN", "balance": 723000, "dueDate": "2026-09-01T00:00:00.000Z", "daysOverdue": 27 }
    ]
  }
}
```

---

## Roles summary

| Action | Staff | Admin |
|---|---|---|
| View/create/edit customers and invoices | ✅ | ✅ |
| Record payments | ✅ | ✅ |
| Delete a customer | ❌ | ✅ |
| Delete an invoice | ❌ | ✅ |
| View Report and Dashboard | ✅ | ✅ |
| Change own profile/password | ✅ | ✅ |
| View all users (`GET /auth/users`) | ❌ | ✅ |
| Reset another user's password | ❌ | ✅ |

The first account ever created on a fresh database automatically becomes `admin`. There is no endpoint to *promote* another account to admin — that's done directly in the database. An admin *can*, however, reset any other user's password via `PUT /auth/users/:id/reset-password`.
