<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);

    $id = generate_uuid();
    $name = isset($data['name']) ? trim($data['name']) : '';
    $email = isset($data['email']) ? strtolower(trim($data['email'])) : '';
    $phone = isset($data['phone']) ? trim($data['phone']) : '';
    $organization = isset($data['organization']) ? trim($data['organization']) : '';
    $address = isset($data['address']) ? trim($data['address']) : '';
    $city = isset($data['city']) ? trim($data['city']) : '';
    $country = isset($data['country']) ? trim($data['country']) : 'Cameroon';
    $postalCode = isset($data['postalCode']) ? trim($data['postalCode']) : '';
    $category = isset($data['category']) ? trim($data['category']) : 'Standard';
    $paymentStatus = isset($data['paymentStatus']) ? trim($data['paymentStatus']) : 'pending';
    
    // Determine amount based on category string
    $amount = "30,000 XAF";
    if (strpos($category, "50,000") !== false) $amount = "50,000 XAF";
    if (strpos($category, "100,000") !== false) $amount = "100,000 XAF";
    if (strpos($category, "500,000") !== false) $amount = "500,000 XAF";

    if (empty($name) || empty($email) || empty($phone)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Name, email, and phone are required"]);
        exit();
    }

    $stmt = $conn->prepare("INSERT INTO forum_registrations (id, name, email, phone, organization, address, city, country, postalCode, category, payment_status, amount_paid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssssssssss", $id, $name, $email, $phone, $organization, $address, $city, $country, $postalCode, $category, $paymentStatus, $amount);
    
    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(["success" => true, "message" => "Registration successful", "registrationId" => $id]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to save registration: " . $conn->error]);
    }
    
    $stmt->close();
    exit();
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);
?>
