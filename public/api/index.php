<?php
// Unified Clean Router for /api Endpoint Routing
require_once __DIR__ . '/config.php';

if (strpos($uri, 'create_login_logs') !== false) {
    require_once __DIR__ . '/create_login_logs.php';
    exit();
}

if (strpos($uri, 'admin-forum-registrations') !== false) {
    require_once __DIR__ . '/admin-forum-registrations.php';
    exit();
}

if (strpos($uri, 'forum-register') !== false) {
    require_once __DIR__ . '/forum-register.php';
    exit();
}

if (strpos($uri, 'popup-banner') !== false) {
    require_once __DIR__ . '/popup-banner.php';
    exit();
}

if (strpos($uri, 'payment-settings') !== false) {
    require_once __DIR__ . '/payment-settings.php';
    exit();
}

if (strpos($uri, 'tranzak-payment') !== false) {
    require_once __DIR__ . '/tranzak-payment.php';
    exit();
}

if (strpos($uri, 'referrals') !== false) {
    require_once __DIR__ . '/referrals.php';
    exit();
}

if (strpos($uri, 'send-email') !== false) {
    require_once __DIR__ . '/send-email.php';
    exit();
}

if (strpos($uri, 'seller-withdraw') !== false) {
    require_once __DIR__ . '/seller-withdraw.php';
    exit();
}

if (strpos($uri, 'offline-sync') !== false) {
    require_once __DIR__ . '/offline-sync.php';
    exit();
}

if (strpos($uri, 'bargains') !== false) {
    require_once __DIR__ . '/bargains.php';
    exit();
}

if (strpos($uri, 'products') !== false) {
    require_once __DIR__ . '/products.php';
    exit();
}

if (strpos($uri, 'saved_items') !== false) {
    require_once __DIR__ . '/saved_items.php';
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

if (strpos($uri, 'user-data') !== false) {
    require_once __DIR__ . '/user-data.php';
    exit();
}

if (strpos($uri, 'upload') !== false) {
    require_once __DIR__ . '/upload.php';
    exit();
}

if (strpos($uri, 'forgot-password') !== false) {
    require_once __DIR__ . '/forgot-password.php';
    exit();
}

if (strpos($uri, 'reset-password') !== false) {
    require_once __DIR__ . '/reset-password.php';
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
            
            log_user_activity($conn, $userId, "signup", "User registered an account");

            // Generate OTP
            $otpCode = (string) mt_rand(100000, 999999);
            $otpExpiresAt = date('Y-m-d H:i:s', strtotime('+15 minutes'));
            
            // Save OTP
            $otpStmt = $conn->prepare("UPDATE users SET otpCode = ?, otpExpiresAt = ? WHERE id = ?");
            $otpStmt->bind_param("sss", $otpCode, $otpExpiresAt, $userId);
            $otpStmt->execute();
            $otpStmt->close();

            // Send OTP email
            $subject = "Verify your CameMark account";
            $htmlBody = "<h3>Welcome to CameMark!</h3><p>Your verification code is: <strong>$otpCode</strong></p><p>This code will expire in 15 minutes.</p>";
            send_html_email($email, $subject, $htmlBody, $conn);

            http_response_code(201);
            echo json_encode([
                "message" => "Registration successful. Please check your email for the OTP.",
                "requires_otp" => true
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

    $ipFailures = 0;
    $accFailures = 0;
    
    try {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        if (strpos($ip, ',') !== false) {
            $ip = explode(',', $ip)[0];
        }
        
        // Check IP rate limit (last 5 minutes)
        $ipStmt = $conn->prepare("SELECT COUNT(*) as cnt FROM login_logs WHERE ipAddress = ? AND status = 'FAILED' AND createdAt > (NOW() - INTERVAL 5 MINUTE)");
        if ($ipStmt) {
            $ipStmt->bind_param("s", $ip);
            $ipStmt->execute();
            $ipFailures = (int)$ipStmt->get_result()->fetch_assoc()['cnt'];
            $ipStmt->close();
        }

        // Check Account rate limit (last 15 minutes)
        $accStmt = $conn->prepare("SELECT COUNT(*) as cnt FROM login_logs WHERE email = ? AND status = 'FAILED' AND createdAt > (NOW() - INTERVAL 15 MINUTE)");
        if ($accStmt) {
            $accStmt->bind_param("s", $email);
            $accStmt->execute();
            $accFailures = (int)$accStmt->get_result()->fetch_assoc()['cnt'];
            $accStmt->close();
        }

        // IP block: 10 failures -> lock for 15 mins
        $ipLockStmt = $conn->prepare("SELECT COUNT(*) as cnt FROM login_logs WHERE ipAddress = ? AND status = 'FAILED' AND createdAt > (NOW() - INTERVAL 15 MINUTE)");
        if ($ipLockStmt) {
            $ipLockStmt->bind_param("s", $ip);
            $ipLockStmt->execute();
            $ipLockCount = (int)$ipLockStmt->get_result()->fetch_assoc()['cnt'];
            $ipLockStmt->close();
            if ($ipLockCount >= 10) {
                http_response_code(429);
                echo json_encode(["error" => "Too many failed attempts from this IP. Please try again in 15 minutes."]);
                exit();
            }
        }

        // Account block: 5 failures -> lock for 1 min
        $accLockStmt = $conn->prepare("SELECT COUNT(*) as cnt FROM login_logs WHERE email = ? AND status = 'FAILED' AND createdAt > (NOW() - INTERVAL 1 MINUTE)");
        if ($accLockStmt) {
            $accLockStmt->bind_param("s", $email);
            $accLockStmt->execute();
            $accLockCount = (int)$accLockStmt->get_result()->fetch_assoc()['cnt'];
            $accLockStmt->close();
            if ($accLockCount >= 5) {
                http_response_code(429);
                echo json_encode(["error" => "Too many failed attempts for this account. Please try again in 1 minute."]);
                exit();
            }
        }

        // Progressive delays based on max failures
        $maxFailures = max($ipFailures, $accFailures);
        if ($maxFailures == 2) sleep(1);
        else if ($maxFailures == 3) sleep(2);
        else if ($maxFailures == 4) sleep(5);
        else if ($maxFailures >= 5) sleep(15);
    } catch (Exception $e) {
        // Table login_logs might not exist, silently ignore
    }

    $stmt = $conn->prepare("SELECT id, email, passwordHash, fullName, role, preferredCurrency, isVerified, lastLoginAt FROM users WHERE email = ?");
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $conn->error]);
        exit();
    }
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        if (password_verify($password, $row['passwordHash'])) {
            // Check if OTP is required (not verified, or last login was > 7 days ago)
            $requiresOtp = false;
            if (!$row['isVerified']) {
                $requiresOtp = true;
            } else {
                $lastLogin = strtotime($row['lastLoginAt']);
                $sevenDaysAgo = strtotime('-7 days');
                if (!$lastLogin || $lastLogin < $sevenDaysAgo) {
                    $requiresOtp = true;
                }
            }

            if ($requiresOtp) {
                // Generate OTP
                $otpCode = (string) mt_rand(100000, 999999);
                $otpExpiresAt = date('Y-m-d H:i:s', strtotime('+15 minutes'));
                
                // Save OTP
                $otpStmt = $conn->prepare("UPDATE users SET otpCode = ?, otpExpiresAt = ? WHERE id = ?");
                if (!$otpStmt) {
                    http_response_code(500);
                    echo json_encode(["error" => "Database error on OTP save: " . $conn->error]);
                    exit();
                }
                $otpStmt->bind_param("sss", $otpCode, $otpExpiresAt, $row['id']);
                $otpStmt->execute();
                $otpStmt->close();

                // Send OTP email
                $subject = "Your CameMark Login OTP";
                $htmlBody = "<h3>CameMark Login</h3><p>Your OTP code is: <strong style='font-size: 20px; letter-spacing: 2px;'>" . $otpCode . "</strong></p><p>This code will expire in 15 minutes.</p>";
                send_html_email($email, $subject, $htmlBody, $conn);

                http_response_code(200);
                echo json_encode([
                    "message" => "Please check your email for the OTP.",
                    "requires_otp" => true
                ]);
                exit();
            }

            // Normal login if OTP is not required
            $token = generate_jwt([
                "sub" => $row['id'],
                "email" => $row['email'],
                "role" => $row['role']
            ]);

            // Get wallet balance
            $wstmt = $conn->prepare("SELECT balance FROM wallets WHERE userId = ?");
            if (!$wstmt) {
                http_response_code(500);
                echo json_encode(["error" => "Database error on wallet fetch: " . $conn->error]);
                exit();
            }
            $wstmt->bind_param("s", $row['id']);
            $wstmt->execute();
            $wres = $wstmt->get_result();
            $walletData = $wres->fetch_assoc() ?: ["balance" => 0.0, "currency" => $row['preferredCurrency']];
            $wstmt->close();

            log_user_activity($conn, $row['id'], "login", "User logged into their account");

            // Log successful login attempt
            $location = 'Unknown Location';
            if ($ip === '::1' || $ip === '127.0.0.1' || $ip === 'localhost') {
                $location = 'Localhost';
            } else {
                $ctx = stream_context_create(['http' => ['timeout' => 2]]);
                $json = @file_get_contents("http://ip-api.com/json/{$ip}", false, $ctx);
                if ($json) {
                    $geo = json_decode($json, true);
                    if (isset($geo['status']) && $geo['status'] === 'success') {
                        $location = $geo['city'] . ', ' . $geo['country'];
                    }
                }
            }
            
            try {
                $logId = bin2hex(random_bytes(16));
                $logStmt = $conn->prepare("INSERT INTO login_logs (id, email, ipAddress, location, status) VALUES (?, ?, ?, ?, 'SUCCESS')");
                if ($logStmt) {
                    $logStmt->bind_param("ssss", $logId, $email, $ip, $location);
                    $logStmt->execute();
                    $logStmt->close();
                }
            } catch (Exception $e) {}

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
                    "wallet" => ["balance" => (float)$walletData['balance'], "currency" => $row['preferredCurrency']]
                ]
            ]);
            exit();
        }
    }

    // Log failed attempt
    $location = 'Unknown Location';
    if ($ip === '::1' || $ip === '127.0.0.1' || $ip === 'localhost') {
        $location = 'Localhost';
    } else {
        $ctx = stream_context_create(['http' => ['timeout' => 2]]);
        $json = @file_get_contents("http://ip-api.com/json/{$ip}", false, $ctx);
        if ($json) {
            $geo = json_decode($json, true);
            if (isset($geo['status']) && $geo['status'] === 'success') {
                $location = $geo['city'] . ', ' . $geo['country'];
            }
        }
    }
    
    try {
        $logId = bin2hex(random_bytes(16));
        $logStmt = $conn->prepare("INSERT INTO login_logs (id, email, ipAddress, location, status) VALUES (?, ?, ?, ?, 'FAILED')");
        if ($logStmt) {
            $logStmt->bind_param("ssss", $logId, $email, $ip, $location);
            $logStmt->execute();
            $logStmt->close();
        }
    } catch (Exception $e) {}
    
    // Security email on 3rd failure
    if ($accFailures + 1 == 3) {
        $userName = "User";
        $nameStmt = $conn->prepare("SELECT fullName FROM users WHERE email = ?");
        if ($nameStmt) {
            $nameStmt->bind_param("s", $email);
            $nameStmt->execute();
            $nameRes = $nameStmt->get_result()->fetch_assoc();
            if ($nameRes && !empty($nameRes['fullName'])) {
                $userName = explode(' ', trim($nameRes['fullName']))[0];
            }
            $nameStmt->close();
        }

        $subject = "Security Alert: Failed Login Attempts";
        $htmlBody = "<h3>Hi {$userName},</h3>
<p>We noticed 3 failed login attempts to your CameMark account just now.</p>
<p><strong>IP Address:</strong> {$ip}<br/>
<strong>Location:</strong> {$location}</p>
<p>If this was you, you can ignore this email or use the \"Forgot Password\" feature if you need a reset.</p>
<p>If this wasn't you, someone may be trying to access your account. Please consider resetting your password immediately.</p>";

        send_html_email($email, $subject, $htmlBody, $conn);
    }

    http_response_code(401);
    echo json_encode(["error" => "Invalid email or password."]);
    exit();
}

// 2.5 Verify OTP Endpoint
if (strpos($uri, 'verify-otp') !== false) {
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);

    $email = isset($data['email']) ? strtolower(trim($data['email'])) : '';
    $otp = isset($data['otp']) ? trim($data['otp']) : '';

    if (empty($email) || empty($otp)) {
        http_response_code(400);
        echo json_encode(["error" => "Email and OTP are required."]);
        exit();
    }

    $stmt = $conn->prepare("SELECT id, email, fullName, role, preferredCurrency, otpCode, otpExpiresAt FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        $now = date('Y-m-d H:i:s');
        if ($row['otpCode'] === $otp && $row['otpExpiresAt'] > $now) {
            // OTP is valid
            // Clear OTP and set verified
            $updateStmt = $conn->prepare("UPDATE users SET otpCode = NULL, otpExpiresAt = NULL, isVerified = 1, lastLoginAt = NOW() WHERE id = ?");
            if (!$updateStmt) {
                http_response_code(500);
                echo json_encode(["error" => "Database error on update: " . $conn->error]);
                exit();
            }
            $updateStmt->bind_param("s", $row['id']);
            $updateStmt->execute();
            $updateStmt->close();

            // Generate JWT and finalize login
            $token = generate_jwt([
                "sub" => $row['id'],
                "email" => $row['email'],
                "role" => $row['role']
            ]);

            // Fetch wallet
            $wstmt = $conn->prepare("SELECT balance, currency FROM wallets WHERE userId = ?");
            if (!$wstmt) {
                http_response_code(500);
                echo json_encode(["error" => "Database error on wallets: " . $conn->error]);
                exit();
            }
            $wstmt->bind_param("s", $row['id']);
            $wstmt->execute();
            $wres = $wstmt->get_result();
            $walletData = $wres->fetch_assoc() ?: ["balance" => 0.0, "currency" => $row['preferredCurrency']];
            $wstmt->close();

            log_user_activity($conn, $row['id'], "login", "User verified OTP and logged in");

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
        } else {
            http_response_code(401);
            echo json_encode(["error" => "Invalid or expired OTP."]);
            exit();
        }
    }

    http_response_code(404);
    echo json_encode(["error" => "User not found."]);
    exit();
}

// 3. Dummy endpoints for admin dashboard
if (strpos($uri, 'orders') !== false) {
    echo json_encode([]);
    exit();
}
if (strpos($uri, 'delivery-fees') !== false) {
    echo json_encode([
        "standardFee" => 1500,
        "expressFee" => 3000,
        "pickupFee" => 0,
        "freeDeliveryThreshold" => 50000
    ]);
    exit();
}
if (strpos($uri, 'smtp') !== false) {
    echo json_encode([
        "host" => "smtp.gmail.com",
        "port" => "465",
        "user" => "podoremetropolis@gmail.com",
        "pass" => "ptfjtrjyaidmyqrf",
        "senderName" => "CameMark Marketplace"
    ]);
    exit();
}
if (strpos($uri, 'admin/users') !== false) {
    require_once __DIR__ . '/admin-users.php';
    exit();
}

if (strpos($uri, 'admin/roles') !== false) {
    require_once __DIR__ . '/admin-roles.php';
    exit();
}

http_response_code(404);
echo json_encode(["error" => "Endpoint not found."]);
?>
