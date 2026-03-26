<?php
// api/audit_utils.php

/**
 * Log an action in the audit_logs table
 *
 * @param mysqli $conn The database connection
 * @param string $action The action performed (e.g. "Created Certificate")
 * @param string|int|null $affected_id The ID of the affected record
 * @param array|string|null $details Additional details for the log
 * @return bool True if logging was successful
 */
function logAction($conn, $action, $affected_id = null, $details = null) {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    $userId = $_SESSION['user_id'] ?? null;
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '';
    
    // JSON encode details if it's an array
    if (is_array($details)) {
        $details = json_encode($details);
    }

    $stmt = $conn->prepare("INSERT INTO audit_logs (user_id, action, affected_id, details, ip_address) VALUES (?, ?, ?, ?, ?)");
    if (!$stmt) {
        error_log("Failed to prepare audit log statement: " . $conn->error);
        return false;
    }

    $stmt->bind_param("issss", $userId, $action, $affected_id, $details, $ipAddress);
    $result = $stmt->execute();
    $stmt->close();

    return $result;
}
?>
