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

// Automatic Schema Initialization
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

$conn->query("CREATE TABLE IF NOT EXISTS smtp_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    smtpHost VARCHAR(255) NOT NULL,
    smtpPort VARCHAR(50) NOT NULL,
    smtpUser VARCHAR(255) NOT NULL,
    smtpPass VARCHAR(255) NOT NULL,
    senderName VARCHAR(255) DEFAULT 'CameMark Marketplace',
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");



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

    if ($conn) {
        $conn->query("REPLACE INTO smtp_settings (id, smtpHost, smtpPort, smtpUser, smtpPass, senderName, updatedAt) VALUES (1, 'smtp.gmail.com', '465', 'podoremetropolis@gmail.com', 'ptfjtrjyaidmyqrf', 'CameMark Marketplace', NOW())");

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
        while ($line = fgets($sock, 512)) {
            $data .= $line;
            if (substr($line, 3, 1) === " ") break;
        }
        return $data;
    };

    $socket = @fsockopen($smtpHost, $smtpPort, $errno, $errstr, 15);
    if (!$socket) {
        $mailHeaders = "MIME-Version: 1.0\r\nContent-type:text/html;charset=UTF-8\r\nFrom: CameMark <" . $smtpUser . ">\r\n";
        @mail($toEmail, $subject, $message, $mailHeaders);
        return false;
    }

    $readSmtp($socket);
    fputs($socket, "EHLO CameMark\r\n");
    $readSmtp($socket);
    fputs($socket, "AUTH LOGIN\r\n");
    $readSmtp($socket);
    fputs($socket, base64_encode($smtpUser) . "\r\n");
    $readSmtp($socket);
    fputs($socket, base64_encode($smtpPass) . "\r\n");
    $readSmtp($socket);
    fputs($socket, "MAIL FROM: <" . $smtpUser . ">\r\n");
    $readSmtp($socket);
    fputs($socket, "RCPT TO: <" . $toEmail . ">\r\n");
    $readSmtp($socket);
    fputs($socket, "DATA\r\n");
    $readSmtp($socket);
    fputs($socket, $emailData . "\r\n");
    $readSmtp($socket);
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
?>
