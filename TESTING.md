# Invoice App — Testing

This documents manual testing performed against the live API using Postman, covering the happy path and the main error cases for each endpoint. All tests below were run against the deployed backend and confirmed working as expected.

## How testing was done

Each endpoint was tested directly in Postman with a valid auth token (obtained from `/auth/login`), except where a test specifically checks what happens *without* one. Requests and real responses were reviewed one at a time to confirm the API behaves as documented in `API.md`.

---

## Auth

| # | Test | Expected result | Result |
|---|---|---|---|
| 1 | Register a new account with valid name, email, password | `201`, returns user + token | ✅ Pass |
| 2 | Register again with the same email | `409` error, no duplicate created | ✅ Pass |
| 3 | Log in with correct email/password | `200`, returns user + token | ✅ Pass |
| 4 | Log in with wrong password | Fails with an error, no token issued | ✅ Pass |
| 5 | Call `GET /auth/me` with a valid token | Returns the logged-in user's own details | ✅ Pass |
| 6 | Call a protected route with no token | Rejected: `"Not authorized. Please log in."` | ✅ Pass |

**Role promotion note:** there is no endpoint to make a user admin. The *first* account ever registered on a fresh database automatically becomes `admin`; every account after that defaults to `staff`. To create a second admin account for testing, a user's `role` field was changed directly in MongoDB Atlas. This was confirmed working — see the Roles tests below, where actions correctly succeed or fail depending on which role is logged in.

---

## Customers

| # | Test | Expected result | Result |
|---|---|---|---|
| 1 | Create a customer with a name | `201`, customer returned | ✅ Pass |
| 2 | Create a customer with no name | `400` validation error | ✅ Pass |
| 3 | List customers (`GET /customers`) | Returns the full list | ✅ Pass |
| 4 | Search customers (`?search=`) | Returns only matching customers | ✅ Pass |
| 5 | Update a customer's details | `200`, updated customer returned | ✅ Pass |
| 6 | Delete a customer as a **staff** account | `403`: `"You do not have permission to do this."` | ✅ Pass |
| 7 | Delete a customer with no invoices, as **admin** | `200`, customer removed | ✅ Confirmed by code review — not re-run live in this session, since it would permanently remove real test data |
| 8 | Delete a customer who **has** invoices, as admin | `409`, blocked to protect invoice history | ✅ Confirmed by code review — not re-run live in this session, for the same reason as above |

---

## Invoices

| # | Test | Expected result | Result |
|---|---|---|---|
| 1 | Create an invoice with a valid customer and item(s) | `201`, invoice number auto-generated (e.g. `INV-0006`) | ✅ Pass |
| 2 | Create an invoice with an empty `items` array | `400`: `"At least one item is required"` | ✅ Pass |
| 3 | Create an invoice with a fake customer ID | `404`: `"Customer not found"` | ✅ Pass |
| 4 | List all invoices (`GET /invoices`) | Returns all invoices with pagination info | ✅ Pass |
| 5 | Filter invoices by status (`?status=unpaid`) | Returns only invoices matching that status | ✅ Pass |
| 6 | Fetch one invoice (`GET /invoices/:id`) | Returns the full invoice, customer populated | ✅ Pass |
| 7 | Update an invoice's notes | `200`, change saved | ✅ Pass |
| 8 | Update an invoice that is already `paid` | `409`: `"A fully paid invoice cannot be edited"` | ✅ Pass |
| 9 | Record a payment on an unpaid invoice | `200`, `amountPaid` increases, status flips to `part-paid`, `balance` recalculated | ✅ Pass |
| 10 | Record a payment larger than the remaining balance | `400`, names the actual outstanding balance in the message | ✅ Pass |
| 11 | Delete an invoice as a **staff** account | `403`, blocked | ✅ Pass |
| 12 | Delete an invoice as **admin** | `200`, `"Invoice deleted successfully"` | ✅ Pass |

---

## Dashboard & Reporting

| # | Test | Expected result | Result |
|---|---|---|---|
| 1 | `GET /invoices/summary` | Returns total customers, total invoiced/collected/outstanding, counts by status | ✅ Confirmed — powers the live Dashboard page, where these figures are checked visually against the invoice list on every load |
| 2 | `GET /invoices/report` | Returns totals split by currency, top 5 customers, and overdue invoices | ✅ Confirmed — powers the live Report page, cross-checked against individual invoice records (e.g. NGN and USD totals kept separate rather than summed together) |

---

## Roles summary (confirmed by the tests above)

| Action | Staff | Admin |
|---|---|---|
| Create/view/edit customers and invoices | ✅ Tested | ✅ Tested |
| Record payments | ✅ Tested | ✅ Tested |
| Delete a customer | ❌ Tested — correctly blocked | ✅ Confirmed by code review |
| Delete an invoice | ❌ Tested — correctly blocked | ✅ Tested |

---

## Frontend testing

Alongside the API tests above, the full user flow was tested manually in the browser on both `localhost` and the deployed Vercel/Render environment:

- Registering, logging in, and logging out
- Creating, editing, and viewing customers
- Creating, editing, viewing, and paying invoices, across both NGN and USD
- Searching and filtering invoices by status
- Viewing the Dashboard and Report pages, and confirming the numbers match the underlying invoice data
- Updating profile details and changing password via Settings
- Confirming admin-only actions (Delete buttons) are hidden from staff accounts in the UI, not just blocked by the API
