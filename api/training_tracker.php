<?php
// api/training_tracker.php
session_start();
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    http_response_code(401);
    exit(json_encode(['success' => false, 'error' => 'Unauthorized']));
}
$role = $_SESSION['role'] ?? 'viewer';
require_once 'db.php';
require_once 'db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$conn = getDB();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Fetch all training records
        $sql = "SELECT * FROM training_tracker ORDER BY start_date DESC";
        $result = $conn->query($sql);
        
        $records = [];
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $records[] = $row;
            }
        }
        
        echo json_encode([
            'success' => true,
            'data' => $records
        ]);
        break;

    case 'POST':
        if ($role === 'viewer') {
            http_response_code(403);
            exit(json_encode(['success' => false, 'error' => 'Forbidden: Editors or Admins only']));
        }
        // Create matching a new record
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
            exit;
        }

        $stmt = $conn->prepare("INSERT INTO training_tracker 
            (start_date, end_date, type_of_activity, host_office, activity, instructors, participants, no_of_pax, venue, status, status_update_1, status_update_2, status_update_3, documentations, reports) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            
        $stmt->bind_param("sssssssisssssss", 
            $input['start_date'],
            $input['end_date'],
            $input['type_of_activity'],
            $input['host_office'],
            $input['activity'],
            $input['instructors'],
            $input['participants'],
            $input['no_of_pax'],
            $input['venue'],
            $input['status'],
            $input['status_update_1'],
            $input['status_update_2'],
            $input['status_update_3'],
            $input['documentations'],
            $input['reports']
        );

        if ($stmt->execute()) {
            $newId = $conn->insert_id;
            echo json_encode(['success' => true, 'id' => $newId]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to create record: ' . $stmt->error]);
        }
        
        $stmt->close();
        break;

    case 'PUT':
        if ($role === 'viewer') {
            http_response_code(403);
            exit(json_encode(['success' => false, 'error' => 'Forbidden: Editors or Admins only']));
        }
        // Update an existing record
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || !isset($input['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid JSON or missing ID']);
            exit;
        }

        $stmt = $conn->prepare("UPDATE training_tracker SET 
            start_date = ?, 
            end_date = ?, 
            type_of_activity = ?, 
            host_office = ?, 
            activity = ?, 
            instructors = ?, 
            participants = ?, 
            no_of_pax = ?, 
            venue = ?, 
            status = ?, 
            status_update_1 = ?, 
            status_update_2 = ?, 
            status_update_3 = ?, 
            documentations = ?, 
            reports = ? 
            WHERE id = ?");
            
        $stmt->bind_param("sssssssisssssssi", 
            $input['start_date'],
            $input['end_date'],
            $input['type_of_activity'],
            $input['host_office'],
            $input['activity'],
            $input['instructors'],
            $input['participants'],
            $input['no_of_pax'],
            $input['venue'],
            $input['status'],
            $input['status_update_1'],
            $input['status_update_2'],
            $input['status_update_3'],
            $input['documentations'],
            $input['reports'],
            $input['id']
        );

        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to update record: ' . $stmt->error]);
        }
        
        $stmt->close();
        break;

    case 'DELETE':
        if ($role !== 'admin') {
            http_response_code(403);
            exit(json_encode(['success' => false, 'error' => 'Forbidden: Admins only']));
        }
        // Delete a record
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing ID parameter']);
            exit;
        }
        
        $id = (int)$_GET['id'];
        $stmt = $conn->prepare("DELETE FROM training_tracker WHERE id = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to delete record: ' . $stmt->error]);
        }
        
        $stmt->close();
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        break;
}

$conn->close();
?>
