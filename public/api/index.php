<?php
// Unified Clean Router for /api Endpoint Routing
require_once __DIR__ . '/config.php';

// Route matching based on request URL
if (strpos($uri, 'bargains') !== false) {
    require_once __DIR__ . '/bargains.php';
    exit();
}

if (strpos($uri, 'courses') !== false || strpos($uri, 'course-enroll') !== false) {
    if (strpos($uri, 'course-enroll') !== false) {
        require_once __DIR__ . '/course-enroll.php';
    } else {
        require_once __DIR__ . '/courses.php';
    }
    exit();
}

// 1. Sign Up Endpoint
if (strpos($uri, 'signup') !== false) {
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);
    
    if (isset($data['fullName'])) {
        $email = isset($data['email']) ? strtolower(trim($data['email'])) : '';
        $password = isset($data['password']) ? $data['password'] : '';
        $fullName = isset($data['fullName']) ? trim($data['fullName']) : '';
        $phone = isset($data['phone']) ? trim($data['phone']) : null;
        $country = isset($data['country']) ? trim($data['country']) : 'Cameroon';
        $region = isset($data['region']) ? trim($data['region']) : null;
        $city = isset($data['city']) ? trim($data['city']) : null;
        $role = isset($data['role']) ? trim($data['role']) : 'buyer';
        $referralCode = isset($data['referralCode']) ? trim($data['referralCode']) : null;
        $language = isset($data['language']) ? trim($data['language']) : 'en';
        $preferredCurrency = isset($data['preferredCurrency']) ? trim($data['preferredCurrency']) : 'XAF';

        if (empty($email) || empty($password) || empty($fullName)) {
            http_response_code(400);
            echo json_encode(["error" => "Email, password, and full name are required."]);
            exit();
        }

        // Check if user exists
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            http_response_code(400);
            echo json_encode(["error" => "User with this email already exists."]);
            exit();
        }
        $stmt->close();

        $userId = generate_uuid();
        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        $now = date('Y-m-d H:i:s');

        // Insert User
        $stmt = $conn->prepare("INSERT INTO users (id, email, passwordHash, fullName, phone, country, region, city, role, referralCode, language, preferredCurrency, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssssssssssss", $userId, $email, $passwordHash, $fullName, $phone, $country, $region, $city, $role, $referralCode, $language, $preferredCurrency, $now, $now);

        if ($stmt->execute()) {
            // Create Wallet
            $walletId = generate_uuid();
            $balance = 0.0;
            $wstmt = $conn->prepare("INSERT INTO wallets (id, userId, balance, currency, updatedAt) VALUES (?, ?, ?, ?, ?)");
            $wstmt->bind_param("ssdss", $walletId, $userId, $balance, $preferredCurrency, $now);
            $wstmt->execute();
            $wstmt->close();

            // Create notification
            create_inapp_notification($conn, $userId, "Welcome to CameMark! 🇨🇲", "Your account has been created successfully. Explore verified local products and regional bargains!");

            $token = base64_encode($userId . ":" . time());

            http_response_code(201);
            echo json_encode([
                "message" => "Registration successful!",
                "token" => $token,
                "user" => [
                    "id" => $userId,
                    "email" => $email,
                    "fullName" => $fullName,
                    "role" => $role,
                    "country" => $country,
                    "preferredCurrency" => $preferredCurrency,
                    "wallet" => ["balance" => 0.0, "currency" => $preferredCurrency]
                ]
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Registration failed."]);
        }
        $stmt->close();
        exit();
    }
}

// 2. Sign In Endpoint
if (strpos($uri, 'signin') !== false) {
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);

    $email = isset($data['email']) ? strtolower(trim($data['email'])) : '';
    $password = isset($data['password']) ? $data['password'] : '';

    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(["error" => "Email and password are required."]);
        exit();
    }

    $stmt = $conn->prepare("SELECT id, email, passwordHash, fullName, role, preferredCurrency FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        if (password_verify($password, $row['passwordHash'])) {
            $token = base64_encode($row['id'] . ":" . time());

            // Fetch wallet
            $wstmt = $conn->prepare("SELECT balance, currency FROM wallets WHERE userId = ?");
            $wstmt->bind_param("s", $row['id']);
            $wstmt->execute();
            $wres = $wstmt->get_result();
            $walletData = $wres->fetch_assoc() ?: ["balance" => 0.0, "currency" => $row['preferredCurrency']];
            $wstmt->close();

            http_response_code(200);
            echo json_encode([
                "message" => "Login successful!",
                "token" => $token,
                "user" => [
                    "id" => $row['id'],
                    "email" => $row['email'],
                    "fullName" => $row['fullName'],
                    "role" => $row['role'],
                    "preferredCurrency" => $row['preferredCurrency'],
                    "wallet" => $walletData
                ]
            ]);
            exit();
        }
    }

    http_response_code(401);
    echo json_encode(["error" => "Invalid email or password."]);
    exit();
}

http_response_code(404);
echo json_encode(["error" => "Endpoint not found."]);
?>
