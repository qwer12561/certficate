<?php
// ─────────────────────────────────────────────
//  Database Configuration
//  Edit these values to match your MySQL setup
// ─────────────────────────────────────────────
define('DB_HOST', 'localhost');
define('DB_USER', 'root');       // Your MySQL username (default: root for XAMPP/WAMP)
define('DB_PASS', '');           // Your MySQL password (default: empty for XAMPP)
define('DB_NAME', 'certificate_db');

function getDB() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

    if ($conn->connect_error) {
        // Log locally if needed, but don't leak details to client
        error_log('Database connection failed: ' . $conn->connect_error);
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error'   => 'Database connection failed. Please contact your administrator.'
        ]);
        exit;
    }

    $conn->set_charset('utf8mb4');
    return $conn;
}
