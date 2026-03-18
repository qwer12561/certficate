<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'certificate_db');

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$result = $conn->query("SHOW TABLES LIKE 'users'");
if ($result->num_rows == 0) {
    echo "Table 'users' DOES NOT EXIST!\n";
} else {
    echo "Table 'users' exists.\n";
    $result = $conn->query("SELECT * FROM users");
    echo "Total users: " . $result->num_rows . "\n";
    while ($row = $result->fetch_assoc()) {
        echo "ID: " . $row['id'] . " | Username: " . $row['username'] . "\n";
        echo "Hash: " . $row['password_hash'] . "\n";
        if (password_verify('admin123', $row['password_hash'])) {
            echo "VERIFY: SUCCESS (admin123)\n";
        } else {
            echo "VERIFY: FAILED (admin123)\n";
        }
    }
}

$conn->close();
?>
