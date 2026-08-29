<?php
// Shared Database & Mail Configuration
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

$request_method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';
$uri = isset($_SERVER['REQUEST_URI']) ? parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) : '/';

if ($request_method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'camemark_db';

$conn = null;
try {
    $conn = @new mysqli($db_host, $db_user, $db_pass, $db_name);
    if ($conn->connect_error) {
        throw new Exception($conn->connect_error);
    }
    $conn->set_charset('utf8mb4');
} catch (Exception $e) {
    // Fallback to production credentials
    try {
        $conn = @new mysqli('localhost', 'worlvjwl_camemark_dbuser', 'camemark_dbuser$1', 'worlvjwl_camemark_db');
        if ($conn->connect_error) {
            http_response_code(500);
            echo json_encode(["error" => "Database connection failed: " . $conn->connect_error]);
            exit();
        }
        $conn->set_charset('utf8mb4');
    } catch (Exception $e2) {
        http_response_code(500);
        echo json_encode(["error" => "Database connection failed: " . $e2->getMessage()]);
        exit();
    }
}

// Helper for PDO connection used by referrals
function get_db_connection() {
    global $db_host, $db_user, $db_pass, $db_name;
    try {
        $dsn = "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4";
        return new PDO($dsn, $db_user, $db_pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    } catch (PDOException $e) {
        // Fallback
        try {
            return new PDO("mysql:host=localhost;dbname=worlvjwl_camemark_db;charset=utf8mb4", 'worlvjwl_camemark_dbuser', 'camemark_dbuser$1', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        } catch (PDOException $e2) {
            die("PDO Connection failed: " . $e2->getMessage());
        }
    }
}

// Automatic Schema Initialization
try {
    @$conn->query("ALTER TABLE users ADD COLUMN isVerified tinyint(1) NOT NULL DEFAULT 0");
    @$conn->query("ALTER TABLE users ADD COLUMN otpCode varchar(191) DEFAULT NULL");
    @$conn->query("ALTER TABLE users ADD COLUMN otpExpiresAt datetime DEFAULT NULL");
    @$conn->query("ALTER TABLE users ADD COLUMN lastLoginAt datetime DEFAULT NULL");
    @$conn->query("ALTER TABLE users ADD COLUMN resetToken varchar(191) DEFAULT NULL");
    @$conn->query("ALTER TABLE users ADD COLUMN resetTokenExpiresAt datetime DEFAULT NULL");

$conn->query("CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'business',
    instructor VARCHAR(255) DEFAULT 'Camer Market Academy Instructor',
    level VARCHAR(50) DEFAULT 'All Levels',
    duration VARCHAR(50) DEFAULT '4 Weeks',
    price VARCHAR(100) DEFAULT 'Free Access',
    image TEXT NOT NULL,
    description TEXT,
    videoUrl TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$conn->query("CREATE TABLE IF NOT EXISTS wallets (
    id VARCHAR(191) PRIMARY KEY,
    userId VARCHAR(191) NOT NULL,
    balance DOUBLE NOT NULL DEFAULT '0',
    currency VARCHAR(191) NOT NULL DEFAULT 'XAF',
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$conn->query("CREATE TABLE IF NOT EXISTS course_enrollments (
    id VARCHAR(100) PRIMARY KEY,
    courseId VARCHAR(100) NOT NULL,
    courseTitle VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(100),
    paymentStatus VARCHAR(50) DEFAULT 'free',
    amountPaid VARCHAR(100) DEFAULT '0 FCFA',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$conn->query("CREATE TABLE IF NOT EXISTS bargains (
    id VARCHAR(100) PRIMARY KEY,
    productId VARCHAR(100) NOT NULL,
    productTitle VARCHAR(255) NOT NULL,
    sellerId VARCHAR(100) NOT NULL,
    sellerEmail VARCHAR(255) DEFAULT NULL,
    buyerName VARCHAR(255) NOT NULL,
    buyerEmail VARCHAR(255) NOT NULL,
    buyerPhone VARCHAR(100) NOT NULL,
    offerPrice DECIMAL(12,2) NOT NULL,
    offerQty INT DEFAULT 1,
    currency VARCHAR(10) DEFAULT 'XAF',
    status VARCHAR(50) DEFAULT 'pending',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$conn->query("CREATE TABLE IF NOT EXISTS offline_wallets (
    id VARCHAR(100) PRIMARY KEY,
    userId VARCHAR(100) NOT NULL,
    onlineBalance DECIMAL(12,2) DEFAULT '250000.00',
    offlineReservedBalance DECIMAL(12,2) DEFAULT '25000.00',
    tierLevel VARCHAR(50) DEFAULT 'Tier 1 Merchant',
    maxOfflineLimit DECIMAL(12,2) DEFAULT '50000.00',
    spendingScore INT DEFAULT 85,
    deviceCertificate VARCHAR(255) DEFAULT 'CERT-CAMEMARK-OFFLINE-DEVICETRUST-8823',
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$conn->query("CREATE TABLE IF NOT EXISTS offline_transactions (
    id VARCHAR(100) PRIMARY KEY,
    transactionHash VARCHAR(255) NOT NULL,
    merchantId VARCHAR(100) NOT NULL,
    merchantName VARCHAR(255) NOT NULL,
    buyerId VARCHAR(100) NOT NULL,
    buyerName VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'XAF',
    offlineModeLevel VARCHAR(50) DEFAULT 'Level 2: Dual Offline',
    gpsCoordinates VARCHAR(100) DEFAULT '4.0511° N, 9.7679° E (Douala)',
    nonce VARCHAR(100) NOT NULL,
    syncStatus VARCHAR(50) DEFAULT 'Pending Sync',
    settlementStatus VARCHAR(50) DEFAULT 'Pending Settlement',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$conn->query("CREATE TABLE IF NOT EXISTS seller_payouts (
    id VARCHAR(100) PRIMARY KEY,
    sellerId VARCHAR(100) NOT NULL,
    sellerName VARCHAR(255) DEFAULT 'Verified Merchant',
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'XAF',
    method VARCHAR(100) NOT NULL,
    accountNumber VARCHAR(100) NOT NULL,
    accountHolder VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Completed',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
$conn->query("CREATE TABLE IF NOT EXISTS smtp_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    smtpHost VARCHAR(255) NOT NULL,
    smtpPort VARCHAR(50) NOT NULL,
    smtpUser VARCHAR(255) NOT NULL,
    smtpPass VARCHAR(255) NOT NULL,
    senderName VARCHAR(255) DEFAULT 'CameMark Marketplace',
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$conn->query("CREATE TABLE IF NOT EXISTS cloudinary_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cloudName VARCHAR(255) NOT NULL,
    apiKey VARCHAR(255) NOT NULL,
    apiSecret VARCHAR(255) NOT NULL,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$conn->query("CREATE TABLE IF NOT EXISTS forum_registrations (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(100) NOT NULL,
    organization VARCHAR(255),
    address VARCHAR(255),
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Cameroon',
    postalCode VARCHAR(50),
    category VARCHAR(100) DEFAULT 'Standard',
    payment_status VARCHAR(50) DEFAULT 'pending',
    amount_paid VARCHAR(100) DEFAULT '0 XAF',
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$conn->query("CREATE TABLE IF NOT EXISTS roles_permissions (
    id VARCHAR(100) PRIMARY KEY,
    role VARCHAR(100) UNIQUE NOT NULL,
    modules TEXT NOT NULL,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$conn->query("CREATE TABLE IF NOT EXISTS course_sections (
    id VARCHAR(100) PRIMARY KEY,
    courseId VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    orderIndex INT DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$conn->query("CREATE TABLE IF NOT EXISTS course_topics (
    id VARCHAR(100) PRIMARY KEY,
    sectionId VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    materialUrl TEXT,
    materialType VARCHAR(50),
    orderIndex INT DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$conn->query("CREATE TABLE IF NOT EXISTS course_exams (
    id VARCHAR(100) PRIMARY KEY,
    courseId VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    passScore INT DEFAULT 80,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$conn->query("CREATE TABLE IF NOT EXISTS course_exam_questions (
    id VARCHAR(100) PRIMARY KEY,
    examId VARCHAR(100) NOT NULL,
    questionType VARCHAR(50) DEFAULT 'multiple_choice',
    questionText TEXT NOT NULL,
    options TEXT,
    correctAnswer TEXT NOT NULL,
    orderIndex INT DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$conn->query("CREATE TABLE IF NOT EXISTS user_progress (
    id VARCHAR(100) PRIMARY KEY,
    userId VARCHAR(100) NOT NULL,
    courseId VARCHAR(100) NOT NULL,
    sectionId VARCHAR(100),
    topicId VARCHAR(100),
    status VARCHAR(50) DEFAULT 'completed',
    completedAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$conn->query("CREATE TABLE IF NOT EXISTS user_certificates (
    id VARCHAR(100) PRIMARY KEY,
    userId VARCHAR(100) NOT NULL,
    courseId VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    certificateUrl TEXT,
    issuedAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$conn->query("CREATE TABLE IF NOT EXISTS support_tickets (
    id VARCHAR(100) PRIMARY KEY,
    userId VARCHAR(191) NOT NULL,
    cardId VARCHAR(100) DEFAULT NULL,
    transactionId VARCHAR(100) DEFAULT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    adminResponse TEXT DEFAULT NULL,
    status ENUM('open', 'resolved') DEFAULT 'open',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$conn->query("CREATE TABLE IF NOT EXISTS card_transactions (
    id VARCHAR(100) PRIMARY KEY,
    cardId VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'XAF',
    merchant VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'completed',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

// Seed default roles if empty
$resRoles = $conn->query("SELECT count(*) as count FROM roles_permissions");
$rowRoles = $resRoles->fetch_assoc();
if ($rowRoles['count'] == 0) {
    $conn->query("INSERT INTO roles_permissions (id, role, modules) VALUES ('1', 'super_admin', '[\"all\"]')");
    $conn->query("INSERT INTO roles_permissions (id, role, modules) VALUES ('2', 'admin', '[\"marketplace\", \"users\", \"orders\", \"finance\"]')");
    $conn->query("INSERT INTO roles_permissions (id, role, modules) VALUES ('3', 'manager', '[\"marketplace\", \"orders\", \"logistics\"]')");
    $conn->query("INSERT INTO roles_permissions (id, role, modules) VALUES ('4', 'support', '[\"users\", \"orders\"]')");
}

// Ensure courses table has certificate template columns (if they don't already exist)
$checkCol = @$conn->query("SHOW COLUMNS FROM courses LIKE 'certParticipationUrl'");
if ($checkCol && $checkCol->num_rows === 0) {
    @$conn->query("ALTER TABLE courses ADD COLUMN certParticipationUrl TEXT AFTER videoUrl;");
}
$checkCol2 = @$conn->query("SHOW COLUMNS FROM courses LIKE 'certCompletionUrl'");
if ($checkCol2 && $checkCol2->num_rows === 0) {
    @$conn->query("ALTER TABLE courses ADD COLUMN certCompletionUrl TEXT AFTER certParticipationUrl;");
}
} catch (Exception $e) {
    // Ignore schema modification errors on production
}

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
    ob_start();
    $smtpHost = "ssl://smtp.gmail.com";
    $smtpPort = 465;
    $smtpUser = "podoremetropolis@gmail.com";
    $smtpPass = "ptfjtrjyaidmyqrf";

    if ($conn) {
        $conn->query("REPLACE INTO smtp_settings (id, smtpHost, smtpPort, smtpUser, smtpPass, updatedAt) VALUES (1, 'smtp.gmail.com', '465', 'podoremetropolis@gmail.com', 'ptfjtrjyaidmyqrf', NOW())");

        $res = $conn->query("SELECT * FROM smtp_settings ORDER BY id DESC LIMIT 1");
        if ($res && $row = $res->fetch_assoc()) {
            if (!empty($row['smtpHost'])) {
                $smtpHost = (strpos($row['smtpHost'], 'ssl://') === false && strpos($row['smtpHost'], 'tls://') === false && intval($row['smtpPort']) == 465) 
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

    $readSmtp = function($sock) {
        $data = "";
        if (!$sock) return $data;
        while ($line = @fgets($sock, 512)) {
            $data .= $line;
            if (substr($line, 3, 1) === " ") break;
        }
        return $data;
    };

    $socket = @fsockopen($smtpHost, $smtpPort, $errno, $errstr, 15);
    if (!$socket) {
        $mailHeaders = "MIME-Version: 1.0\r\nContent-type:text/html;charset=UTF-8\r\nFrom: CameMark <" . $smtpUser . ">\r\n";
        @mail($toEmail, $subject, $message, $mailHeaders);
        ob_end_clean();
        return false;
    }

    $readSmtp($socket);
    @fputs($socket, "EHLO CameMark\r\n");
    $readSmtp($socket);
    @fputs($socket, "AUTH LOGIN\r\n");
    $readSmtp($socket);
    @fputs($socket, base64_encode($smtpUser) . "\r\n");
    $readSmtp($socket);
    @fputs($socket, base64_encode($smtpPass) . "\r\n");
    $readSmtp($socket);
    @fputs($socket, "MAIL FROM: <" . $smtpUser . ">\r\n");
    $readSmtp($socket);
    @fputs($socket, "RCPT TO: <" . $toEmail . ">\r\n");
    $readSmtp($socket);
    @fputs($socket, "DATA\r\n");
    $readSmtp($socket);
    @fputs($socket, $emailData . "\r\n");
    $readSmtp($socket);
    @fputs($socket, "QUIT\r\n");
    @fclose($socket);

    ob_end_clean();
    return true;
}

// Helper function to create in-app notification
function create_inapp_notification($conn, $userId, $title, $message) {
    $notifId = generate_uuid();
    $now = date('Y-m-d H:i:s');
    $stmt = $conn->prepare("INSERT INTO notifications (id, userId, title, message, isRead, createdAt) VALUES (?, ?, ?, ?, 0, ?)");
    if ($stmt) {
        $stmt->bind_param("sssss", $notifId, $userId, $title, $message, $now);
        $stmt->execute();
        $stmt->close();
    }
}

// Helper function to log user activity (what the user does on the platform)
function log_user_activity($conn, $userId, $action, $details = '') {
    try {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
        $stmt = $conn->prepare("INSERT INTO user_activity_logs (userId, action, details, ipAddress, userAgent) VALUES (?, ?, ?, ?, ?)");
        if ($stmt) {
            $stmt->bind_param("sssss", $userId, $action, $details, $ip, $ua);
            $stmt->execute();
            $stmt->close();
        }
    } catch (Exception $e) {
        // Silently ignore activity log errors (e.g., table doesn't exist)
    }
}
// JWT Configuration
$jwt_secret = "camemark_super_secret_key_2026_!@#";

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data) {
    return base64_decode(strtr($data, '-_', '+/'));
}

function generate_jwt($payload) {
    global $jwt_secret;
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $base64UrlHeader = base64url_encode($header);
    
    // Add expiration (24 hours)
    if (!isset($payload['exp'])) {
        $payload['exp'] = time() + (24 * 60 * 60);
    }
    
    $base64UrlPayload = base64url_encode(json_encode($payload));
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $jwt_secret, true);
    $base64UrlSignature = base64url_encode($signature);
    
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

// Helper function to upload files to Cloudinary using their REST API
function upload_to_cloudinary($conn, $tmpFilePath, $resourceType = 'auto') {
    $res = $conn->query("SELECT cloudName, apiKey, apiSecret FROM cloudinary_settings ORDER BY id DESC LIMIT 1");
    if (!$res || $res->num_rows === 0) return null;
    $row = $res->fetch_assoc();
    
    $cloudName = $row['cloudName'];
    $apiKey = $row['apiKey'];
    $apiSecret = $row['apiSecret'];

    $timestamp = time();
    // Generate signature: signature = SHA1(timestamp=<timestamp><api_secret>)
    $strToSign = "timestamp=" . $timestamp . $apiSecret;
    $signature = sha1($strToSign);

    $url = "https://api.cloudinary.com/v1_1/" . $cloudName . "/" . $resourceType . "/upload";

    $cfile = new CURLFile($tmpFilePath);
    
    $postData = [
        'file' => $cfile,
        'api_key' => $apiKey,
        'timestamp' => $timestamp,
        'signature' => $signature
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200) {
        $json = json_decode($response, true);
        return $json['secure_url'] ?? null;
    }
    return null;
}

function verify_jwt($token) {
    global $jwt_secret;
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    
    list($base64UrlHeader, $base64UrlPayload, $base64UrlSignature) = $parts;
    
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $jwt_secret, true);
    $base64UrlSignatureExpected = base64url_encode($signature);
    
    if (hash_equals($base64UrlSignatureExpected, $base64UrlSignature)) {
        $payload = json_decode(base64url_decode($base64UrlPayload), true);
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return null; // Expired
        }
        return $payload;
    }
    return null;
}

function authenticate_request() {
    $authHeader = null;
    if (isset($_SERVER['Authorization'])) {
        $authHeader = trim($_SERVER["Authorization"]);
    } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = trim($_SERVER["HTTP_AUTHORIZATION"]);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        $requestHeaders = array_combine(array_map('strtolower', array_keys($requestHeaders)), array_values($requestHeaders));
        if (isset($requestHeaders['authorization'])) {
            $authHeader = trim($requestHeaders['authorization']);
        }
    } elseif (function_exists('getallheaders')) {
        $requestHeaders = getallheaders();
        $requestHeaders = array_combine(array_map('strtolower', array_keys($requestHeaders)), array_values($requestHeaders));
        if (isset($requestHeaders['authorization'])) {
            $authHeader = trim($requestHeaders['authorization']);
        }
    }
    
    if (empty($authHeader)) return null;
    
    $parts = explode(" ", $authHeader);
    if (count($parts) === 2 && strcasecmp($parts[0], 'Bearer') === 0) {
        return verify_jwt($parts[1]);
    }
    return null;
}
?>
