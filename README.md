# Invoice App

A full-stack invoicing MVP built for the TS Academy Backend Development Capstone (Group 63). Staff and admin users can manage customers, create and track invoices across multiple currencies, record payments, and see reporting on how the business is doing.

**Live app:** https://invoice-app-one-psi.vercel.app
**Live API:** https://invoice-app-backend-cyb3.onrender.com/api

> The backend is hosted on Render's free tier, which spins down after inactivity. The first request after a while may take 20–30 seconds to respond while it wakes up.

---

## Features

- **Authentication & roles** — register/login with JWT, two roles (`staff`, `admin`). The first account ever registered automatically becomes admin.
- **Customers** — full CRUD, search by name/email/phone, with paginated results and on-screen page controls once the list grows past one page. Phone numbers are validated as either an 11-digit Nigerian number or an international number starting with `+`. Deleting a customer with existing invoices is blocked to protect invoice history.
- **Invoices** — create, edit, and view invoices with multiple line items, auto-calculated totals, auto-generated invoice numbers (`INV-0001`, `INV-0002`, ...), PO/tax numbers, subject lines, and support for four currencies (NGN, USD, EUR, GBP).
- **Payments** — record partial or full payments against an invoice; status automatically moves between `unpaid` → `part-paid` → `paid`. A fully paid invoice can no longer be edited.
- **Audit trail** — every invoice tracks who created it and who last edited it (and when), so changes made by any staff member are always traceable.
- **Dashboard & Reports** — at-a-glance totals by status, plus a full report page with totals split by currency, top customers by amount invoiced, and overdue invoices.
- **Search** — a global invoice-number search in the navbar, plus filtering by status, with pagination carried over across filters.
- **Settings** — update your name, set a default invoice currency, and change your password.
- **User management** — admins can view all accounts and reset a staff member's password if they forget it (generates a temporary password to share with them directly).
- **Role-based UI** — admin-only actions (deleting customers/invoices, managing users) are hidden from staff accounts in the interface, not just blocked by the API.
- **Security** — `helmet` security headers, a CORS allow-list restricted to the app's own frontend, rate limiting on login/registration to slow down automated password guessing, and centralized error handling so unexpected failures and unmatched routes always return a consistent JSON response.
- **Responsive** — a mobile navigation menu and horizontally-scrollable tables, so every page works on a phone screen, alongside the full desktop layout.

---

## Tech stack

**Backend:** Node.js, Express, MongoDB (Mongoose), JSON Web Tokens, bcrypt, helmet, express-rate-limit
**Frontend:** React (Vite), React Router, Tailwind CSS, Axios
**Hosting:** Render (backend), Vercel (frontend), MongoDB Atlas (database)

---

## Project structure

```
Invoice-app/
├── backend/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── utils/
│       └── server.js
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       └── pages/
├── API.md
├── TESTING.md
└── README.md
```

---

## Running it locally

**Requirements:** Node.js, and a MongoDB connection string (Atlas or local).

### Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with:
```
MONGODB_URI=your-connection-string
JWT_SECRET=any-long-random-string
PORT=5000
```

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/` with:
```
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Roles

| Action | Staff | Admin |
|---|---|---|
| Create/view/edit customers and invoices | ✅ | ✅ |
| Record payments | ✅ | ✅ |
| Delete a customer | ❌ | ✅ |
| Delete an invoice | ❌ | ✅ |
| View all users / reset a password | ❌ | ✅ |

The first account registered on a fresh database becomes `admin` automatically; every account after that starts as `staff`.

---

## Documentation

- **[API.md](./API.md)** — every endpoint, request/response shapes, and error cases.
- **[TESTING.md](./TESTING.md)** — manual test cases run against the live API, with results.

---

## Team

TS Academy Backend Development Capstone, Group 63.

- Egbo James — built and documented this project
- Richard Agafie — built and documented this project
- Victor Akinyemi — built and documented this project
- Israel Ayoola — built and documented this project
