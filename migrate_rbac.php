<?php
require_once 'api/db.php';
$conn = getDB();

// Add role column if it doesn't exist
$sql_add_column = "ALTER TABLE users ADD COLUMN role ENUM('admin', 'editor', 'viewer') NOT NULL DEFAULT 'viewer'";
if ($conn->query($sql_add_column)) {
    echo "Role column added successfully.\n";
} else {
    echo "Error adding column (maybe it already exists): " . $conn->error . "\n";
}

// Update kert to admin
$sql_update_admin = "UPDATE users SET role = 'admin' WHERE username = 'kert'";
if ($conn->query($sql_update_admin)) {
    echo "User 'kert' updated to admin.\n";
} else {
    echo "Error updating user: " . $conn->error . "\n";
}

$conn->close();
?>
