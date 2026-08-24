<?php
require_once __DIR__ . '/config.php';

// Ensure the user is authenticated via JWT
$user = authenticate_request();
file_put_contents('debug.log', "Headers: " . print_r(getallheaders(), true) . "\nSERVER: " . print_r($_SERVER, true) . "\nAuth returned: " . print_r($user, true) . "\n", FILE_APPEND);
if (!$user) {
    file_put_contents('debug.log', "401 TRIGGERED\n", FILE_APPEND);
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit();
}
$userId = $user['sub'];

$action = isset($_GET['action']) ? $_GET['action'] : '';

// 1. Wallets
if ($action === 'wallets') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $conn->prepare("SELECT balance, currency FROM wallets WHERE userId = ?");
        $stmt->bind_param("s", $userId);
        $stmt->execute();
        $res = $stmt->get_result();
        $wallet = $res->fetch_assoc();
        $stmt->close();
        if ($wallet) {
            echo json_encode($wallet);
        } else {
            echo json_encode(["balance" => 0.0, "currency" => "XAF"]);
        }
        exit();
    } else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents("php://input"), true);
        if (isset($input['amount'])) {
            $amount = floatval($input['amount']);
            $stmt = $conn->prepare("UPDATE wallets SET balance = balance + ? WHERE userId = ?");
            $stmt->bind_param("ds", $amount, $userId);
            $stmt->execute();
            $stmt->close();
            
            // Return updated wallet
            $stmt = $conn->prepare("SELECT balance, currency FROM wallets WHERE userId = ?");
            $stmt->bind_param("s", $userId);
            $stmt->execute();
            $res = $stmt->get_result();
            echo json_encode($res->fetch_assoc());
            $stmt->close();
            exit();
        }
    }
}

// 2. Cards
if ($action === 'cards') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $conn->prepare("SELECT * FROM cards WHERE userId = ?");
        if ($stmt) {
            $stmt->bind_param("s", $userId);
            $stmt->execute();
            $res = $stmt->get_result();
            $cards = [];
            while ($row = $res->fetch_assoc()) {
                $cards[] = $row;
            }
            $stmt->close();
            echo json_encode($cards);
        } else {
            // Table doesn't exist yet, return empty
            echo json_encode([]);
        }
        exit();
    } else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents("php://input"), true);
        $cardNumber = $input['card_number'] ?? '';
        $cardHolderName = $input['card_holder_name'] ?? '';
        $expiryDate = $input['expiry_date'] ?? '';
        $cvv = $input['cvv'] ?? '';
        $type = $input['type'] ?? 'virtual';
        $fee = $input['fee'] ?? 0;
        
        $cardId = generate_uuid();
        $now = date('Y-m-d H:i:s');
        
        // Ensure cards table exists
        $conn->query("CREATE TABLE IF NOT EXISTS cards (
            id VARCHAR(100) PRIMARY KEY,
            userId VARCHAR(100) NOT NULL,
            card_number VARCHAR(100) NOT NULL,
            card_holder_name VARCHAR(255) NOT NULL,
            expiry_date VARCHAR(20) NOT NULL,
            cvv VARCHAR(10) NOT NULL,
            type VARCHAR(50) DEFAULT 'virtual',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
        
        // Deduct fee
        $stmt = $conn->prepare("UPDATE wallets SET balance = balance - ? WHERE userId = ?");
        $stmt->bind_param("ds", $fee, $userId);
        $stmt->execute();
        $stmt->close();
        
        // Insert card
        $stmt = $conn->prepare("INSERT INTO cards (id, userId, card_number, card_holder_name, expiry_date, cvv, type, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssssss", $cardId, $userId, $cardNumber, $cardHolderName, $expiryDate, $cvv, $type, $now);
        if ($stmt->execute()) {
            echo json_encode(["message" => "Card generated successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to create card"]);
        }
        $stmt->close();
        exit();
    }
}

// 3. Orders
if ($action === 'orders') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $conn->prepare("SELECT * FROM orders WHERE buyerId = ? ORDER BY createdAt DESC LIMIT 10");
        if ($stmt) {
            $stmt->bind_param("s", $userId);
            $stmt->execute();
            $res = $stmt->get_result();
            $orders = [];
            while ($row = $res->fetch_assoc()) {
                $orders[] = $row;
            }
            $stmt->close();
            echo json_encode($orders);
        } else {
            echo json_encode([]);
        }
        exit();
    }
}

// 4. Products
if ($action === 'products') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $conn->prepare("SELECT * FROM products ORDER BY createdAt DESC LIMIT 50");
        if ($stmt) {
            $stmt->execute();
            $res = $stmt->get_result();
            $products = [];
            while ($row = $res->fetch_assoc()) {
                $products[] = $row;
            }
            $stmt->close();
            echo json_encode($products);
        } else {
            echo json_encode([]);
        }
        exit();
    }
}

// 5. Notifications
if ($action === 'notifications') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $conn->prepare("SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT 20");
        if ($stmt) {
            $stmt->bind_param("s", $userId);
            $stmt->execute();
            $res = $stmt->get_result();
            $notifications = [];
            while ($row = $res->fetch_assoc()) {
                $notifications[] = $row;
            }
            $stmt->close();
            echo json_encode($notifications);
        } else {
            echo json_encode([]);
        }
        exit();
    }
}

// 6. Deliveries
if ($action === 'deliveries') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $conn->prepare("SELECT * FROM deliveries WHERE userId = ? ORDER BY createdAt DESC LIMIT 10");
        if ($stmt) {
            $stmt->bind_param("s", $userId);
            $stmt->execute();
            $res = $stmt->get_result();
            $deliveries = [];
            while ($row = $res->fetch_assoc()) {
                $deliveries[] = $row;
            }
            $stmt->close();
            echo json_encode($deliveries);
        } else {
            echo json_encode([]);
        }
        exit();
    }
}

// 7. Farmers
if ($action === 'farmers') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $conn->prepare("SELECT * FROM farmers ORDER BY createdAt DESC LIMIT 20");
        if ($stmt) {
            $stmt->execute();
            $res = $stmt->get_result();
            $farmers = [];
            while ($row = $res->fetch_assoc()) {
                $farmers[] = $row;
            }
            $stmt->close();
            echo json_encode($farmers);
        } else {
            echo json_encode([]);
        }
        exit();
    }
}

// If no matched action
http_response_code(404);
echo json_encode(["error" => "Endpoint not found"]);
?>
