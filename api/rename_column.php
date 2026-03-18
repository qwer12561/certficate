<?php
$conn = new mysqli('localhost', 'root', '', 'certificate_db');
if ($conn->connect_error) die("FAIL: " . $conn->connect_error);
$sql = "ALTER TABLE users CHANGE password password_hash VARCHAR(255) NOT NULL";
if ($conn->query($sql) === TRUE) {
    echo "RENAME SUCCESS";
} else {
    echo "FAIL: " . $conn->error;
}
$conn->close();
?>
