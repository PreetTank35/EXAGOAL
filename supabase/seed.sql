-- ============================================================
-- Faraway LMS — Seed Data for Local Development
-- ============================================================
-- NOTE: This seed file assumes you have already created users
-- via Supabase Auth (Dashboard or CLI). The UUIDs below are
-- placeholders — replace them with real auth.users IDs after
-- creating test accounts.
--
-- Recommended test accounts to create in Supabase Auth:
--   admin@faraway.dev      (role: admin)
--   instructor1@faraway.dev (role: instructor)
--   instructor2@faraway.dev (role: instructor)
--   student1@faraway.dev   (role: student)
--   student2@faraway.dev   (role: student)
--   student3@faraway.dev   (role: student)
-- ============================================================

-- After creating users in Supabase Auth, update their profiles:
-- (The trigger will have auto-created rows; we just update them)

-- UPDATE public.profiles SET
--     full_name = 'Admin User',
--     role = 'admin',
--     bio = 'Platform administrator'
-- WHERE id = '<ADMIN_UUID>';

-- UPDATE public.profiles SET
--     full_name = 'Dr. Sarah Chen',
--     role = 'instructor',
--     bio = 'Senior software architect with 15 years of experience in distributed systems.'
-- WHERE id = '<INSTRUCTOR_1_UUID>';

-- UPDATE public.profiles SET
--     full_name = 'Marcus Rivera',
--     role = 'instructor',
--     bio = 'Data scientist and ML engineer. Previously at Google Brain and OpenAI.'
-- WHERE id = '<INSTRUCTOR_2_UUID>';

-- ============================================================
-- SAMPLE COURSES (use instructor UUIDs after creating accounts)
-- ============================================================

-- For local testing, you can insert directly if you manually
-- set up auth users first. Below is a template:

/*
-- Course 1: Full-Stack Web Development
INSERT INTO public.courses (id, instructor_id, title, slug, description, difficulty, status, category)
VALUES (
    uuid_generate_v4(),
    '<INSTRUCTOR_1_UUID>',
    'Full-Stack Web Development Masterclass',
    'fullstack-web-dev',
    'Master modern web development from front to back. Build real-world applications with React, Node.js, and PostgreSQL. Covers authentication, deployment, testing, and production best practices.',
    'intermediate',
    'published',
    'engineering'
);

-- Course 2: Machine Learning Fundamentals
INSERT INTO public.courses (id, instructor_id, title, slug, description, difficulty, status, category)
VALUES (
    uuid_generate_v4(),
    '<INSTRUCTOR_2_UUID>',
    'Machine Learning Fundamentals',
    'ml-fundamentals',
    'A rigorous introduction to machine learning theory and practice. From linear regression to neural networks, learn the math and code behind modern AI systems.',
    'intermediate',
    'published',
    'data-science'
);

-- Course 3: Python for Beginners
INSERT INTO public.courses (id, instructor_id, title, slug, description, difficulty, status, category)
VALUES (
    uuid_generate_v4(),
    '<INSTRUCTOR_1_UUID>',
    'Python Programming for Beginners',
    'python-beginners',
    'Start your programming journey with Python. No prior experience needed. Learn variables, loops, functions, data structures, and build your first projects.',
    'beginner',
    'published',
    'engineering'
);

-- Course 4: Advanced System Design
INSERT INTO public.courses (id, instructor_id, title, slug, description, difficulty, status, category)
VALUES (
    uuid_generate_v4(),
    '<INSTRUCTOR_1_UUID>',
    'Advanced System Design',
    'advanced-system-design',
    'Design systems that scale to millions of users. Cover load balancing, caching, message queues, microservices, and distributed databases with real-world case studies.',
    'advanced',
    'published',
    'engineering'
);
*/

-- ============================================================
-- SAMPLE LESSONS TEMPLATE
-- ============================================================

/*
-- Lessons for Full-Stack Web Dev (replace course_id)
INSERT INTO public.lessons (course_id, title, content_md, order_index, duration_minutes) VALUES
('<COURSE_1_UUID>', 'Introduction to Web Development', '# Welcome to Full-Stack Web Development

In this lesson, we will cover the fundamentals of how the web works.

## What You Will Learn
- How HTTP requests and responses work
- The client-server model
- Frontend vs Backend responsibilities
- Setting up your development environment

## The Client-Server Model

The web is built on a simple idea: **clients** (browsers) send **requests** to **servers**, which send back **responses**.

```
Browser (Client) ---HTTP Request---> Server
Browser (Client) <--HTTP Response--- Server
```

Every time you visit a website, this cycle repeats hundreds of times — loading HTML, CSS, JavaScript, images, and data.

## Key Takeaways
1. The web runs on HTTP
2. Browsers are clients, your code runs on servers
3. Frontend = what users see, Backend = the logic and data
', 0, 15),

('<COURSE_1_UUID>', 'HTML & CSS Foundations', '# HTML & CSS Foundations

The building blocks of every website.

## HTML: Structure
HTML (HyperText Markup Language) defines the **structure** of a web page.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My First Page</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>This is my first web page.</p>
</body>
</html>
```

## CSS: Style
CSS (Cascading Style Sheets) controls **how** elements look.

```css
h1 {
    color: #6366f1;
    font-family: "Inter", sans-serif;
}
```

## Practice Exercise
Create a personal landing page with your name, a photo, and three facts about yourself.
', 1, 25),

('<COURSE_1_UUID>', 'JavaScript Essentials', '# JavaScript Essentials

Adding interactivity to your web pages.

## Variables and Data Types

```javascript
const name = "Faraway";
let count = 0;
const isActive = true;
const courses = ["JS", "Python", "Go"];
```

## Functions

```javascript
function greet(name) {
    return `Hello, ${name}! Welcome to Faraway.`;
}

// Arrow functions
const add = (a, b) => a + b;
```

## DOM Manipulation

```javascript
const button = document.querySelector("#enroll-btn");
button.addEventListener("click", () => {
    alert("You are now enrolled!");
});
```
', 2, 30),

('<COURSE_1_UUID>', 'React Fundamentals', '# React Fundamentals

Building modern user interfaces with components.

## Why React?
- Component-based architecture
- Virtual DOM for performance
- Massive ecosystem and community

## Your First Component

```jsx
function CourseCard({ title, instructor }) {
    return (
        <div className="course-card">
            <h3>{title}</h3>
            <p>By {instructor}</p>
        </div>
    );
}
```

## State Management with Hooks

```jsx
import { useState } from "react";

function EnrollButton() {
    const [enrolled, setEnrolled] = useState(false);

    return (
        <button onClick={() => setEnrolled(true)}>
            {enrolled ? "Enrolled ✓" : "Enroll Now"}
        </button>
    );
}
```
', 3, 35),

('<COURSE_1_UUID>', 'Building a REST API with Node.js', '# Building a REST API

Server-side development with Express.js.

## Setting Up Express

```javascript
import express from "express";
const app = express();

app.use(express.json());

app.get("/api/courses", (req, res) => {
    res.json({ courses: [] });
});

app.listen(3001, () => {
    console.log("API running on port 3001");
});
```

## RESTful Design Principles
| Method | Path | Action |
|--------|------|--------|
| GET | /courses | List all courses |
| POST | /courses | Create a course |
| GET | /courses/:id | Get one course |
| PUT | /courses/:id | Update a course |
| DELETE | /courses/:id | Delete a course |
', 4, 40);
*/

-- ============================================================
-- USAGE INSTRUCTIONS
-- ============================================================
-- 1. Create test user accounts in Supabase Auth Dashboard
-- 2. Copy UUIDs from the auth.users table
-- 3. Uncomment the sections above and replace placeholder UUIDs
-- 4. Run this file in the Supabase SQL Editor
-- ============================================================
