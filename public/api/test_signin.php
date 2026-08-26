<?php
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['REQUEST_URI'] = '/api/signin';
$input = json_encode(['email' => 'info@azariahmg.com', 'password' => 'somepassword']);
file_put_contents('php://memory', $input); // Mocking php://input is hard in pure CLI if we just include index.php, let's just use curl instead.
