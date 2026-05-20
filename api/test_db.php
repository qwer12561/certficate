<?php
require 'db.php';
$conn = getDB();
$res = $conn->query('SELECT * FROM training_received_letters');
while($row = $res->fetch_assoc()) echo json_encode($row) . "\n";
$conn->close();
?>
