<?php
// Endpoint: /api/send-email (Compatible with Namecheap cPanel PHP & standard SMTP)
require_once __DIR__ . '/config.php';

if ($request_method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($request_method === 'POST') {
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);

    $toEmail = isset($data['to']) ? trim($data['to']) : '';
    $subject = isset($data['subject']) ? trim($data['subject']) : '';
    $htmlBody = isset($data['html']) ? trim($data['html']) : (isset($data['text']) ? nl2br(trim($data['text'])) : '');

    if (empty($toEmail) || empty($subject) || empty($htmlBody)) {
        http_response_code(400);
        echo json_encode(["error" => "Missing required fields: to, subject, or body."]);
        exit();
    }

    // Call Namecheap-optimized PHP email dispatcher
    $sent = send_html_email($toEmail, $subject, $htmlBody, $conn);

    if ($sent) {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Email dispatched successfully via PHP Namecheap Mailer to " . $toEmail,
            "recipient" => $toEmail,
            "subject" => $subject
        ]);
        exit();
    } else {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "error" => "Failed to send email. Check SMTP credentials or PHP mail configuration on Namecheap server."
        ]);
        exit();
    }
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed. Use POST."]);
?>
