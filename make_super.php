<?php
require 'public/api/config.php';
$conn->query("UPDATE users SET role='admin' WHERE email='info@azariahmg.com'");
echo 'done';
?>
