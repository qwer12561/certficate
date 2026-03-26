<?php
// api/get_audit_logs.php
session_start();
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    http_response_code(401);
    exit(json_encode(['success' => false, 'error' => 'Unauthorized']));
}

require_once 'db.php';
header('Content-Type: application/json');

$conn = getDB();

$sql = "SELECT al.*, u.username 
        FROM audit_logs al 
        LEFT JOIN users u ON al.user_id = u.id 
        ORDER BY al.created_at DESC 
        LIMIT 100";

$result = $conn->query($sql);

$logs = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $logs[] = $row;
    }
}

echo json_encode(['success' => true, 'data' => $logs]);

$conn->close();
?>
