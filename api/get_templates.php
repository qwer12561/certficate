<?php
header('Content-Type: application/json');

$dir = '../templates/';
$templates = [];

if (is_dir($dir)) {
    $files = scandir($dir);
    foreach ($files as $file) {
        if (preg_match('/\.(jpg|jpeg|png|webp)$/i', $file)) {
            $templates[] = [
                'name' => pathinfo($file, PATHINFO_FILENAME),
                'file' => $file,
                'path' => 'templates/' . $file
            ];
        }
    }
}

echo json_encode(['success' => true, 'templates' => $templates]);
