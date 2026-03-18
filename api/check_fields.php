<?php
$conn = new mysqli('localhost', 'root', '', 'certificate_db');
$res = $conn->query("DESCRIBE users");
$fields = [];
while($row = $res->fetch_assoc()) {
    $fields[] = $row['Field'];
}
echo "FIELDS: " . implode(", ", $fields);
?>
