<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$db_host = 'localhost';
$db_user = 'worlvjwl_camemark_dbuser';
$db_pass = 'camemark_dbuser$1';
$db_name = 'worlvjwl_camemark_db';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed: " . $conn->connect_error]);
    exit();
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$request_method = $_SERVER['REQUEST_METHOD'];

// Helper function to generate UUID v4
function generate_uuid() {
    return sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

// 1. Sign Up Endpoint
if (strpos($uri, '/api/auth/signup') !== false && $request_method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
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

        // Create token placeholder / user object
        $userObj = [
            "id" => $userId,
            "email" => $email,
            "fullName" => $fullName,
            "phone" => $phone,
            "country" => $country,
            "region" => $region,
            "city" => $city,
            "role" => $role,
            "language" => $language,
            "preferredCurrency" => $preferredCurrency
        ];

        http_response_code(201);
        echo json_encode(["user" => $userObj, "token" => "token-" . $userId]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to create user: " . $stmt->error]);
    }
    $stmt->close();
    exit();
}

// 2. Sign In Endpoint
if (strpos($uri, '/api/auth/signin') !== false && $request_method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $email = isset($data['email']) ? strtolower(trim($data['email'])) : '';
    $password = isset($data['password']) ? $data['password'] : '';

    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(["error" => "Email and password are required."]);
        exit();
    }

    $stmt = $conn->prepare("SELECT id, email, passwordHash, fullName, phone, country, region, city, role, language, preferredCurrency FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        if (password_verify($password, $row['passwordHash'])) {
            unset($row['passwordHash']);
            http_response_code(200);
            echo json_encode(["user" => $row, "token" => "token-" . $row['id']]);
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Invalid email or password."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Invalid email or password."]);
    }
    $stmt->close();
    exit();
}

http_response_code(404);
echo json_encode(["error" => "Endpoint not found."]);
?>
