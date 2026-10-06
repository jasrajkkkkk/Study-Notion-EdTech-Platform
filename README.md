# EdTech Platform

Full-stack EdTech platform with Instructor and Student portals: course CRUD,
enrollments with concurrency-safe duplicate prevention, ratings, Razorpay
payments, and a hybrid (content-based + collaborative) course recommender.

**Stack:** Django REST Framework + SQLite/PostgreSQL (backend), React (frontend).

## Project layout

```
backend/            Django REST API
  users/             Custom User model (Instructor/Student role) + JWT auth
  courses/           Course + Lesson CRUD, search
  enrollments/       Enrollment with DB-level unique constraint (no double-enroll races)
  ratings/           Ratings with atomic average recompute
  payments/          Razorpay order creation + server-side signature verification
  recommendations/   Hybrid recommender (TF-IDF content-based + user-based collaborative)
frontend/           React app (Instructor + Student portals, Razorpay checkout)
```

## 1. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env            # fill in SECRET_KEY and Razorpay test keys
python manage.py migrate
python manage.py createsuperuser   # optional, for /admin/

python manage.py runserver      # http://localhost:8000
```

Runs on SQLite with zero extra setup. To use Postgres instead, set
`USE_POSTGRES=True` and the `DB_*` vars in `.env`, then re-run `migrate`.

### Getting Razorpay test keys
1. Sign up at https://dashboard.razorpay.com (test mode is free, no KYC needed).
2. Settings → API Keys → Generate Test Key.
3. Put the Key ID and Key Secret into `backend/.env`.
4. Test card: `4111 1111 1111 1111`, any future expiry, any CVV.

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env            # set REACT_APP_RAZORPAY_KEY_ID to the same test Key ID
npm start                       # http://localhost:3000
```

## 3. Try it out

1. Sign up as an **Instructor** → create a course → add a few lessons → publish it.
2. Sign up as a **Student** (different browser/incognito, or log out first) →
   browse courses → enroll (free) or buy (paid, via Razorpay test checkout) →
   view lessons → leave a rating.
3. Enroll in / rate a couple of courses as a few different students, then
   check the "Recommended for you" section on the student dashboard — it
   blends course-tag similarity with what similar students rated highly.

## How the trickier requirements are actually implemented

- **"Concurrent access for 100+ users" (enrollments):** `enrollments/models.py`
  has a `UniqueConstraint(student, course)`; `enrollments/views.py` wraps
  creation in `transaction.atomic()` with `select_for_update()` and catches
  `IntegrityError`, so two simultaneous requests from the same student can't
  create duplicate rows — the database, not just application logic, enforces it.
- **Rating aggregates under concurrency:** `ratings/views.py` recomputes
  `average_rating`/`rating_count` inside a transaction that locks the course
  row first (`select_for_update`), avoiding lost updates when ratings land
  at nearly the same time.
- **Payment security:** `payments/views.py` never trusts an amount or
  "success" flag from the client. The order amount comes from the Course
  row in the DB, and access is only granted after
  `razorpay.Client.utility.verify_payment_signature` succeeds server-side.
- **Hybrid recommendations:** `recommendations/services.py` — TF-IDF cosine
  similarity over course tags/description (content-based) blended with
  user-based collaborative filtering over the ratings matrix, each weighted
  50/50, with graceful fallbacks for new users and under-rated courses.

## What to add if you want to extend this further
- File/video uploads for lessons (currently just a URL field)
- Course progress tracking per lesson (field exists on Enrollment, not wired up in UI)
- Email notifications (enrollment confirmation, payment receipt)
- Automated tests (pytest-django for backend, React Testing Library for frontend)
- Deploy: backend → Render/Railway, frontend → Vercel/Netlify
