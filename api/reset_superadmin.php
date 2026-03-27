<?php
require_once 'db.php';
$conn = getDB();

$password = 'admin123';
$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare("UPDATE users SET password_hash = ? WHERE username = 'kert'");
$stmt->bind_param("s", $hash);

if ($stmt->execute()) {
    echo "Super Admin (kert) password updated successfully to 'admin123'.\n";
} else {
    echo "Error updating password: " . $stmt->error . "\n";
}

$conn->close();
?>
