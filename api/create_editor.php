<?php
require_once 'db.php';
$conn = getDB();

$username = 'editor';
$password = 'editor123';
$role = 'editor';
$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $username, $hash, $role);

if ($stmt->execute()) {
    echo "Editor user created successfully.\n";
} else {
    echo "Error creating editor user: " . $stmt->error . "\n";
}

$conn->close();
?>
