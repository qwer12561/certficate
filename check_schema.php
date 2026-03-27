<?php
require_once 'api/db.php';
$conn = getDB();
$res = $conn->query("DESCRIBE users");
while($row = $res->fetch_assoc()) {
    echo $row["Field"] . " : " . $row["Type"] . "\n";
}
$conn->close();
?>
