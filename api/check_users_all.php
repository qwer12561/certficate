<?php
require_once 'db.php';
$conn = getDB();
$result = $conn->query("SELECT id, username, role FROM users");
while ($row = $result->fetch_assoc()) {
    echo "ID: " . $row['id'] . " | Username: " . $row['username'] . " | Role: " . $row['role'] . "\n";
}
$conn->close();
?>
