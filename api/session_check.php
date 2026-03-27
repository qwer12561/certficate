<?php
session_start();
header('Content-Type: application/json');
echo json_encode([
    'session' => $_SESSION,
    'id' => session_id()
]);
?>
