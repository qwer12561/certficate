<?php
// api/received_letters.php
session_start();
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    http_response_code(401);
    exit(json_encode(['success' => false, 'error' => 'Unauthorized']));
}
$role = $_SESSION['role'] ?? 'viewer';
require_once 'db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$conn = getDB();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $sql = "SELECT * FROM training_received_letters ORDER BY id DESC";
        $result = $conn->query($sql);
        
        $records = [];
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $records[] = $row;
            }
        }
        
        echo json_encode(['success' => true, 'data' => $records]);
        break;

    case 'POST':
        if ($role === 'viewer') {
            http_response_code(403);
            exit(json_encode(['success' => false, 'error' => 'Forbidden: Editors or Admins only']));
        }
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            http_response_code(400);
            exit(json_encode(['success' => false, 'error' => 'Invalid JSON']));
        }

        $stmt = $conn->prepare("INSERT INTO training_received_letters 
            (received_date, date_of_activity, type_of_activity, host_office, activity, instructor_participants, no_of_pax, venue, status, actioned_communication, remarks_admin, remarks_training, response_remarks) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            
        $stmt->bind_param("ssssssissssss", 
            $input['received_date'],
            $input['date_of_activity'],
            $input['type_of_activity'],
            $input['host_office'],
            $input['activity'],
            $input['instructor_participants'],
            $input['no_of_pax'],
            $input['venue'],
            $input['status'],
            $input['actioned_communication'],
            $input['remarks_admin'],
            $input['remarks_training'],
            $input['response_remarks']
        );

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'id' => $conn->insert_id]);
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
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || !isset($input['id'])) {
            http_response_code(400);
            exit(json_encode(['success' => false, 'error' => 'Invalid JSON or missing ID']));
        }

        $stmt = $conn->prepare("UPDATE training_received_letters SET 
            received_date = ?, 
            date_of_activity = ?, 
            type_of_activity = ?, 
            host_office = ?, 
            activity = ?, 
            instructor_participants = ?, 
            no_of_pax = ?, 
            venue = ?, 
            status = ?, 
            actioned_communication = ?, 
            remarks_admin = ?, 
            remarks_training = ?, 
            response_remarks = ? 
            WHERE id = ?");
            
        $stmt->bind_param("ssssssissssssi", 
            $input['received_date'],
            $input['date_of_activity'],
            $input['type_of_activity'],
            $input['host_office'],
            $input['activity'],
            $input['instructor_participants'],
            $input['no_of_pax'],
            $input['venue'],
            $input['status'],
            $input['actioned_communication'],
            $input['remarks_admin'],
            $input['remarks_training'],
            $input['response_remarks'],
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
        if (!isset($_GET['id'])) {
            http_response_code(400);
            exit(json_encode(['success' => false, 'error' => 'Missing ID parameter']));
        }
        
        $id = (int)$_GET['id'];
        $stmt = $conn->prepare("DELETE FROM training_received_letters WHERE id = ?");
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
