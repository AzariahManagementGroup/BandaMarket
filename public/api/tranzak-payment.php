<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit();
}

// 1. Read API Keys from payment_settings.json
$settingsFile = __DIR__ . '/payment_settings.json';
$appId = "";
$appKey = "";
$isSandbox = true;

if (file_exists($settingsFile)) {
    $settings = json_decode(file_get_contents($settingsFile), true);
    if (isset($settings['payment'])) {
        $appId = $settings['payment']['tranzakAppId'] ?? '';
        $appKey = $settings['payment']['tranzakAppKey'] ?? '';
        $isSandbox = ($settings['payment']['environment'] ?? 'sandbox') === 'sandbox';
    }
}

if (empty($appId) || empty($appKey)) {
    http_response_code(500);
    echo json_encode(["error" => "Tranzak API keys not configured on server"]);
    exit();
}

$baseUrl = $isSandbox ? "https://sandbox.tranzak.me" : "https://api.tranzak.me";

// 2. Generate Auth Token
function getTranzakToken($baseUrl, $appId, $appKey) {
    $ch = curl_init($baseUrl . "/auth/token");
    $payload = json_encode(["appId" => $appId, "appKey" => $appKey]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    
    $response = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpcode >= 200 && $httpcode < 300) {
        $data = json_decode($response, true);
        return $data['data']['token'] ?? null; // Adjust based on Tranzak exact response format
    }
    return null;
}

$token = getTranzakToken($baseUrl, $appId, $appKey);
if (!$token) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to authenticate with Tranzak"]);
    exit();
}

// 3. Process Payment Request
$input = json_decode(file_get_contents("php://input"), true);
$method = $input['method'] ?? 'web';
$amount = $input['amount'] ?? 0;
$currency = $input['currencyCode'] ?? 'XAF';
$description = $input['description'] ?? 'Event Registration';
$returnUrl = $input['returnUrl'] ?? 'http://localhost:8080/payment-success';
$mcc = $input['mobileWalletNumber'] ?? '';

$requestBody = [
    "amount" => $amount,
    "currencyCode" => $currency,
    "description" => $description,
    "payerNote" => "Payment for CameMark Forum"
];

$endpoint = "/xp021/v1/request/create"; // Default: Web Redirect
if ($method === 'momo' && !empty($mcc)) {
    $endpoint = "/xp021/v1/request/create-mobile-wallet-charge";
    $requestBody["mobileWalletNumber"] = $mcc;
} elseif ($method === 'qr') {
    $endpoint = "/xp021/v1/request/create-in-store-charge";
    // QR might require additional config depending on docs, we assume standard payload for now
} else {
    // Web redirect specific fields
    $requestBody["returnUrl"] = $returnUrl;
}

$ch = curl_init($baseUrl . $endpoint);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestBody));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $token
]);

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpcode >= 200 && $httpcode < 300) {
    echo $response; // Return Tranzak response to frontend (contains payment link or MoMo prompt info)
} else {
    http_response_code(500);
    echo json_encode(["error" => "Payment initiation failed", "details" => json_decode($response)]);
}
?>
