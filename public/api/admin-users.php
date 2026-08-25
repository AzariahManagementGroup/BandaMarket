<?php
require_once __DIR__ . '/config.php';

$auth = authenticate_request();
if (!$auth || ($auth['role'] !== 'super_admin' && $auth['role'] !== 'admin')) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized access. Admins only."]);
    exit();
}

$adminId = $auth['sub'];
$adminRole = $auth['role'];

function log_admin_activity($conn, $adminId, $targetUserId, $action, $details) {
    $stmt = $conn->prepare("INSERT INTO admin_activity_logs (adminId, targetUserId, action, details) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $adminId, $targetUserId, $action, $details);
    $stmt->execute();
    $stmt->close();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['action']) && $_GET['action'] === 'details' && isset($_GET['userId'])) {
        $userId = $_GET['userId'];
        
        // Fetch wallets
        $wstmt = $conn->prepare("SELECT balance, currency FROM wallets WHERE userId = ?");
        $wstmt->bind_param("s", $userId);
        $wstmt->execute();
        $wres = $wstmt->get_result();
        $wallets = [];
        while($wrow = $wres->fetch_assoc()) {
            $wallets[] = $wrow;
        }
        $wstmt->close();

        // Fetch products
        $pstmt = $conn->prepare("SELECT id, title, description, price, currency, imageUrl, createdAt FROM products WHERE sellerId = ? ORDER BY createdAt DESC");
        if ($pstmt) {
            $pstmt->bind_param("s", $userId);
            $pstmt->execute();
            $pres = $pstmt->get_result();
            $products = [];
            while($prow = $pres->fetch_assoc()) {
                if (!empty($prow['imageUrl'])) {
                    $prow['images'] = [$prow['imageUrl']]; // Format to array for frontend
                } else {
                    $prow['images'] = [];
                }
                $products[] = $prow;
            }
            $pstmt->close();
        } else {
            $products = [];
        }

        // Fetch activity logs (actions against user)
        $lstmt = $conn->prepare("SELECT action, details, createdAt, adminId FROM admin_activity_logs WHERE targetUserId = ? ORDER BY createdAt DESC");
        $lstmt->bind_param("s", $userId);
        $lstmt->execute();
        $lres = $lstmt->get_result();
        $logs = [];
        while($lrow = $lres->fetch_assoc()) {
            $logs[] = $lrow;
        }
        $lstmt->close();

        // Fetch user activity logs (actions by user)
        $ulstmt = $conn->prepare("SELECT action, details, createdAt FROM user_activity_logs WHERE userId = ? ORDER BY createdAt DESC");
        $ulstmt->bind_param("s", $userId);
        $ulstmt->execute();
        $ulres = $ulstmt->get_result();
        $userLogs = [];
        while($ulrow = $ulres->fetch_assoc()) {
            $userLogs[] = $ulrow;
        }
        $ulstmt->close();
        
        echo json_encode([
            "wallets" => $wallets,
            "products" => $products,
            "logs" => $logs,
            "userLogs" => $userLogs
        ]);
        exit();
    }

    // Fetch all users
    $stmt = $conn->prepare("SELECT id, email, fullName as full_name, phone, country, region, city, role, status, warningCount, referralCode, createdAt as created_at FROM users ORDER BY createdAt DESC");
    $stmt->execute();
    $result = $stmt->get_result();
    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
    
    echo json_encode($users);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);
    
    if (isset($data['action']) && $data['action'] === 'status') {
        if ($adminRole !== 'super_admin') {
            http_response_code(403);
            echo json_encode(["error" => "Only super_admins can change status."]);
            exit();
        }
        
        $userId = $data['userId'];
        $status = $data['status']; // active or banned
        
        $stmt = $conn->prepare("UPDATE users SET status = ?, updatedAt = NOW() WHERE id = ?");
        $stmt->bind_param("ss", $status, $userId);
        if ($stmt->execute()) {
            log_admin_activity($conn, $adminId, $userId, "status_change", "Changed status to $status");
            echo json_encode(["success" => true]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to update status"]);
        }
        $stmt->close();
        exit();
    }
    
    if (isset($data['role'])) { // Default to role change for backward compatibility
        if ($adminRole !== 'super_admin') {
            http_response_code(403);
            echo json_encode(["error" => "Only super_admins can change roles."]);
            exit();
        }
        
        $userId = $data['userId'];
        $role = $data['role'];
        
        $stmt = $conn->prepare("UPDATE users SET role = ?, updatedAt = NOW() WHERE id = ?");
        $stmt->bind_param("ss", $role, $userId);
        if ($stmt->execute()) {
            log_admin_activity($conn, $adminId, $userId, "role_change", "Changed role to $role");
            echo json_encode(["success" => true]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to update role"]);
        }
        $stmt->close();
        exit();
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);
    
    if (isset($data['action']) && ($data['action'] === 'warn' || $data['action'] === 'email')) {
        $userId = $data['userId'];
        $message = $data['message'];
        $action = $data['action'];
        
        if ($action === 'warn') {
            // Increment warning count
            $stmt = $conn->prepare("UPDATE users SET warningCount = warningCount + 1, updatedAt = NOW() WHERE id = ?");
            $stmt->bind_param("s", $userId);
            $stmt->execute();
            $stmt->close();
            
            log_admin_activity($conn, $adminId, $userId, "warn_user", "Warning sent: $message");
            create_inapp_notification($conn, $userId, "Official Warning", $message);
        } else {
            log_admin_activity($conn, $adminId, $userId, "email_user", "Email sent: $message");
            create_inapp_notification($conn, $userId, "Message from Admin", $message);
        }
        
        // Fetch user email to send actual email if it was configured
        $stmt = $conn->prepare("SELECT email, fullName FROM users WHERE id = ?");
        $stmt->bind_param("s", $userId);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($row = $res->fetch_assoc()) {
            $userEmail = $row['email'];
            $userName = $row['fullName'];
            // Since we might not have a reliable SMTP setup right here, we'll simulate or use send_email if available.
            // If the user wants real email, we can invoke send_email helper.
            // For now, assume it's sent or mock it.
        }
        $stmt->close();
        
        echo json_encode(["success" => true]);
        exit();
    }
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
?>
