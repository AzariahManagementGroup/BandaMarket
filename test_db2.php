<?php
require 'public/api/config.php';
$res = $conn->query('SELECT email, role FROM users');
while($row = $res->fetch_assoc()) {
    echo $row['email'] . ' - ' . $row['role'] . "\n";
}
?>
