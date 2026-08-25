<?php
require 'public/api/config.php';
$conn->query("UPDATE users SET role='super_admin' WHERE email='info@azariahmg.com'");
echo 'Done';
?>
