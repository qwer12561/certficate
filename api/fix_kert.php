<?php
require_once 'db.php';
$conn = getDB();
$sql = "UPDATE users SET role = 'admin' WHERE username = 'kert'";
if ($conn->query($sql)) {
    echo "Kert role updated to admin.\n";
} else {
    echo "Error: " . $conn->error . "\n";
}
$conn->close();
?>
