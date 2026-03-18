<?php
session_start();
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    http_response_code(401);
    exit(json_encode(['success' => false, 'error' => 'Unauthorized']));
}
// ─────────────────────────────────────────────
//  Certificates API
//  GET    /api/certificates.php           → all certificates
//  GET    /api/certificates.php?query=X   → search by ID or name
//  POST   /api/certificates.php           → create certificate(s)
//  DELETE /api/certificates.php?id=X      → delete by ID
// ─────────────────────────────────────────────

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';
$db = getDB();

$method = $_SERVER['REQUEST_METHOD'];

// ── GET ─────────────────────────────────────────────────────────────
if ($method === 'GET') {
    // Search mode
    if (!empty($_GET['query'])) {
        $q = $db->real_escape_string($_GET['query']);
        $sql = "SELECT * FROM certificates
                WHERE id = '$q'
                   OR LOWER(recipient) = LOWER('$q')
                ORDER BY issued_at DESC
                LIMIT 10";
    } else {
        $sql = "SELECT * FROM certificates ORDER BY issued_at DESC";
    }

    $result = $db->query($sql);
    if (!$result) {
        echo json_encode(['success' => false, 'error' => $db->error]);
        exit;
    }

    $rows = [];
    while ($row = $result->fetch_assoc()) {
        // Decode signatories JSON column back to array
        $row['signatories'] = $row['signatories'] ? json_decode($row['signatories'], true) : [];
        // Map snake_case columns to camelCase for JS compatibility
        $row['bodyContent']  = $row['body_content'];
        $row['templatePath'] = $row['template_path'];
        $row['issuedAt']     = $row['issued_at'];
        $row['qrData']       = $row['qr_data'];
        unset($row['body_content'], $row['template_path'], $row['issued_at'], $row['qr_data']);
        $rows[] = $row;
    }

    echo json_encode(['success' => true, 'data' => $rows]);
    exit;
}

// ── POST ─────────────────────────────────────────────────────────────
if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);

    if (!$body) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid JSON body']);
        exit;
    }

    // Support both single cert and array of certs
    $certs = isset($body[0]) ? $body : [$body];
    $saved = 0;

    foreach ($certs as $cert) {
        $id           = $db->real_escape_string($cert['id']           ?? '');
        $recipient    = $db->real_escape_string($cert['recipient']    ?? '');
        $bodyContent  = $db->real_escape_string($cert['bodyContent']  ?? '');
        $date         = $db->real_escape_string($cert['date']         ?? date('Y-m-d'));
        $venue        = $db->real_escape_string($cert['venue']        ?? 'Provincial Capitol');
        $design       = $db->real_escape_string($cert['design']       ?? 'modern-blue');
        $type         = $db->real_escape_string($cert['type']         ?? 'recognition');
        $signatories  = $db->real_escape_string(json_encode($cert['signatories'] ?? []));
        $issuedAt     = $db->real_escape_string($cert['issuedAt']     ?? date('Y-m-d H:i:s'));
        $templatePath = $db->real_escape_string($cert['templatePath'] ?? '');
        $qrData       = $db->real_escape_string($cert['qrData']       ?? '');

        // Validate date format
        $dateValue = $date ? "'" . $date . "'" : 'NULL';

        $sql = "INSERT INTO certificates
                    (id, recipient, body_content, date, venue, design, template_path, type, signatories, issued_at, qr_data)
                VALUES
                    ('$id', '$recipient', '$bodyContent', $dateValue, '$venue', '$design', '$templatePath', '$type', '$signatories', '$issuedAt', '$qrData')
                ON DUPLICATE KEY UPDATE
                    recipient     = VALUES(recipient),
                    body_content  = VALUES(body_content),
                    date          = VALUES(date),
                    venue         = VALUES(venue),
                    design        = VALUES(design),
                    template_path = VALUES(template_path),
                    type          = VALUES(type),
                    signatories   = VALUES(signatories),
                    issued_at     = VALUES(issued_at),
                    qr_data       = VALUES(qr_data)";

        if ($db->query($sql)) {
            $saved++;
        } else {
            error_log('Certificate insert error: ' . $db->error);
        }
    }

    echo json_encode(['success' => true, 'saved' => $saved]);
    exit;
}

// ── DELETE ─────────────────────────────────────────────────────────────
if ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing id parameter']);
        exit;
    }

    $id  = $db->real_escape_string($id);
    $sql = "DELETE FROM certificates WHERE id = '$id'";

    if ($db->query($sql)) {
        echo json_encode(['success' => true, 'deleted' => $db->affected_rows]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $db->error]);
    }
    exit;
}

// ── Unsupported method ───────────────────────────────────────────────
http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
