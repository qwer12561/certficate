<?php
require_once 'db.php';
$conn = getDB();

$username = 'viewer';
$password = 'viewer123';
$role = 'viewer';
$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $username, $hash, $role);

if ($stmt->execute()) {
    echo "Viewer user created successfully.\n";
} else {
    echo "Error creating viewer user: " . $stmt->error . "\n";
}

$conn->close();
?>
