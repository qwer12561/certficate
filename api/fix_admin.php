<?php
require_once 'db.php';
$conn = getDB();

$password = 'admin123';
$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare("UPDATE users SET password_hash = ? WHERE username = 'admin'");
$stmt->bind_param("s", $hash);

if ($stmt->execute()) {
    echo "Admin password updated successfully. New hash: " . $hash . "\n";
} else {
    echo "Error updating password: " . $stmt->error . "\n";
}

$conn->close();
?>
