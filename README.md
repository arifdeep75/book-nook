# 📚 BookNook --- A Small Online Library

## 🌐 Live Application

-   **Frontend:** https://book-nook-gamma.vercel.app/
-   **Backend API:** https://book-nook-server-alpha.vercel.app/

> The frontend and backend are deployed separately. The backend
> health-check endpoint is available at `/`, and the database test
> endpoint is available at `/test-db`.

------------------------------------------------------------------------

## 📖 About BookNook

**BookNook** is a small online library platform where readers can
explore a collection of books, contribute books to the library, borrow
available copies, manage their borrowed books, and share feedback
through reviews.

The application provides a clean user experience with public book
discovery pages and authenticated features for registered users. It uses
a separate frontend and backend architecture, with MongoDB for
persistent data storage and Better Auth for authentication.

Whether someone wants to discover their next read, contribute a book, or
keep track of borrowed books, BookNook brings these activities together
in one place.

------------------------------------------------------------------------

## ✨ Features

### 🔐 Authentication & Account Management

-   User registration and sign-in using **Better Auth**.
-   Email and password authentication.
-   Social sign-in support configured through Better Auth providers.
-   Session-aware interface that adapts to the user's authentication
    state.
-   Protected pages and authenticated actions.
-   User profile information, including name, email, and profile image.
-   Sign-out functionality.
-   JWT-based authentication for protected backend API requests.
-   Backend token verification before allowing protected operations.
-   Authenticated user identity is used for user-specific operations.

### 🏠 Home Page

-   Welcoming landing page introducing the BookNook platform.
-   Responsive navigation for moving between the main sections.
-   A book-focused hero/banner area.
-   Swiper-powered carousel with multiple slides.
-   Latest books section displaying recently added books dynamically.
-   Additional content sections to make the landing page more
    informative and engaging.
-   Clear calls to action for exploring the library and using its
    features.

### 📚 All Books & Book Discovery

-   Dedicated **All Books** page for exploring the library collection.
-   Dynamic book data loaded from the backend API.
-   Individual book details pages using dynamic book IDs.
-   Book information presented in an organized layout.
-   Availability information for readers.
-   Loading and error states for data-fetching operations.
-   Responsive layout for desktop, tablet, and mobile screens.

### ➕ Add a Book

Authenticated users can contribute books to the shared library.

-   Protected **Add Book** page.
-   Book submission form with relevant book information.
-   Book image supplied through an image URL.
-   Contributor name and email associated with the signed-in account.
-   Contributor identity fields are displayed as read-only where
    applicable.
-   Total copy count can be specified when adding a book.
-   Submitted book information is stored in MongoDB through the backend
    API.
-   Form validation and user feedback for submission actions.

### 🗂️ My Books

-   Personal page for viewing books contributed by the signed-in user.
-   Book records associated with the contributor's account.
-   Options to update book information.
-   Options to remove contributed books.
-   User-specific data access through authenticated backend requests.

### 📖 Borrowing & Returning Books

-   Borrow available books from the library.
-   Borrowing records are stored in the database.
-   Borrowed-book information is associated with the relevant user.
-   Available copy counts are updated when a book is borrowed.
-   Users can view their borrowing history in **My Borrows**.
-   Return functionality for borrowed books.
-   Book availability is updated when a borrowed copy is returned.
-   Borrowing actions are designed to prevent unavailable copies from
    being borrowed.

### ⭐ Reviews & Feedback

-   Review section for collecting readers' feedback.
-   Public review retrieval for displaying submitted reviews.
-   Authenticated review submission.
-   User-specific review status and review retrieval.
-   Review records associated with the authenticated user.
-   User feedback and error handling for review operations.

### 🛡️ Protected Routes & API Security

-   Public pages remain accessible without signing in.
-   Private pages require an authenticated session.
-   Backend endpoints can verify JWT bearer tokens.
-   User-specific operations use authenticated identity.
-   Protected operations are intended to prevent unauthorized access.
-   Frontend and backend communicate through HTTP API requests.
-   CORS is configured to allow requests from the deployed frontend
    origin.

### ⚙️ Backend & Database

-   REST API built with **Node.js** and **Express.js**.
-   **MongoDB** used for persistent application data.
-   MongoDB connection managed by the backend.
-   Dedicated database connectivity test endpoint.
-   API routes for books, borrowing records, and reviews.
-   Dynamic resource lookup using MongoDB document IDs.
-   JSON request and response handling.
-   Environment-based configuration for deployment.
-   Vercel-compatible serverless backend deployment.

### 📱 Responsive User Experience

-   Responsive layouts for desktop, tablet, and mobile devices.
-   Consistent navigation and page structure.
-   Clear content hierarchy and readable book information.
-   User-friendly forms and action feedback.
-   Loading, empty, and error states where appropriate.

------------------------------------------------------------------------

## 🧭 Main Pages & Routes

  -----------------------------------------------------------------------
  Route                   Access                  Description
  ----------------------- ----------------------- -----------------------
  `/`                     Public                  Home page with hero
                                                  carousel, latest books,
                                                  and additional sections

  `/books`                Public                  Browse the library
                                                  collection

  `/books/[id]`           Authenticated page      View an individual
                                                  book's details

  `/add-book`             Private                 Add a new book to the
                                                  library

  `/my-books`             Private                 Manage books
                                                  contributed by the
                                                  signed-in user

  `/my-borrows`           Private                 View and manage
                                                  borrowed books

  Authentication pages    Public                  Register or sign in to
                                                  BookNook
  -----------------------------------------------------------------------

> Route access should always be enforced by the application, and
> protected backend operations must independently verify authentication.

------------------------------------------------------------------------

## 🔌 Backend API Overview

The backend is deployed at:

``` text
https://book-nook-server-alpha.vercel.app
```

### Health & Database

  Method   Endpoint     Purpose
  -------- ------------ --------------------------------------
  `GET`    `/`          Check whether the backend is running
  `GET`    `/test-db`   Test the MongoDB connection

### Books

  Method     Endpoint          Purpose
  ---------- ----------------- ---------------------------
  `GET`      `/books`          Retrieve books
  `GET`      `/books/latest`   Retrieve the latest books
  `GET`      `/books/:id`      Retrieve a book by its ID
  `POST`     `/books`          Add a book
  `PATCH`    `/books/:id`      Update a book
  `DELETE`   `/books/:id`      Delete a book

### Borrowing

  -----------------------------------------------------------------------
  Method                  Endpoint                Purpose
  ----------------------- ----------------------- -----------------------
  `POST`                  `/borrows`              Create a borrowing
                                                  record

  `GET`                   `/borrows`              Retrieve borrowing
                                                  records

  `DELETE`                `/borrows/:id`          Remove a borrowing
                                                  record / process a
                                                  return
  -----------------------------------------------------------------------

### Reviews

  -----------------------------------------------------------------------
  Method                  Endpoint                Purpose
  ----------------------- ----------------------- -----------------------
  `GET`                   `/reviews`              Retrieve reviews

  `GET`                   `/reviews/me`           Retrieve the signed-in
                                                  user's review
                                                  information

  `POST`                  `/reviews`              Submit a review
  -----------------------------------------------------------------------

**Authentication note:** Protected endpoints should receive a valid JWT
in the request's `Authorization` header:

``` http
Authorization: Bearer <your-jwt-token>
```

Never place a real token, database password, or other secret in this
README.

------------------------------------------------------------------------

## 🧰 Technology Stack

### Frontend

-   **Next.js** --- React framework for the web application.
-   **React** --- Component-based user interface.
-   **TypeScript / TSX** --- Typed application development.
-   **Tailwind CSS** --- Utility-first styling and responsive layouts.
-   **shadcn/ui** --- Reusable interface components.
-   **Lucide React** --- Interface icons.
-   **Swiper** --- Home page carousel.
-   **Sonner** --- Toast notifications and user feedback.
-   **Better Auth** --- Authentication client and session management.

### Backend

-   **Node.js** --- JavaScript runtime.
-   **Express.js** --- REST API framework.
-   **MongoDB** --- NoSQL database.
-   **MongoDB Node.js Driver** --- Database connectivity and queries.
-   **CORS** --- Cross-origin request configuration.
-   **dotenv** --- Environment variable management.
-   **jose** --- JWT verification.
-   **Better Auth JWT/JWKS** --- Token verification integration.

### Tools & Deployment

-   **Git & GitHub** --- Version control and source code hosting.
-   **Vercel** --- Frontend and serverless backend deployment.
-   **VS Code** --- Development environment.

------------------------------------------------------------------------

## 🏗️ Application Architecture

BookNook follows a separated frontend/backend architecture:

``` text
                       ┌──────────────────────┐
                       │       Reader         │
                       │  Desktop / Mobile    │
                       └──────────┬───────────┘
                                  │
                                  ▼
                       ┌──────────────────────┐
                       │   Next.js Frontend   │
                       │  React + TypeScript  │
                       └──────────┬───────────┘
                                  │
                         HTTP / REST API
                         JWT where required
                                  │
                                  ▼
                       ┌──────────────────────┐
                       │   Express Backend    │
                       │  API + Verification  │
                       └──────────┬───────────┘
                                  │
                                  ▼
                       ┌──────────────────────┐
                       │       MongoDB        │
                       │   Persistent Data    │
                       └──────────────────────┘

                       Better Auth
                  Authentication / JWT / JWKS
```

The frontend handles the user interface and communicates with the
backend through REST endpoints. The backend processes requests, verifies
authentication where required, and reads or writes application data in
MongoDB.
