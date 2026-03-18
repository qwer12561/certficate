<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    $conn = new mysqli('localhost', 'root', '', 'certificate_db');
    if ($conn->connect_error) {
        die("FAIL: " . $conn->connect_error);
    }
    $hash = password_hash('admin123', PASSWORD_DEFAULT);
    $stmt = $conn->prepare("UPDATE users SET password_hash = ? WHERE username = 'admin'");
    $stmt->bind_param("s", $hash);
    if ($stmt->execute()) {
        echo "FIX SUCCESS";
    } else {
        echo "FAIL: " . $stmt->error;
    }
    $conn->close();
} catch (Exception $e) {
    echo "CAUGHT: " . $e->getMessage();
} catch (Error $e) {
    echo "CAUGHT ERROR: " . $e->getMessage();
}
?>
