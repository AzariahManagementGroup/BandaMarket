<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$configFile = __DIR__ . '/payment_settings.json';
$envFile = __DIR__ . '/.env';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($configFile)) {
        echo file_get_contents($configFile);
    } else {
        echo json_encode(["success" => true, "payment" => []]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Save to JSON for UI
    file_put_contents($configFile, json_encode(["success" => true, "payment" => $data], JSON_PRETTY_PRINT));
    
    // Save to .env
    $envContent = "";
    if (isset($data['environment'])) {
        $envContent .= "TRANZAK_ENV=" . strtoupper($data['environment']) . "\n";
    }
    if (isset($data['tranzakAppId'])) {
        $envContent .= "TRANZAK_APP_ID=" . $data['tranzakAppId'] . "\n";
    }
    if (isset($data['tranzakAppKey'])) {
        $envContent .= "TRANZAK_APP_KEY=" . $data['tranzakAppKey'] . "\n";
    }
    
    // Append to existing .env or create new
    if (file_exists($envFile)) {
        $existing = file_get_contents($envFile);
        // Replace existing keys or append
        $lines = explode("\n", $existing);
        $newLines = [];
        foreach ($lines as $line) {
            if (strpos($line, 'TRANZAK_') !== 0) {
                $newLines[] = $line;
            }
        }
        $envContent = implode("\n", $newLines) . "\n" . $envContent;
    }
    
    file_put_contents($envFile, trim($envContent) . "\n");

    echo json_encode(["success" => true]);
}
?>
