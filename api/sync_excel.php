<?php
session_start();
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    http_response_code(401);
    exit(json_encode(['success' => false, 'error' => 'Unauthorized']));
}
// api/sync_excel.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Get the raw POST data
$data = file_get_contents('php://input');

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No data received']);
    exit;
}

// Ensure the directory is writable
$filename = '../Training_Tracker.xlsx';
$directory = dirname($filename);

if (!is_writable($directory)) {
    // Attempt to touch the file if it doesn't exist to see if we can write to it
    if (!file_exists($filename)) {
        if (!@touch($filename)) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Root directory is not writable. Cannot save Excel file.']);
            exit;
        }
    } else {
        if (!is_writable($filename)) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Excel file is not writable.']);
            exit;
        }
    }
}

// Save the file
if (file_put_contents($filename, $data)) {
    echo json_encode(['success' => true, 'message' => 'Excel file updated successfully', 'filename' => 'Training_Tracker.xlsx']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save Excel file']);
}
?>
