<?php
session_start();
require_once 'db.php';
require_once 'audit_utils.php';

$conn = getDB();
logAction($conn, "User Logout", $_SESSION['user_id'] ?? null);

session_unset();
session_destroy();
echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
exit;
?>
