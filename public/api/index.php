<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'camemark_db';

$conn = @new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    // Fallback to production credentials
    $conn = new mysqli('localhost', 'worlvjwl_camemark_dbuser', 'camemark_dbuser$1', 'worlvjwl_camemark_db');
    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode(["error" => "Database connection failed: " . $conn->connect_error]);
        exit();
    }
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

// Helper function to send email via SSL/TLS Socket SMTP (Dynamic DB Config)
function send_html_email($toEmail, $subject, $bodyContent, $conn = null) {
    $smtpHost = "ssl://smtp.gmail.com";
    $smtpPort = 465;
    $smtpUser = "podoremetropolis@gmail.com";
    $smtpPass = "ptfjtrjyaidmyqrf";

    // Query custom SMTP settings if DB connection provided
    if ($conn) {
        $res = $conn->query("SELECT * FROM smtp_settings ORDER BY id DESC LIMIT 1");
        if ($res && $row = $res->fetch_assoc()) {
            if (!empty($row['smtpHost'])) {
                $smtpHost = (strpos($row['smtpHost'], 'ssl://') === false && strpos($row['smtpHost'], 'tls://') === false && $row['smtpPort'] == 465) 
                    ? "ssl://" . $row['smtpHost'] 
                    : $row['smtpHost'];
            }
            if (!empty($row['smtpPort'])) $smtpPort = intval($row['smtpPort']);
            if (!empty($row['smtpUser'])) $smtpUser = $row['smtpUser'];
            if (!empty($row['smtpPass'])) $smtpPass = $row['smtpPass'];
        }
    }

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
        .warning-box { background: #fffbe6; border: 1px solid #ffe58f; padding: 15px; border-radius: 10px; margin-top: 20px; font-size: 13px; color: #8c6b00; }
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

    $headers = [
        "From: CameMark Marketplace <" . $smtpUser . ">",
        "To: <" . $toEmail . ">",
        "Subject: " . $subject,
        "MIME-Version: 1.0",
        "Content-Type: text/html; charset=UTF-8"
    ];

    $emailData = implode("\r\n", $headers) . "\r\n\r\n" . $message . "\r\n.";

    $socket = @fsockopen($smtpHost, $smtpPort, $errno, $errstr, 15);
    if (!$socket) {
        // Fallback to mail() if socket blocked
        $mailHeaders = "MIME-Version: 1.0\r\nContent-type:text/html;charset=UTF-8\r\nFrom: CameMark <" . $smtpUser . ">\r\n";
        @mail($toEmail, $subject, $message, $mailHeaders);
        return false;
    }

    $response = fgets($socket, 512);

    fputs($socket, "EHLO CameMark\r\n");
    $response = fgets($socket, 512);

    fputs($socket, "AUTH LOGIN\r\n");
    $response = fgets($socket, 512);

    fputs($socket, base64_encode($smtpUser) . "\r\n");
    $response = fgets($socket, 512);

    fputs($socket, base64_encode($smtpPass) . "\r\n");
    $response = fgets($socket, 512);

    fputs($socket, "MAIL FROM: <" . $smtpUser . ">\r\n");
    $response = fgets($socket, 512);

    fputs($socket, "RCPT TO: <" . $toEmail . ">\r\n");
    $response = fgets($socket, 512);

    fputs($socket, "DATA\r\n");
    $response = fgets($socket, 512);

    fputs($socket, $emailData . "\r\n");
    $response = fgets($socket, 512);

    fputs($socket, "QUIT\r\n");
    fclose($socket);

    return true;
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

// 4. Products API Endpoints
if (strpos($uri, 'products') !== false) {
    if ($request_method === 'POST') {
        $input = file_get_contents("php://input");
        $data = json_decode($input, true);

        $id = "lst-" . round(microtime(true) * 1000);
        $sellerId = isset($data['sellerId']) ? $data['sellerId'] : '';
        $sellerName = isset($data['sellerName']) ? $data['sellerName'] : 'Merchant';
        $sellerEmail = isset($data['sellerEmail']) ? $data['sellerEmail'] : '';
        $title = isset($data['title']) ? trim($data['title']) : '';
        $description = isset($data['description']) ? trim($data['description']) : '';
        $price = isset($data['price']) ? floatval($data['price']) : 0;
        $currency = isset($data['currency']) ? $data['currency'] : 'XAF';
        $quantity = isset($data['quantity']) ? intval($data['quantity']) : 1;
        $unit = isset($data['unit']) ? $data['unit'] : 'pcs';
        $category = isset($data['category']) ? $data['category'] : 'Agriculture & Produce';
        $region = isset($data['region']) ? $data['region'] : 'Littoral';
        $city = isset($data['city']) ? $data['city'] : 'Douala';
        $imageUrl = isset($data['imageUrl']) ? $data['imageUrl'] : '';
        $now = date('Y-m-d H:i:s');

        if (empty($title) || $price <= 0) {
            http_response_code(400);
            echo json_encode(["error" => "Title and a valid price are required."]);
            exit();
        }

        $stmt = $conn->prepare("INSERT INTO products (id, sellerId, title, description, price, currency, quantity, unit, category, region, city, imageUrl, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)");
        $stmt->bind_param("ssssdsissssss", $id, $sellerId, $title, $description, $price, $currency, $quantity, $unit, $category, $region, $city, $imageUrl, $now);
        
        if ($stmt->execute()) {
            // 1. Send Product Published Confirmation Email
            if (!empty($sellerEmail)) {
                $emailContent = "
                <p>Hello <strong>" . htmlspecialchars($sellerName) . "</strong>,</p>
                <p>🎉 Your new product listing <strong>'" . htmlspecialchars($title) . "'</strong> has been published successfully on CameMark!</p>
                <p><strong>Price:</strong> " . number_format($price) . " " . htmlspecialchars($currency) . "<br>
                <strong>Region:</strong> " . htmlspecialchars($region) . " (" . htmlspecialchars($city) . ")<br>
                <strong>Quantity in Stock:</strong> " . $quantity . " " . htmlspecialchars($unit) . "</p>
                <p>Your item is now live and visible to buyers across all 10 regions of Cameroon on the Market Zone.</p>
                
                <div class='warning-box'>
                  <strong>⚠️ Important Merchant Notice:</strong><br>
                  If your seller account is not yet verified, you are currently limited to <strong>1 product listing</strong>. To publish additional products and receive the Verified Merchant trust badge, please submit your KYC verification documents on your dashboard.
                </div>

                <a href='https://camemark.com/market-zone' class='btn'>View Market Zone</a>";

                send_html_email($sellerEmail, "Product Published: " . $title, $emailContent);
            }

            // 2. Create In-App Notification
            if (!empty($sellerId)) {
                create_inapp_notification($conn, $sellerId, "Product Listing Live! 📦", "Your product '" . $title . "' is now live on Market Zone. Complete KYC verification to unlock unlimited listings!");
            }

            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Product published successfully!",
                "product" => [
                    "id" => $id,
                    "title" => $title,
                    "description" => $description,
                    "price" => $price,
                    "currency" => $currency,
                    "quantity" => $quantity,
                    "unit" => $unit,
                    "category" => $category,
                    "region" => $region,
                    "city" => $city,
                    "imageUrl" => $imageUrl,
                    "status" => "active",
                    "createdAt" => $now
                ]
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to publish product: " . $stmt->error]);
        }
        $stmt->close();
        exit();
    } else if ($request_method === 'PUT') {
        $input = file_get_contents("php://input");
        $data = json_decode($input, true);

        $id = isset($data['id']) ? $data['id'] : '';
        $title = isset($data['title']) ? trim($data['title']) : '';
        $price = isset($data['price']) ? floatval($data['price']) : 0;
        $quantity = isset($data['quantity']) ? intval($data['quantity']) : 1;
        $description = isset($data['description']) ? trim($data['description']) : '';
        $imageUrl = isset($data['imageUrl']) ? $data['imageUrl'] : '';

        if (empty($id) || empty($title) || $price <= 0) {
            http_response_code(400);
            echo json_encode(["error" => "Product ID, Title, and Price are required."]);
            exit();
        }

        $stmt = $conn->prepare("UPDATE products SET title = ?, price = ?, quantity = ?, description = ?, imageUrl = ? WHERE id = ?");
        $stmt->bind_param("sdisss", $title, $price, $quantity, $description, $imageUrl, $id);
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(["success" => true, "message" => "Product updated successfully!"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to update product."]);
        }
        $stmt->close();
        exit();
    } else if ($request_method === 'DELETE') {
        $id = isset($_GET['id']) ? $_GET['id'] : '';
        if (empty($id)) {
            $input = file_get_contents("php://input");
            $data = json_decode($input, true);
            $id = isset($data['id']) ? $data['id'] : '';
        }

        if (empty($id)) {
            http_response_code(400);
            echo json_encode(["error" => "Product ID is required."]);
            exit();
        }

        $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
        $stmt->bind_param("s", $id);
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(["success" => true, "message" => "Product deleted successfully!"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to delete product."]);
        }
        $stmt->close();
        exit();
    } else {
        // GET Request - Fetch all active products
        $sql = "SELECT p.*, u.fullName as sellerName, u.email as sellerEmail FROM products p LEFT JOIN users u ON p.sellerId = u.id WHERE p.status = 'active' ORDER BY p.createdAt DESC";
        $result = $conn->query($sql);
        $products = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $products[] = $row;
            }
        }
        http_response_code(200);
        echo json_encode(["products" => $products]);
        exit();
    }
}

// 5. Notifications API Endpoint
if (strpos($uri, 'notifications') !== false) {
    $userId = isset($_GET['userId']) ? $_GET['userId'] : '';
    if (empty($userId)) {
        http_response_code(400);
        echo json_encode(["error" => "userId parameter is required."]);
        exit();
    }

    $stmt = $conn->prepare("SELECT id, title, message, isRead, createdAt FROM notifications WHERE userId = ? ORDER BY createdAt DESC");
    $stmt->bind_param("s", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    $notifications = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $notifications[] = $row;
        }
    }
    $stmt->close();

    http_response_code(200);
    echo json_encode(["notifications" => $notifications]);
    exit();
}

// 6. Orders API Endpoints
if (strpos($uri, 'orders') !== false) {
    if ($request_method === 'POST') {
        $input = file_get_contents("php://input");
        $data = json_decode($input, true);

        $id = "ord-" . round(microtime(true) * 1000);
        $productId = isset($data['productId']) ? $data['productId'] : '';
        $productTitle = isset($data['productTitle']) ? trim($data['productTitle']) : '';
        $amount = isset($data['amount']) ? floatval($data['amount']) : 0;
        $currency = isset($data['currency']) ? $data['currency'] : 'XAF';
        $sellerId = isset($data['sellerId']) ? $data['sellerId'] : '';
        $sellerName = isset($data['sellerName']) ? $data['sellerName'] : 'Merchant';
        $sellerEmail = isset($data['sellerEmail']) ? $data['sellerEmail'] : '';
        $buyerName = isset($data['buyerName']) ? trim($data['buyerName']) : '';
        $buyerEmail = isset($data['buyerEmail']) ? trim($data['buyerEmail']) : '';
        $buyerPhone = isset($data['buyerPhone']) ? trim($data['buyerPhone']) : '';
        $deliveryAddress = isset($data['deliveryAddress']) ? trim($data['deliveryAddress']) : '';
        $now = date('Y-m-d H:i:s');

        // Lookup seller email and seller name from DB if not passed in payload
        if (!empty($productId) && (empty($sellerEmail) || empty($sellerId))) {
            $pStmt = $conn->prepare("SELECT p.sellerId, u.fullName, u.email FROM products p LEFT JOIN users u ON p.sellerId = u.id WHERE p.id = ?");
            $pStmt->bind_param("s", $productId);
            $pStmt->execute();
            $pRes = $pStmt->get_result();
            if ($pRes && $pRow = $pRes->fetch_assoc()) {
                if (empty($sellerId)) $sellerId = $pRow['sellerId'];
                if (empty($sellerName) || $sellerName === 'Merchant') $sellerName = $pRow['fullName'];
                if (empty($sellerEmail)) $sellerEmail = $pRow['email'];
            }
            $pStmt->close();
        }

        if (empty($productTitle) || empty($buyerName) || empty($buyerPhone)) {
            http_response_code(400);
            echo json_encode(["error" => "Product, Buyer Name, and Phone are required."]);
            exit();
        }

        $stmt = $conn->prepare("INSERT INTO orders (id, productId, productTitle, amount, currency, sellerId, sellerName, sellerEmail, buyerName, buyerEmail, buyerPhone, deliveryAddress, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)");
        $stmt->bind_param("sssdsssssssss", $id, $productId, $productTitle, $amount, $currency, $sellerId, $sellerName, $sellerEmail, $buyerName, $buyerEmail, $buyerPhone, $deliveryAddress, $now);
        
        if ($stmt->execute()) {
            // A. Send Order Confirmation Email to Buyer
            if (!empty($buyerEmail)) {
                $buyerMailContent = "
                <p>Hello <strong>" . htmlspecialchars($buyerName) . "</strong>,</p>
                <p>🎉 Your order for <strong>'" . htmlspecialchars($productTitle) . "'</strong> has been placed successfully!</p>
                <p><strong>Order ID:</strong> " . $id . "<br>
                <strong>Total Amount:</strong> " . number_format($amount) . " " . htmlspecialchars($currency) . "<br>
                <strong>Delivery Address:</strong> " . htmlspecialchars($deliveryAddress) . "</p>
                <p>Merchant <strong>" . htmlspecialchars($sellerName) . "</strong> will contact you at <strong>" . htmlspecialchars($buyerPhone) . "</strong> for dispatch.</p>
                <a href='https://camemark.com/market-zone' class='btn'>Continue Shopping</a>";

                send_html_email($buyerEmail, "Order Confirmation: " . $productTitle, $buyerMailContent, $conn);
            }

            // B. Send New Order Alert Email to Seller
            if (!empty($sellerEmail)) {
                $sellerMailContent = "
                <p>Hello <strong>" . htmlspecialchars($sellerName) . "</strong>,</p>
                <p>🛍️ You have received a new order for <strong>'" . htmlspecialchars($productTitle) . "'</strong>!</p>
                <p><strong>Order ID:</strong> " . $id . "<br>
                <strong>Order Value:</strong> " . number_format($amount) . " " . htmlspecialchars($currency) . "<br>
                <strong>Buyer Name:</strong> " . htmlspecialchars($buyerName) . "<br>
                <strong>Buyer Phone / WhatsApp:</strong> " . htmlspecialchars($buyerPhone) . "<br>
                <strong>Delivery Address:</strong> " . htmlspecialchars($deliveryAddress) . "</p>
                <p>Please contact the buyer directly to arrange delivery.</p>
                <a href='https://camemark.com/seller-dashboard/orders' class='btn'>View Orders</a>";

                send_html_email($sellerEmail, "New Order Received: " . $productTitle, $sellerMailContent, $conn);
            }

            // C. Create In-App Notification for Seller
            if (!empty($sellerId)) {
                create_inapp_notification($conn, $sellerId, "New Order Received! 🛒", "New order from " . $buyerName . " for '" . $productTitle . "' (" . number_format($amount) . " " . $currency . "). Phone: " . $buyerPhone);
            }

            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Order placed successfully!",
                "order" => [
                    "id" => $id,
                    "productTitle" => $productTitle,
                    "amount" => $amount,
                    "currency" => $currency,
                    "sellerName" => $sellerName,
                    "buyerName" => $buyerName,
                    "buyerPhone" => $buyerPhone,
                    "deliveryAddress" => $deliveryAddress,
                    "status" => "pending",
                    "createdAt" => $now
                ]
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to save order: " . $stmt->error]);
        }
        $stmt->close();
        exit();
    } else {
        // GET Request - Fetch all orders for Admin or filtered by sellerId/buyerEmail
        $sellerId = isset($_GET['sellerId']) ? $_GET['sellerId'] : '';
        $buyerEmail = isset($_GET['buyerEmail']) ? $_GET['buyerEmail'] : '';

        if (!empty($sellerId)) {
            $stmt = $conn->prepare("SELECT * FROM orders WHERE sellerId = ? ORDER BY createdAt DESC");
            $stmt->bind_param("s", $sellerId);
        } else if (!empty($buyerEmail)) {
            $stmt = $conn->prepare("SELECT * FROM orders WHERE buyerEmail = ? ORDER BY createdAt DESC");
            $stmt->bind_param("s", $buyerEmail);
        } else {
            $stmt = $conn->prepare("SELECT * FROM orders ORDER BY createdAt DESC");
        }

        $stmt->execute();
        $result = $stmt->get_result();
        $orders = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $orders[] = $row;
            }
        }
        $stmt->close();

        http_response_code(200);
        echo json_encode(["orders" => $orders]);
        exit();
    }
}

// 7. SMTP Settings API Endpoints
if (strpos($uri, 'smtp') !== false) {
    if ($request_method === 'POST') {
        $input = file_get_contents("php://input");
        $data = json_decode($input, true);

        $smtpHost = isset($data['smtpHost']) ? trim($data['smtpHost']) : '';
        $smtpPort = isset($data['smtpPort']) ? trim($data['smtpPort']) : '465';
        $smtpUser = isset($data['smtpUser']) ? trim($data['smtpUser']) : '';
        $smtpPass = isset($data['smtpPass']) ? trim($data['smtpPass']) : '';
        $now = date('Y-m-d H:i:s');

        if (empty($smtpHost) || empty($smtpUser)) {
            http_response_code(400);
            echo json_encode(["error" => "SMTP Host and SMTP User are required."]);
            exit();
        }

        $stmt = $conn->prepare("INSERT INTO smtp_settings (smtpHost, smtpPort, smtpUser, smtpPass, updatedAt) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssss", $smtpHost, $smtpPort, $smtpUser, $smtpPass, $now);
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(["success" => true, "message" => "SMTP credentials updated successfully!"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to update SMTP settings."]);
        }
        $stmt->close();
        exit();
    } else {
        $result = $conn->query("SELECT smtpHost, smtpPort, smtpUser, updatedAt FROM smtp_settings ORDER BY id DESC LIMIT 1");
        $settings = null;
        if ($result && $row = $result->fetch_assoc()) {
            $settings = $row;
        }
        http_response_code(200);
        echo json_encode(["smtp" => $settings || [
            "smtpHost" => "smtp.gmail.com",
            "smtpPort" => "465",
            "smtpUser" => "podoremetropolis@gmail.com",
            "updatedAt" => date('Y-m-d H:i:s')
        ]]);
        exit();
    }
}

http_response_code(404);
echo json_encode(["error" => "Endpoint not found."]);
?>
