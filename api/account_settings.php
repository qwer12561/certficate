<?php
session_start();
header('Content-Type: application/json');
require_once 'db.php';
require_once 'db.php';

// Authentication Check
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit;
}

$user_id = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

if ($method === 'GET') {
    // Return current username
    $stmt = $db->prepare("SELECT username FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($user = $result->fetch_assoc()) {
        echo json_encode(['success' => true, 'username' => $user['username']]);
    } else {
        echo json_encode(['success' => false, 'error' => 'User not found']);
    }
} 
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $current_password = $data['current_password'] ?? '';
    $new_username = $data['new_username'] ?? '';
    $new_password = $data['new_password'] ?? '';
    
    if (empty($current_password)) {
        echo json_encode(['success' => false, 'error' => 'Current password is required']);
        exit;
    }

    // Verify current password
    $stmt = $db->prepare("SELECT password_hash FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if (!$user || !password_verify($current_password, $user['password_hash'])) {
        echo json_encode(['success' => false, 'error' => 'Incorrect current password']);
        exit;
    }

    // Update username if provided
    if (!empty($new_username)) {
        // Check if username is already taken by someone else
        $stmt = $db->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
        $stmt->bind_param("si", $new_username, $user_id);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) {
            echo json_encode(['success' => false, 'error' => 'Username already taken']);
            exit;
        }

        $stmt = $db->prepare("UPDATE users SET username = ? WHERE id = ?");
        $stmt->bind_param("si", $new_username, $user_id);
        if ($stmt->execute()) {
            $_SESSION['username'] = $new_username; // Update session
        }
    }

    // Update password if provided
    if (!empty($new_password)) {
        $new_hash = password_hash($new_password, PASSWORD_DEFAULT);
        $stmt = $db->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
        $stmt->bind_param("si", $new_hash, $user_id);
        if ($stmt->execute()) {
        }
    }

    echo json_encode(['success' => true, 'message' => 'Account settings updated successfully']);
}

$db->close();
