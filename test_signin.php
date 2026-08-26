<?php
// Mock request data
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['REQUEST_URI'] = '/api/signin';
$inputData = json_encode(['email' => 'info@azariahmg.com', 'password' => 'test']);
file_put_contents('php://input', $inputData);

// To ensure we see ALL warnings
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Capture output
ob_start();
require 'public/api/index.php';
$output = ob_get_clean();
echo "OUTPUT:\n" . $output;
?>
