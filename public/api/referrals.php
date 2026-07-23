<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config.php';

$pdo = get_db_connection();

// 1. Auto-create referral_settings and referrals tables
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS referral_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            setting_key VARCHAR(100) UNIQUE NOT NULL,
            setting_value VARCHAR(255) NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS referrals (
            id INT AUTO_INCREMENT PRIMARY KEY,
            referrer_id VARCHAR(100) NOT NULL,
            referrer_name VARCHAR(255) NOT NULL,
            referrer_email VARCHAR(255) NULL,
            ref_code VARCHAR(100) NOT NULL,
            referred_user_id VARCHAR(100) NULL,
            referred_user_name VARCHAR(255) NULL,
            referred_user_email VARCHAR(255) NULL,
            reward_amount DECIMAL(10, 2) DEFAULT 20.00,
            status VARCHAR(50) DEFAULT 'completed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    // Auto-seed default reward amount setting to 20
    $stmt = $pdo->prepare("SELECT id FROM referral_settings WHERE setting_key = 'referral_reward_amount'");
    $stmt->execute();
    if (!$stmt->fetch()) {
        $seedStmt = $pdo->prepare("INSERT INTO referral_settings (setting_key, setting_value) VALUES ('referral_reward_amount', '20')");
        $seedStmt->execute();
    }

    // Auto-seed initial sample referral for demo if table empty
    $countStmt = $pdo->query("SELECT COUNT(*) FROM referrals");
    if ($countStmt && $countStmt->fetchColumn() == 0) {
        $seedRef = $pdo->prepare("
            INSERT INTO referrals (referrer_id, referrer_name, referrer_email, ref_code, referred_user_name, referred_user_email, reward_amount, status)
            VALUES 
            ('user-demo-1', 'Taiwo Taiwo', 'taiwo@camemark.com', 'taiwo', 'Paul Biya', 'paul@camemark.com', 20.00, 'completed'),
            ('user-demo-1', 'Taiwo Taiwo', 'taiwo@camemark.com', 'taiwo', 'Marie Eto', 'marie@camemark.com', 20.00, 'completed')
        ");
        $seedRef->execute();
    }
} catch (Exception $e) {
    // Continue even if DB auto-init throws warning
}

// Function to fetch active reward amount (default 20)
function get_referral_reward_amount($pdo) {
    try {
        $stmt = $pdo->prepare("SELECT setting_value FROM referral_settings WHERE setting_key = 'referral_reward_amount'");
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row && is_numeric($row['setting_value'])) {
            return (float)$row['setting_value'];
        }
    } catch (Exception $e) {}
    return 20.0;
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET') {
    $userId = $_GET['user_id'] ?? $_GET['userId'] ?? 'user-default';
    $userName = $_GET['user_name'] ?? $_GET['userName'] ?? 'User';
    $userEmail = $_GET['user_email'] ?? $_GET['userEmail'] ?? '';

    // Generate clean refCode containing user's name
    $cleanName = strtolower(trim(preg_replace('/[^a-zA-Z0-9]/', '', $userName)));
    $refCode = !empty($cleanName) ? $cleanName : 'user' . substr(md5($userId), 0, 6);

    $rewardAmount = get_referral_reward_amount($pdo);

    // Fetch user referrals
    $totalReferred = 0;
    $totalEarned = 0.0;
    $recentReferrals = [];

    try {
        $stmt = $pdo->prepare("SELECT * FROM referrals WHERE referrer_id = ? OR ref_code = ? OR referrer_name LIKE ? ORDER BY created_at DESC");
        $stmt->execute([$userId, $refCode, "%" . $userName . "%"]);
        $recentReferrals = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($recentReferrals as $ref) {
            $totalReferred++;
            $totalEarned += (float)($ref['reward_amount'] ?? 20);
        }
    } catch (Exception $e) {
        $recentReferrals = [];
    }

    $protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http");
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost:8080';
    $referralLink = "{$protocol}://{$host}/signup?ref=" . urlencode($refCode);

    echo json_encode([
        "success" => true,
        "rewardAmount" => $rewardAmount,
        "refCode" => $refCode,
        "referralLink" => $referralLink,
        "totalReferred" => $totalReferred,
        "totalEarned" => $totalEarned,
        "recentReferrals" => $recentReferrals
    ]);
    exit();
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true) ?? $_POST;
    $action = $input['action'] ?? $action;

    // 1. Admin Update Referral Reward Amount Setting
    if ($action === 'update_settings' || isset($input['rewardAmount'])) {
        $newAmount = floatval($input['rewardAmount'] ?? 20);
        if ($newAmount < 0) $newAmount = 20;

        try {
            $stmt = $pdo->prepare("
                INSERT INTO referral_settings (setting_key, setting_value) 
                VALUES ('referral_reward_amount', ?) 
                ON DUPLICATE KEY UPDATE setting_value = ?
            ");
            $stmt->execute([strval($newAmount), strval($newAmount)]);

            echo json_encode([
                "success" => true,
                "message" => "Referral reward amount updated to {$newAmount} FCFA!",
                "rewardAmount" => $newAmount
            ]);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
        exit();
    }

    // 2. Claim Referral on Registration
    if ($action === 'claim' || isset($input['refCode']) || isset($input['referralCode'])) {
        $refCode = trim($input['refCode'] ?? $input['referralCode'] ?? '');
        $newUserId = $input['newUserId'] ?? 'new_user_' . time();
        $newUserName = $input['newUserName'] ?? 'New Member';
        $newUserEmail = $input['newUserEmail'] ?? '';

        if (empty($refCode)) {
            echo json_encode(["success" => false, "message" => "No referral code provided."]);
            exit();
        }

        $rewardAmount = get_referral_reward_amount($pdo);

        try {
            // Find referrer details if present
            $referrerId = "ref_" . $refCode;
            $referrerName = ucfirst($refCode);
            $referrerEmail = "";

            $stmt = $pdo->prepare("SELECT referrer_id, referrer_name, referrer_email FROM referrals WHERE ref_code = ? LIMIT 1");
            $stmt->execute([$refCode]);
            $foundRef = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($foundRef) {
                $referrerId = $foundRef['referrer_id'];
                $referrerName = $foundRef['referrer_name'];
                $referrerEmail = $foundRef['referrer_email'];
            }

            // Record completed referral in database
            $insertStmt = $pdo->prepare("
                INSERT INTO referrals (referrer_id, referrer_name, referrer_email, ref_code, referred_user_id, referred_user_name, referred_user_email, reward_amount, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed')
            ");
            $insertStmt->execute([
                $referrerId,
                $referrerName,
                $referrerEmail,
                $refCode,
                $newUserId,
                $newUserName,
                $newUserEmail,
                $rewardAmount
            ]);

            // Attempt to update referrer's wallet balance by rewardAmount
            try {
                $walletStmt = $pdo->prepare("UPDATE wallets SET balance = balance + ? WHERE profile_id = ?");
                $walletStmt->execute([$rewardAmount, $referrerId]);
            } catch (Exception $we) {}

            echo json_encode([
                "success" => true,
                "message" => "Referral claimed! Referrer earned {$rewardAmount} FCFA.",
                "rewardAmount" => $rewardAmount,
                "referrerName" => $referrerName
            ]);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }
        exit();
    }

    // 3. Send Direct Email Invitation
    if ($action === 'invite' || (isset($input['friendEmail']) && isset($input['referralLink']))) {
        $friendEmail = trim($input['friendEmail'] ?? '');
        $friendName = trim($input['friendName'] ?? 'Friend');
        $senderName = trim($input['senderName'] ?? 'A CameMark User');
        $referralLink = trim($input['referralLink'] ?? '');
        $rewardAmount = get_referral_reward_amount($pdo);

        if (empty($friendEmail)) {
            echo json_encode(["success" => false, "message" => "Friend's email is required."]);
            exit();
        }

        $subject = "{$senderName} invited you to join CameMark (Get {$rewardAmount} FCFA Bonus)!";
        $body = "
            <h2>Hello {$friendName},</h2>
            <p><strong>{$senderName}</strong> has invited you to join <strong>CameMark</strong> — Cameroon's premier digital marketplace for buying, selling, and trading farm produce and goods.</p>
            <p>Sign up using {$senderName}'s exclusive referral link below:</p>
            <p><a href='{$referralLink}' style='padding: 10px 20px; background: #064E3B; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;'>Join CameMark Now &rarr;</a></p>
            <p>Direct Link: <a href='{$referralLink}'>{$referralLink}</a></p>
            <p>Best regards,<br>The CameMark Team</p>
        ";

        $mailSent = send_email_helper($friendEmail, $subject, $body);

        echo json_encode([
            "success" => true,
            "message" => $mailSent ? "Invitation email sent to {$friendEmail}!" : "Invitation link generated for {$friendEmail}.",
            "mailSent" => $mailSent
        ]);
        exit();
    }

    echo json_encode(["success" => false, "message" => "Invalid POST action."]);
    exit();
}
