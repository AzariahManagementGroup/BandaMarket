<?php
$_SERVER['REQUEST_URI'] = '/api/signin';
$_SERVER['REQUEST_METHOD'] = 'POST';
$input = json_encode(['email' => 'info@azariahmg.com', 'password' => '12345678']); // arbitrary password
// Mock file_get_contents("php://input") using a temporary file
$tempInput = tmpfile();
fwrite($tempInput, $input);
fseek($tempInput, 0);

// We need to override file_get_contents in index.php somehow? No, we can just change how index.php reads input if we can't mock php://input easily, OR we use cURL.
