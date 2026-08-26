<?php
$conn = new mysqli('localhost', 'root', '', 'camemark_db');
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
$res = $conn->query("DESCRIBE users");
while($row = $res->fetch_assoc()){
    print_r($row);
}
