<?php
$conn = new mysqli('localhost', 'root', '', 'certificate_db');
$res = $conn->query("DESCRIBE users");
while($row = $res->fetch_assoc()) {
    print_r($row);
}
?>
