<?php
require_once 'db.php';
$conn = getDB();

$result = $conn->query("SELECT id, username, password_hash FROM users");
if ($result) {
    echo "Users found: " . $result->num_rows . "\n";
    while ($row = $result->fetch_assoc()) {
        echo "ID: " . $row['id'] . " | Username: " . $row['username'] . " | Hash: " . $row['password_hash'] . "\n";
        
        // Test verify
        if (password_verify('admin123', $row['password_hash'])) {
            echo "--- VERIFY SUCCESS for 'admin123' ---\n";
        } else {
            echo "--- VERIFY FAILED for 'admin123' ---\n";
        }
    }
} else {
    echo "Error: " . $conn->error . "\n";
}

$conn->close();
?>
