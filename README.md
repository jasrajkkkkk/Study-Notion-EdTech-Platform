# EdTech Platform

A full-stack EdTech platform where instructors can create and manage courses, while students can browse, enroll, purchase courses, and leave ratings.

The project also includes Razorpay payments and a course recommendation system that combines content-based recommendations with collaborative filtering.

## Tech Stack

**Backend:** Django, Django REST Framework
**Frontend:** React
**Database:** SQLite / PostgreSQL
**Authentication:** JWT
**Payments:** Razorpay
**Recommendations:** TF-IDF + Collaborative Filtering

## Features

### Instructor Portal

* Create, update, and delete courses
* Add and manage lessons
* Publish courses
* Manage course content

### Student Portal

* Browse and search courses
* Enroll in free courses
* Purchase paid courses through Razorpay
* Access course lessons
* Rate courses
* Get personalized course recommendations

### Other Features

* JWT-based authentication
* Instructor and Student roles
* Concurrency-safe course enrollment
* Course ratings and average rating calculation
* Razorpay payment verification on the backend
* Hybrid course recommendation system

## Project Structure

```text
EdTech Platform
│
├── backend/
│   ├── users/              # User authentication and roles
│   ├── courses/            # Course and lesson APIs
│   ├── enrollments/        # Course enrollment
│   ├── ratings/            # Course ratings
│   ├── payments/           # Razorpay payment handling
│   └── recommendations/   # Recommendation engine
│
└── frontend/               # React application
```

## Getting Started

### 1. Backend Setup

Go to the backend folder:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it:

**Windows:**

```bash
venv\Scripts\activate
```

**macOS/Linux:**

```bash
source venv/bin/activate
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file from the example:

```bash
cp .env.example .env
```

For Windows, you can also simply copy `.env.example` and rename it to `.env`.

Add your Django secret key and Razorpay test credentials to the `.env` file.

Run the migrations:

```bash
python manage.py migrate
```

If you want access to the Django admin panel:

```bash
python manage.py createsuperuser
```

Start the backend:

```bash
python manage.py runserver
```

The backend will be available at:

```text
http://localhost:8000
```

The project uses SQLite by default, so there is no additional database setup required.

PostgreSQL can also be configured through the database variables in `.env`.

---

### 2. Frontend Setup

Open another terminal and go to the frontend folder:

```bash
cd frontend
```

Install the dependencies:

```bash
npm install
```

Create your `.env` file and add the Razorpay test Key ID:

```text
REACT_APP_RAZORPAY_KEY_ID=your_key_id
```

Start the React application:

```bash
npm start
```

The frontend will be available at:

```text
http://localhost:3000
```

## Razorpay Test Payments

The project uses Razorpay's test environment, so no real payment is made during testing.

To get test credentials:

1. Create an account on the Razorpay dashboard.
2. Switch to **Test Mode**.
3. Go to **Settings → API Keys**.
4. Generate a test key.
5. Add the Key ID and Key Secret to the backend `.env` file.

For testing card payments, you can use:

```text
Card: 4111 1111 1111 1111
Expiry: Any future date
CVV: Any valid CVV
```

## How to Test the Application

You can test the main flow with two different accounts.

### Instructor

1. Create an account as an Instructor.
2. Create a course.
3. Add a few lessons.
4. Publish the course.

### Student

1. Create another account as a Student.
2. Browse the available courses.
3. Enroll in a free course or purchase a paid course.
4. Open the course and view the lessons.
5. Leave a rating.

To see the recommendation system in action, create a few student accounts and have them enroll in and rate different courses. The recommendations will use this activity to suggest relevant courses.

## Some Technical Details

### Preventing Duplicate Enrollments

Enrollment is protected at the database level using a unique constraint on the combination of student and course.

The enrollment creation process also uses a database transaction and handles `IntegrityError`.

This means that even if two enrollment requests arrive at almost the same time, the same student cannot accidentally get two enrollment records for the same course.

### Rating Updates

Course ratings are calculated inside a transaction while locking the relevant course row.

This helps prevent incorrect average ratings when multiple users submit ratings at nearly the same time.

### Payment Security

The backend does not trust the payment amount or success status sent by the frontend.

The payment amount is taken from the course stored in the database, and Razorpay's payment signature is verified on the server before access to the course is granted.

### Course Recommendations

The recommendation system combines two approaches:

**Content-based recommendations**

TF-IDF and cosine similarity are used to compare course descriptions and tags.

**Collaborative filtering**

The system also looks at ratings from different students to find courses that similar users enjoyed.

These two approaches are combined to create the final recommendations.

There are also fallbacks for new users and courses that do not have enough ratings yet.

## Future Improvements

Some things I'd like to add to the project in the future:

* Video and file uploads for course lessons
* Course progress tracking
* Email notifications for enrollments and payments
* More comprehensive automated tests
* Better recommendation models as more user data becomes available
* Deployment of the backend and frontend to a cloud platform

## Project Goal

I built this project to get hands-on experience with full-stack development, REST APIs, authentication, database transactions, payment integration, and recommendation systems.

It also gave me an opportunity to work with some real-world backend problems such as concurrent requests, data consistency, and server-side payment validation.
