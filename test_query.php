<?php require "public/api/config.php"; $res = $conn->query("SELECT * FROM users LIMIT 1"); print_r($res->fetch_assoc()); ?>
