# 🎓 Student Grievance Portal

A full-stack web application that allows students to submit and track grievances, while administrators efficiently manage, assign, and resolve them through a centralized dashboard with real-time analytics.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-3b82f6?style=for-the-badge&logo=vercel&logoColor=white)](https://github.com/beamhonor0911/student-grievance-portal)
[![GitHub](https://img.shields.io/badge/GitHub-beamhonor0911-181717?style=for-the-badge&logo=github)](https://github.com/beamhonor0911/student-grievance-portal)

**Built by [Anshumaan Sharma](https://github.com/beamhonor0911)**

---

## 🔐 Demo & Testing Credentials

Anyone testing or grading the application can explore both roles:

| Role | How to Access | Secret Code |
| :--- | :--- | :--- |
| 👨‍🎓 **Student** | Select **Register** → Role: `Student` | *(None needed)* |
| 👨‍💼 **Admin** | Select **Register** → Role: `Admin` | `ADMIN2024` |

> [!TIP]
> Use the **Admin Secret Code** `ADMIN2024` during registration to unlock the administrator panel with analytics charts, department assignment, and CSV export capabilities.

---

## ✨ Features

### 👨‍🎓 Student Module

* Register and login securely with JWT authentication
* Submit grievances with category, priority, and detailed description
* **Interactive priority selector** with color-coded cards
* Track real-time grievance status with **visual timeline** (Submitted → In Progress → Resolved)
* **Search & sort** your grievances by date, priority, or status
* **Animated stat counters** with live dashboard metrics
* **Confetti celebration** on successful submission 🎉
* Toast notifications for all actions
* Responsive sidebar navigation

### 👨‍💼 Admin Module

* Secure admin authentication with **secret code protection**
* **Analytics dashboard** with SVG donut & bar charts
* Key metrics: resolution rate, rejected count, high-priority alerts
* View and manage all submitted grievances
* **Multi-filter system**: status, category, priority + search bar
* Update grievance lifecycle (Pending → In Progress → Resolved → Rejected)
* Assign grievances to departments
* Add remarks and manage complaint records
* **CSV export** for all grievance data
* **Custom confirmation modals** (no browser alerts)
* **Pagination** for large datasets
* Skeleton loading states

### 🎨 Design & UX

* **Dark glassmorphic theme** with animated mesh gradient backgrounds
* **Premium typography** with Inter + JetBrains Mono
* **Smooth animations** — card entrances, stat counters, chart draw-ins
* **Toast notification system** — stackable, themed, auto-dismiss
* **Password strength meter** on registration
* **Responsive design** — mobile-first with sidebar navigation
* **XSS protection** — all user input is escaped before rendering

---

## 🛠️ Tech Stack

| Layer             | Technology                          |
| ----------------- | ----------------------------------- |
| Frontend          | HTML5, CSS3, Vanilla JavaScript ES6+|
| Backend           | Node.js, Express.js                 |
| Database          | MongoDB, Mongoose                   |
| Authentication    | JWT (JSON Web Tokens)               |
| Password Security | bcryptjs                            |
| Charts            | Pure SVG (no libraries)             |
| Deployment        | Render (Backend), Vercel (Frontend) |

---

## 📁 Project Structure

```
student-grievance-portal/
│
├── frontend/
│   ├── index.html          # Login/Register page
│   ├── student.html        # Student dashboard
│   ├── admin.html          # Admin dashboard
│   ├── css/
│   │   ├── index.css       # Auth page styles + design system
│   │   ├── student.css     # Student dashboard styles
│   │   └── admin.css       # Admin dashboard styles
│   └── js/
│       ├── index.js        # Auth logic, toast, password strength
│       ├── student.js      # Student dashboard logic, confetti, timeline
│       └── admin.js        # Admin logic, charts, CSV export, modals
│
├── backend/
│   ├── server.js           # Express server + MongoDB connection
│   ├── models/
│   │   ├── User.js         # User schema (student/admin roles)
│   │   └── Grievance.js    # Grievance schema with status tracking
│   ├── routes/
│   │   ├── auth.js         # Register/Login endpoints
│   │   └── grievance.js    # CRUD + stats + search + pagination
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT verification
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v16+)
* MongoDB Atlas account (or local MongoDB)

### Backend Setup

```bash
cd backend
npm install

# Create .env file
echo "PORT=5000" > .env
echo "MONGO_URI=your_mongodb_connection_string" >> .env
echo "JWT_SECRET=your_secret_key" >> .env

npm start
```

### Frontend Setup

No install needed — just open `frontend/index.html` in your browser.

For local development, update the `API` constant in the JS files to point to `http://localhost:5000/api`.

---

## 🌐 Deployment
 
 * **Frontend**: Deployed on [Vercel](https://vercel.com)
 * **Backend**: Deployed on [Render](https://render.com)

---

## 📊 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login and get JWT | No |
| POST | `/api/grievance/submit` | Submit a grievance | Student |
| GET | `/api/grievance/my` | Get student's grievances | Student |
| GET | `/api/grievance/all` | Get all grievances (search, pagination) | Admin |
| GET | `/api/grievance/stats` | Get analytics data | Admin |
| PUT | `/api/grievance/update/:id` | Update status/assignment | Admin |
| DELETE | `/api/grievance/delete/:id` | Delete a grievance | Admin |

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Submit login/register form |

---

## 📈 Future Enhancements

* Email/SMS notifications on status change
* AI-based grievance prioritization
* Department-specific admin roles
* File/document uploads for complaints
* Mobile application (React Native)
* Advanced analytics and reporting dashboard
* Real-time WebSocket updates

---

## 👨‍💻 Author

**Anshumaan Sharma**

* GitHub: [github.com/beamhonor0911](https://github.com/beamhonor0911)

---

## 📄 License

MIT © [Anshumaan Sharma](https://github.com/beamhonor0911)
