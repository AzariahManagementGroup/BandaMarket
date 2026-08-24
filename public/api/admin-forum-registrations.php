<?php
require_once __DIR__ . '/config.php';

// Verify Auth Token
$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';

if (!$authHeader || strpos($authHeader, 'Bearer ') !== 0) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Generate some mock registration data since the database table `forum_registrations` doesn't exist yet
    $mockRegistrations = [
        [
            "id" => "REG-001",
            "name" => "Paul Biya",
            "email" => "p.biya@presidency.cm",
            "phone" => "+237 600000001",
            "organization" => "Government of Cameroon",
            "city" => "Yaoundé",
            "country" => "Cameroon",
            "category" => "VIP (100,000 CFA)",
            "payment_status" => "paid",
            "amount_paid" => "100,000 XAF",
            "registered_at" => "2026-08-20T10:00:00Z"
        ],
        [
            "id" => "REG-002",
            "name" => "Amadou Vamoulke",
            "email" => "avamoulke@crtv.cm",
            "phone" => "+237 671234567",
            "organization" => "CRTV",
            "city" => "Yaoundé",
            "country" => "Cameroon",
            "category" => "Premium (50,000 CFA)",
            "payment_status" => "pending",
            "amount_paid" => "0 XAF",
            "registered_at" => "2026-08-21T14:30:00Z"
        ],
        [
            "id" => "REG-003",
            "name" => "Sarah Johnson",
            "email" => "s.johnson@alibaba.com",
            "phone" => "+1 555-1234",
            "organization" => "Alibaba Africa",
            "city" => "San Francisco",
            "country" => "USA",
            "category" => "Business (500,000 CFA)",
            "payment_status" => "paid",
            "amount_paid" => "500,000 XAF",
            "registered_at" => "2026-08-22T09:15:00Z"
        ],
        [
            "id" => "REG-004",
            "name" => "Jean Pierre",
            "email" => "jean.pierre@mtn.cm",
            "phone" => "+237 650000000",
            "organization" => "MTN Mobile Money",
            "city" => "Douala",
            "country" => "Cameroon",
            "category" => "Standard (30,000 CFA)",
            "payment_status" => "failed",
            "amount_paid" => "0 XAF",
            "registered_at" => "2026-08-23T11:45:00Z"
        ],
        [
            "id" => "REG-005",
            "name" => "Rebecca Ndi",
            "email" => "r.ndi@techhub.cm",
            "phone" => "+237 677777777",
            "organization" => "Silicon Mountain Hub",
            "city" => "Buea",
            "country" => "Cameroon",
            "category" => "Standard (30,000 CFA)",
            "payment_status" => "paid",
            "amount_paid" => "30,000 XAF",
            "registered_at" => "2026-08-24T08:20:00Z"
        ]
    ];

    echo json_encode([
        "success" => true,
        "registrations" => $mockRegistrations
    ]);
    exit();
}
