# Database Setup Guide (PHP/MySQL)

## Step 1 — Install a Local Server

If you don't have one yet, download and install **XAMPP** (recommended):
👉 https://www.apachefriends.org/download.html

Install it, then launch **XAMPP Control Panel** and start:
- ✅ **Apache**
- ✅ **MySQL**

---

## Step 2 — Place the Project in the Web Root

Copy the entire `junpi` folder into XAMPP's web root:

```
C:\xampp\htdocs\junpi\
```

---

## Step 3 — Create the Database

1. Open your browser and go to: **http://localhost/phpmyadmin**
2. Click **"Import"** tab
3. Click **"Choose File"** → select `d:\junpi\setup.sql`
4. Click **"Go"**

This creates the `certificate_db` database and `certificates` table automatically.

---

## Step 4 — Configure Database Credentials

Open `api/db.php` and update if needed:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');   // your MySQL username
define('DB_PASS', '');       // your MySQL password (empty by default in XAMPP)
define('DB_NAME', 'certificate_db');
```

---

## Step 5 — Open the App

Go to: **http://localhost/junpi/**

> ⚠️ Do **NOT** open `index.html` directly as a file (`file:///...`). It must be served through Apache to enable the PHP API.

---

## That's it! ✅

| Feature | How it works |
|---|---|
| Create certificate | Saves to MySQL via `POST api/certificates.php` |
| View certificates | Loads from MySQL via `GET api/certificates.php` |
| Delete certificate | Removes from MySQL via `DELETE api/certificates.php?id=...` |
| Reprint/Search | Queries MySQL via `GET api/certificates.php?query=...` |
