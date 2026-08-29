<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit();
}

require_once __DIR__ . '/config.php'; // gives us send_html_email(), $conn

// ─── Helper: Build a premium invoice HTML ─────────────────────────────────────
function build_invoice_html($userName, $amount, $currency, $description, $method, $reference, $status = "Initiated") {
    $methodLabel = [
        'web'  => '💳 Web Redirect (Visa/Mastercard/MoMo via Tranzak)',
        'momo' => '📱 Mobile Money (MTN/Orange/OrangeMoney)',
        'qr'   => '📷 QR Code Payment',
    ][$method] ?? 'Payment';
    $date      = date('F j, Y \a\t H:i T');
    $firstName = explode(' ', trim($userName))[0];
    $statusColor = ($status === "Completed") ? "#059669" : "#d97706";

    return "
    <p>Dear <strong>$firstName</strong>,</p>
    <p>Your transaction has been <strong>$status</strong> on CameMark. Below is your payment invoice:</p>
    <table width='100%' cellpadding='10' cellspacing='0' style='border-collapse:collapse;margin:20px 0;font-size:14px;'>
      <tr style='background:#f1f5f9;'>
        <td style='padding:10px 14px;color:#64748b;font-weight:600;'>TRANSACTION REF</td>
        <td style='padding:10px 14px;font-family:monospace;color:#1e293b;'>$reference</td>
      </tr>
      <tr>
        <td style='padding:10px 14px;color:#64748b;font-weight:600;border-top:1px solid #e2e8f0;'>DESCRIPTION</td>
        <td style='padding:10px 14px;color:#1e293b;border-top:1px solid #e2e8f0;'>$description</td>
      </tr>
      <tr style='background:#f1f5f9;'>
        <td style='padding:10px 14px;color:#64748b;font-weight:600;'>PAYMENT METHOD</td>
        <td style='padding:10px 14px;color:#1e293b;'>$methodLabel</td>
      </tr>
      <tr>
        <td style='padding:10px 14px;color:#64748b;font-weight:600;border-top:1px solid #e2e8f0;'>DATE</td>
        <td style='padding:10px 14px;color:#1e293b;border-top:1px solid #e2e8f0;'>$date</td>
      </tr>
      <tr style='background:#ecfdf5;'>
        <td style='padding:14px;font-weight:700;font-size:16px;color:#064e3b;'>AMOUNT</td>
        <td style='padding:14px;font-weight:900;font-size:20px;color:#059669;'>$amount $currency</td>
      </tr>
      <tr>
        <td style='padding:10px 14px;color:#64748b;font-weight:600;border-top:1px solid #e2e8f0;'>STATUS</td>
        <td style='padding:10px 14px;border-top:1px solid #e2e8f0;'>
          <span style='background:$statusColor;color:#fff;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;'>$status</span>
        </td>
      </tr>
    </table>
    <p style='color:#64748b;font-size:13px;'>If you did not initiate this transaction, please contact our support team immediately at <a href='mailto:support@camemark.com'>support@camemark.com</a>.</p>
    <p style='margin-top:24px;'>Thank you for using <strong>CameMark</strong> 🇨🇲</p>
    ";
}

// ─── Helper: Send invoice email ────────────────────────────────────────────────
function send_invoice_email($userEmail, $userName, $amount, $currency, $description, $method, $reference, $conn) {
    if (empty($userEmail)) return;
    $subject   = "CameMark Payment Invoice — $reference";
    $body      = build_invoice_html($userName, $amount, $currency, $description, $method, $reference, "Initiated");
    
    // Send to user
    send_html_email($userEmail, $subject, $body, $conn);
    
    // Send copy to Admin
    $adminEmail = "podoremetropolis@gmail.com";
    $adminSubject = "[Admin Copy] " . $subject;
    send_html_email($adminEmail, $adminSubject, $body, $conn);
}

// ─── Read request ──────────────────────────────────────────────────────────────
$input       = json_decode(file_get_contents("php://input"), true);
$method      = $input['method']              ?? 'web';
$amount      = $input['amount']              ?? 0;
$currency    = $input['currencyCode']        ?? 'XAF';
$description = $input['description']         ?? 'CameMark Payment';
$returnUrl   = $input['returnUrl']           ?? 'https://camemark.com/payment-success';
$mcc         = $input['mobileWalletNumber']  ?? '';
$userEmail   = $input['userEmail']           ?? '';
$userName    = $input['userName']            ?? 'Valued Customer';
$reference   = 'TXN-' . strtoupper(bin2hex(random_bytes(6)));

// ─── Read API keys ─────────────────────────────────────────────────────────────
$settingsFile = __DIR__ . '/payment_settings.json';
$appId        = "";
$appKey       = "";
$isSandbox    = true;

if (file_exists($settingsFile)) {
    $settings  = json_decode(file_get_contents($settingsFile), true);
    if (isset($settings['payment'])) {
        $appId     = $settings['payment']['tranzakAppId']  ?? '';
        $appKey    = $settings['payment']['tranzakAppKey'] ?? '';
        $isSandbox = ($settings['payment']['environment']  ?? 'sandbox') === 'sandbox';
    }
}

// ─── Sandbox mock (no API keys configured) ────────────────────────────────────
if (empty($appId) || empty($appKey)) {
    if ($isSandbox) {
        // Send invoice email even in sandbox mode
        send_invoice_email($userEmail, $userName, $amount, $currency, $description, $method, $reference, $conn);

        if ($method === 'web') {
            echo json_encode([
                "success"   => true,
                "sandbox"   => true,
                "reference" => $reference,
                "data"      => ["paymentUrl" => "/cards-wallet?mock_payment=success&ref=$reference"]
            ]);
        } else {
            echo json_encode([
                "success"   => true,
                "sandbox"   => true,
                "reference" => $reference,
                "message"   => ($method === 'momo' ? "MoMo USSD push" : "QR payment") . " initiated. Check your phone (sandbox mode)."
            ]);
        }
        exit();
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Tranzak API keys not configured on server"]);
        exit();
    }
}

// ─── Live / Real Tranzak flow ─────────────────────────────────────────────────
$baseUrl = $isSandbox ? "https://sandbox.tranzak.me" : "https://api.tranzak.me";

function getTranzakToken($baseUrl, $appId, $appKey) {
    $ch = curl_init($baseUrl . "/auth/token");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(["appId" => $appId, "appKey" => $appKey]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    $response = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($httpcode >= 200 && $httpcode < 300) {
        $data = json_decode($response, true);
        return $data['data']['token'] ?? null;
    }
    return null;
}

$token = getTranzakToken($baseUrl, $appId, $appKey);
if (!$token) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to authenticate with Tranzak"]);
    exit();
}

$requestBody = [
    "amount"      => $amount,
    "currencyCode"=> $currency,
    "description" => $description,
    "payerNote"   => "Payment via CameMark"
];

$endpoint = "/xp021/v1/request/create";
if ($method === 'momo' && !empty($mcc)) {
    $endpoint                         = "/xp021/v1/request/create-mobile-wallet-charge";
    $requestBody["mobileWalletNumber"] = $mcc;
} elseif ($method === 'qr') {
    $endpoint = "/xp021/v1/request/create-in-store-charge";
} else {
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
    // Send invoice email after successful Tranzak response
    send_invoice_email($userEmail, $userName, $amount, $currency, $description, $method, $reference, $conn);
    $decoded = json_decode($response, true);
    $decoded['reference'] = $reference;
    echo json_encode($decoded);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Payment initiation failed", "details" => json_decode($response)]);
}
?>
