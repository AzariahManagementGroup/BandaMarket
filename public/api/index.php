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

// Helper function to send email
function send_html_email($toEmail, $subject, $bodyContent) {
    $message = "
    <html>
    <head>
      <title>" . htmlspecialchars($subject) . "</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; }
        .card { max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .header { background: #064e3b; padding: 25px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
        .content { padding: 30px; color: #334155; line-height: 1.6; }
        .btn { display: inline-block; background: #059669; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; margin-top: 20px; }
        .otp-box { font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #064e3b; background: #f0fdf4; border: 2px dashed #059669; padding: 15px; text-align: center; border-radius: 10px; margin: 20px 0; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class='card'>
        <div class='header'>
          <h1>CameMark 🇨🇲</h1>
        </div>
        <div class='content'>
          " . $bodyContent . "
        </div>
        <div class='footer'>
          &copy; " . date('Y') . " CameMark. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    ";

    $domain = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'camemark.com';
    $fromHeader = "noreply@" . $domain;

    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: CameMark <" . $fromHeader . ">" . "\r\n";
    $headers .= "Reply-To: support@" . $domain . "\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    @mail($toEmail, $subject, $message, $headers);
}

// Helper function to create in-app notification
function create_inapp_notification($conn, $userId, $title, $message) {
    $notifId = generate_uuid();
    $now = date('Y-m-d H:i:s');
    $stmt = $conn->prepare("INSERT INTO notifications (id, userId, title, message, isRead, createdAt) VALUES (?, ?, ?, ?, 0, ?)");
    $stmt->bind_param("sssss", $notifId, $userId, $title, $message, $now);
    $stmt->execute();
    $stmt->close();
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

// 2. Verify OTP Endpoint
if (strpos($uri, 'verify-otp') !== false && $request_method === 'POST') {
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);

    $email = isset($data['email']) ? strtolower(trim($data['email'])) : '';
    $otpCode = isset($data['otpCode']) ? trim($data['otpCode']) : '';

    if (empty($email) || empty($otpCode)) {
        http_response_code(400);
        echo json_encode(["error" => "Email and OTP code are required."]);
        exit();
    }

    $stmt = $conn->prepare("SELECT id, email, fullName, phone, country, region, city, role, language, preferredCurrency, otpCode, otpExpiresAt FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        $now = date('Y-m-d H:i:s');
        if ($row['otpCode'] === $otpCode && strtotime($row['otpExpiresAt']) > strtotime($now)) {
            // Clear OTP after successful verification
            $cstmt = $conn->prepare("UPDATE users SET otpCode = NULL, otpExpiresAt = NULL, lastLoginAt = ? WHERE id = ?");
            $cstmt->bind_param("ss", $now, $row['id']);
            $cstmt->execute();
            $cstmt->close();

            unset($row['otpCode']);
            unset($row['otpExpiresAt']);

            http_response_code(200);
            echo json_encode(["user" => $row, "token" => "token-" . $row['id']]);
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Invalid or expired OTP code."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["error" => "User not found."]);
    }
    $stmt->close();
    exit();
}

// 3. Sign In Endpoint (Includes New Device Alert & Weekly 7-Day Security OTP Check)
if (strpos($uri, 'signin') !== false || (strpos($uri, 'api') !== false && $request_method === 'POST')) {
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);

    $email = isset($data['email']) ? strtolower(trim($data['email'])) : '';
    $password = isset($data['password']) ? $data['password'] : '';
    $deviceInfo = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : 'Unknown Device';
    $currentDeviceHash = md5($deviceInfo);

    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(["error" => "Email and password are required."]);
        exit();
    }

    $stmt = $conn->prepare("SELECT id, email, passwordHash, fullName, phone, country, region, city, role, language, preferredCurrency, lastLoginAt, lastDeviceHash FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        if (password_verify($password, $row['passwordHash'])) {
            $isFirstLogin = empty($row['lastLoginAt']);
            $now = date('Y-m-d H:i:s');
            
            // Check 1: New Device Detection
            $isNewDevice = !empty($row['lastDeviceHash']) && ($row['lastDeviceHash'] !== $currentDeviceHash);
            if ($isNewDevice) {
                $alertContent = "
                <p>Hello <strong>" . htmlspecialchars($row['fullName']) . "</strong>,</p>
                <p>⚠️ <strong>Security Alert:</strong> A login to your CameMark account was detected from a new device.</p>
                <p><strong>Device Info:</strong> " . htmlspecialchars($deviceInfo) . "</p>
                <p><strong>Time:</strong> " . $now . "</p>
                <p>If this was you, no action is needed. If you didn't authorize this login, please reset your password immediately.</p>";
                
                send_html_email($row['email'], "Security Alert: New Device Login Detected", $alertContent);
                create_inapp_notification($conn, $row['id'], "New Device Login Detected ⚠️", "A login from a new device/browser was detected on your account.");
            }

            // Check 2: Weekly OTP Verification (Required once every 7 days after first login)
            $lastLoginTime = !empty($row['lastLoginAt']) ? strtotime($row['lastLoginAt']) : 0;
            $sevenDaysAgo = strtotime('-7 days');
            $requiresWeeklyOtp = !$isFirstLogin && ($lastLoginTime < $sevenDaysAgo);

            if ($requiresWeeklyOtp) {
                $otp = sprintf("%06d", mt_rand(100000, 999999));
                $otpExpiresAt = date('Y-m-d H:i:s', strtotime('+15 minutes'));

                $ostmt = $conn->prepare("UPDATE users SET otpCode = ?, otpExpiresAt = ?, lastDeviceHash = ? WHERE id = ?");
                $ostmt->bind_param("ssss", $otp, $otpExpiresAt, $currentDeviceHash, $row['id']);
                $ostmt->execute();
                $ostmt->close();

                $otpContent = "
                <p>Hello <strong>" . htmlspecialchars($row['fullName']) . "</strong>,</p>
                <p>To keep your account secure, a weekly security check is required. Here is your One-Time Password (OTP):</p>
                <div class='otp-box'>" . $otp . "</div>
                <p>This code will expire in 15 minutes. Do not share this code with anyone.</p>";

                send_html_email($row['email'], "CameMark Security: Your Weekly Login OTP", $otpContent);
                create_inapp_notification($conn, $row['id'], "Weekly Security Check Required", "A 6-digit OTP code has been emailed to you for verification.");

                http_response_code(200);
                echo json_encode([
                    "requiresOtp" => true,
                    "email" => $row['email'],
                    "message" => "A 6-digit OTP code has been sent to your email for weekly security verification."
                ]);
                exit();
            }

            // Update user last login and device hash
            $ustmt = $conn->prepare("UPDATE users SET lastLoginAt = ?, lastDeviceHash = ? WHERE id = ?");
            $ustmt->bind_param("sss", $now, $currentDeviceHash, $row['id']);
            $ustmt->execute();
            $ustmt->close();

            // Send first login welcome email if first login
            if ($isFirstLogin) {
                $welcomeContent = "
                <p>Hello <strong>" . htmlspecialchars($row['fullName']) . "</strong>,</p>
                <p>Congratulations on logging into your CameMark account for the first time!</p>
                <p>You now have full access to Cameroon's premier digital marketplace across all 10 regions.</p>
                <a href='https://camemark.com/dashboard' class='btn'>Go to Dashboard</a>";

                send_html_email($row['email'], "Welcome to CameMark — Your Account is Ready!", $welcomeContent);
                create_inapp_notification($conn, $row['id'], "Welcome to CameMark! 🇨🇲", "Your account has been set up. Start trading across all 10 regions.");
            }

            unset($row['passwordHash']);
            unset($row['lastDeviceHash']);
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
