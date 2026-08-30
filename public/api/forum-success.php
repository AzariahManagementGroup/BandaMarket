<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true);
$email = isset($input['email']) ? strtolower(trim($input['email'])) : '';
$transactionId = isset($input['transactionId']) ? trim($input['transactionId']) : '';
$requestId = isset($input['requestId']) ? trim($input['requestId']) : '';

if (empty($email)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Email is required"]);
    exit();
}

try {
    // Fetch registration record
    $stmt = $conn->prepare("SELECT * FROM forum_registrations WHERE email = ? LIMIT 1");
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "DB prepare error: " . $conn->error]);
        exit();
    }
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    $ticket = $result->fetch_assoc();
    $stmt->close();

    if (!$ticket) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Registration not found for this email"]);
        exit();
    }

    // Update payment status to confirmed if not already
    $emailSent = false;
    if ($ticket['payment_status'] !== 'confirmed') {
        $upd = $conn->prepare("UPDATE forum_registrations SET payment_status = 'confirmed', amount_paid = ? WHERE email = ?");
        if ($upd) {
            $amt = $ticket['amount_paid'] ?: '30,000 XAF';
            $upd->bind_param("ss", $amt, $email);
            $upd->execute();
            $upd->close();
        }
        $ticket['payment_status'] = 'confirmed';

        // Send confirmation email with pass details
        $name = htmlspecialchars($ticket['name']);
        $category = htmlspecialchars($ticket['category'] ?? 'Standard');
        $phone = htmlspecialchars($ticket['phone'] ?? '');
        $city = htmlspecialchars($ticket['city'] ?? '');
        $country = htmlspecialchars($ticket['country'] ?? '');
        $regId = $ticket['id'];
        $amount = htmlspecialchars($ticket['amount_paid'] ?: '30,000 XAF');
        $shortId = strtoupper(substr($regId, 0, 8));

        $body = "
        <h2 style='color:#064e3b;margin-top:0;'>🎟️ Your Forum Pass is Confirmed!</h2>
        <p>Dear <strong>{$name}</strong>, your payment has been received and your CameMark Forum pass is ready.</p>
        
        <div style='background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:20px 0;'>
            <div style='border-bottom:2px dashed #bbf7d0;padding-bottom:14px;margin-bottom:14px;'>
                <h3 style='margin:0;color:#065f46;font-size:16px;letter-spacing:1px;text-transform:uppercase;'>CameMark Forum Pass</h3>
                <p style='margin:4px 0 0;color:#6b7280;font-size:12px;letter-spacing:2px;text-transform:uppercase;'>{$category}</p>
            </div>
            <table style='width:100%;font-size:13px;color:#334155;'>
                <tr><td style='color:#6b7280;padding:4px 0;'>Name</td><td style='font-weight:700;text-align:right;'>{$name}</td></tr>
                <tr><td style='color:#6b7280;padding:4px 0;'>Email</td><td style='text-align:right;'>" . htmlspecialchars($email) . "</td></tr>
                <tr><td style='color:#6b7280;padding:4px 0;'>Phone</td><td style='text-align:right;'>{$phone}</td></tr>
                <tr><td style='color:#6b7280;padding:4px 0;'>Location</td><td style='text-align:right;'>{$city}, {$country}</td></tr>
                <tr><td style='color:#6b7280;padding:4px 0;'>Amount Paid</td><td style='font-weight:700;color:#059669;text-align:right;'>{$amount}</td></tr>
                <tr><td style='color:#6b7280;padding:4px 0;'>Pass ID</td><td style='font-family:monospace;font-size:11px;text-align:right;color:#6b7280;'>{$shortId}</td></tr>
            </table>
        </div>

        <div style='background:#fffbeb;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:0 8px 8px 0;margin:16px 0;'>
            <p style='margin:0;font-size:13px;color:#92400e;'>📅 <strong>Event Date:</strong> October 3–5, 2025 &nbsp;|&nbsp; 📍 <strong>Venue:</strong> Yaoundé, Cameroon</p>
        </div>

        <p style='font-size:13px;color:#64748b;'>Please save this email — it serves as your admission pass. Present it at the venue entrance.</p>
        <p style='font-size:13px;color:#64748b;'>For any questions, contact us at <a href='mailto:camermarketer@gmail.com' style='color:#059669;'>camermarketer@gmail.com</a></p>
        ";

        $emailSent = send_html_email($email, "🎟️ Your CameMark Forum Pass - Payment Confirmed", $body, $conn);
    }

    // Return ticket data to frontend
    echo json_encode([
        "success" => true,
        "ticket" => [
            "id" => $ticket['id'],
            "name" => $ticket['name'],
            "email" => $ticket['email'],
            "phone" => $ticket['phone'] ?? '',
            "category" => $ticket['category'] ?? 'Standard',
            "city" => $ticket['city'] ?? '',
            "country" => $ticket['country'] ?? '',
            "amount_paid" => $ticket['amount_paid'] ?: '30,000 XAF',
            "payment_status" => $ticket['payment_status'],
            "registered_at" => $ticket['registered_at'] ?? ''
        ],
        "email_sent" => $emailSent
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
}
?>
