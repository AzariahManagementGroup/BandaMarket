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

// Function to send welcome email on first login
function send_first_login_welcome_email($toEmail, $fullName) {
    $subject = "Welcome to CameMark — Your Account is Ready!";
    
    $message = "
    <html>
    <head>
      <title>Welcome to CameMark</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; }
        .card { max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .header { background: #064e3b; padding: 30px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .content { padding: 30px; color: #334155; line-height: 1.6; }
        .btn { display: inline-block; background: #059669; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; margin-top: 20px; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class='card'>
        <div class='header'>
          <h1>Welcome to CameMark! 🇨🇲</h1>
        </div>
        <div class='content'>
          <p>Hello <strong>" . htmlspecialchars($fullName) . "</strong>,</p>
          <p>Congratulations on logging into your CameMark account for the first time!</p>
          <p>You now have access to Cameroon's premier digital marketplace. Trade, explore products across all 10 regions, and access your CamRency Wallet securely.</p>
          <a href='https://camemark.com/dashboard' class='btn'>Go to Dashboard</a>
        </div>
        <div class='footer'>
          &copy; " . date('Y') . " CameMark. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    ";

    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: CameMark Support <support@camemark.com>" . "\r\n";

    @mail($toEmail, $subject, $message, $headers);
}

// 1. Sign Up Endpoint
if (strpos($uri, 'signup') !== false || (strpos($uri, 'api') !== false && $request_method === 'POST')) {
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
}

// 2. Sign In Endpoint
if (strpos($uri, 'signin') !== false || (strpos($uri, 'api') !== false && $request_method === 'POST')) {
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);

    $email = isset($data['email']) ? strtolower(trim($data['email'])) : '';
    $password = isset($data['password']) ? $data['password'] : '';

    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(["error" => "Email and password are required."]);
        exit();
    }

    $stmt = $conn->prepare("SELECT id, email, passwordHash, fullName, phone, country, region, city, role, language, preferredCurrency, lastLoginAt FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        if (password_verify($password, $row['passwordHash'])) {
            $isFirstLogin = empty($row['lastLoginAt']);

            // Update lastLoginAt timestamp
            $now = date('Y-m-d H:i:s');
            $ustmt = $conn->prepare("UPDATE users SET lastLoginAt = ? WHERE id = ?");
            $ustmt->bind_param("ss", $now, $row['id']);
            $ustmt->execute();
            $ustmt->close();

            // Send first login welcome email if applicable
            if ($isFirstLogin) {
                send_first_login_welcome_email($row['email'], $row['fullName']);
            }

            unset($row['passwordHash']);
            http_response_code(200);
            echo json_encode(["user" => $row, "token" => "token-" . $row['id'], "firstLogin" => $isFirstLogin]);
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
