<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);

    if (!$data) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid JSON input"]);
        exit();
    }

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

    try {
        // Check if email already registered
        $checkStmt = $conn->prepare("SELECT id FROM forum_registrations WHERE email = ?");
        if ($checkStmt) {
            $checkStmt->bind_param("s", $email);
            $checkStmt->execute();
            $checkStmt->store_result();
            if ($checkStmt->num_rows > 0) {
                $checkStmt->close();
                // Return existing registration ID so payment can proceed
                $existStmt = $conn->prepare("SELECT id FROM forum_registrations WHERE email = ? LIMIT 1");
                $existStmt->bind_param("s", $email);
                $existStmt->execute();
                $existResult = $existStmt->get_result();
                $existRow = $existResult->fetch_assoc();
                $existStmt->close();
                http_response_code(200);
                echo json_encode(["success" => true, "message" => "Registration already exists", "registrationId" => $existRow['id']]);
                exit();
            }
            $checkStmt->close();
        }

        $stmt = $conn->prepare("INSERT INTO forum_registrations (id, name, email, phone, organization, address, city, country, postalCode, category, payment_status, amount_paid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

        if (!$stmt) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "DB prepare failed: " . $conn->error]);
            exit();
        }

        $stmt->bind_param("ssssssssssss", $id, $name, $email, $phone, $organization, $address, $city, $country, $postalCode, $category, $paymentStatus, $amount);

        if ($stmt->execute()) {
            $stmt->close();
            http_response_code(201);
            echo json_encode(["success" => true, "message" => "Registration successful", "registrationId" => $id]);
        } else {
            $err = $stmt->error;
            $stmt->close();
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Failed to save registration: " . $err]);
        }
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage(), "line" => $e->getLine()]);
    }

    exit();
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);
?>
