<?php
require_once 'db.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $email = $input['email'] ?? '';
    $code = $input['code'] ?? '';
    $password = $input['password'] ?? '';

    if (empty($email) || empty($code) || empty($password)) {
        echo json_encode(['success' => false, 'error' => 'Email, code, and password are required']);
        exit;
    }

    $stmt = $db->prepare("SELECT id FROM users WHERE email = ? AND reset_token = ? AND token_expiry > NOW()");
    $stmt->bind_param("ss", $email, $code);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($user = $result->fetch_assoc()) {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        
        // Update password and clear code
        $update_stmt = $db->prepare("UPDATE users SET password_hash = ?, reset_token = NULL, token_expiry = NULL WHERE id = ?");
        $update_stmt->bind_param("si", $hash, $user['id']);

        if ($update_stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Password updated successfully']);
        } else {
            echo json_encode(['success' => false, 'error' => 'Failed to update password']);
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'Invalid or expired security code']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
}

$db->close();
?>
