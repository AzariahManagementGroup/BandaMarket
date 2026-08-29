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
            // Fetch user email to send notification
            $stmtUser = $conn->prepare("SELECT email FROM users WHERE id = ?");
            if ($stmtUser) {
                $stmtUser->bind_param("s", $userId);
                $stmtUser->execute();
                $resUser = $stmtUser->get_result();
                $userRow = $resUser->fetch_assoc();
                $stmtUser->close();
                
                if ($userRow && !empty($userRow['email'])) {
                    $userEmail = $userRow['email'];
                    $maskedCard = "**** **** **** " . substr(str_replace(' ', '', $cardNumber), -4);
                    $cardType = ucfirst($type);
                    $subject = "Your New CameMark {$cardType} Card is Ready!";
                    $body = "<h2>Hello {$cardHolderName},</h2>
                             <p>Your new CameMark <strong>{$cardType} Card</strong> has been successfully generated and is ready to use.</p>
                             <p><strong>Card Details:</strong></p>
                             <ul>
                                <li>Card Number: {$maskedCard}</li>
                                <li>Type: {$cardType}</li>
                             </ul>
                             <p>You can view your full card details securely in your <a href='https://camemark.com/cards-wallet'>Cards & Wallet dashboard</a>.</p>
                             <p>Thank you for using CameMark!</p>";
                             
                    send_html_email($userEmail, $subject, $body, $conn);
                }
            }
            
            echo json_encode(["message" => "Card generated successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to create card"]);
        }
        $stmt->close();
        exit();
    }
}

// 2b. Update Card Status
if ($action === 'update-card-status') {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents("php://input"), true);
        $cardId = $input['cardId'] ?? '';
        $newStatus = $input['status'] ?? '';

        if ($cardId && $newStatus) {
            if ($newStatus === 'deleted') {
                $stmt = $conn->prepare("DELETE FROM cards WHERE id = ? AND userId = ?");
                $stmt->bind_param("ss", $cardId, $userId);
            } else {
                $stmt = $conn->prepare("UPDATE cards SET status = ? WHERE id = ? AND userId = ?");
                $stmt->bind_param("sss", $newStatus, $cardId, $userId);
            }

            if ($stmt->execute()) {
                // Send email & notification
                $stmtUser = $conn->prepare("SELECT email, fullName FROM users WHERE id = ?");
                $stmtUser->bind_param("s", $userId);
                $stmtUser->execute();
                $resUser = $stmtUser->get_result();
                $userRow = $resUser->fetch_assoc();
                $stmtUser->close();
                
                if ($userRow && !empty($userRow['email'])) {
                    $userEmail = $userRow['email'];
                    $userName = $userRow['fullName'];
                    $subject = "Your Card Status Has Been Updated";
                    $statusText = $newStatus === 'deleted' ? 'deleted' : ($newStatus === 'frozen' ? 'frozen' : 'unfrozen');
                    
                    $body = "<h2>Hello {$userName},</h2>
                             <p>This is to confirm that your card has been successfully <strong>{$statusText}</strong>.</p>
                             <p>If you did not perform this action, please contact support immediately.</p>
                             <p>Thank you for using CameMark!</p>";
                    send_html_email($userEmail, $subject, $body, $conn);
                    
                    // Add notification
                    $notifId = generate_uuid();
                    $notifTitle = "Card " . ucfirst($statusText);
                    $notifMessage = "Your card was successfully {$statusText}.";
                    $notifStmt = $conn->prepare("INSERT INTO notifications (id, userId, title, message) VALUES (?, ?, ?, ?)");
                    if ($notifStmt) {
                        $notifStmt->bind_param("ssss", $notifId, $userId, $notifTitle, $notifMessage);
                        $notifStmt->execute();
                        $notifStmt->close();
                    }
                }
                echo json_encode(["success" => true, "message" => "Card status updated to {$newStatus}"]);
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Failed to update card status"]);
            }
            $stmt->close();
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Missing cardId or status"]);
        }
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

// 8. Admin Stats
if ($action === 'admin-stats') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $filter = $_GET['filter'] ?? 'all';
        
        $whereClause = "1=1";
        $whereClauseUsers = "1=1";
        $whereClauseForum = "1=1";
        
        if ($filter === 'today') {
            $whereClause = " DATE(createdAt) = CURDATE()";
            $whereClauseUsers = " DATE(createdAt) = CURDATE()";
            $whereClauseForum = " DATE(registered_at) = CURDATE()";
        } elseif ($filter === 'weekly') {
            $whereClause = " YEARWEEK(createdAt, 1) = YEARWEEK(CURDATE(), 1)";
            $whereClauseUsers = " YEARWEEK(createdAt, 1) = YEARWEEK(CURDATE(), 1)";
            $whereClauseForum = " YEARWEEK(registered_at, 1) = YEARWEEK(CURDATE(), 1)";
        } elseif ($filter === 'monthly') {
            $whereClause = " MONTH(createdAt) = MONTH(CURDATE()) AND YEAR(createdAt) = YEAR(CURDATE())";
            $whereClauseUsers = " MONTH(createdAt) = MONTH(CURDATE()) AND YEAR(createdAt) = YEAR(CURDATE())";
            $whereClauseForum = " MONTH(registered_at) = MONTH(CURDATE()) AND YEAR(registered_at) = YEAR(CURDATE())";
        } elseif ($filter === 'yearly') {
            $whereClause = " YEAR(createdAt) = YEAR(CURDATE())";
            $whereClauseUsers = " YEAR(createdAt) = YEAR(CURDATE())";
            $whereClauseForum = " YEAR(registered_at) = YEAR(CURDATE())";
        }
        
        $usersCount = 0;
        $sellersCount = 0;
        $totalSales = 0;
        $pendingCount = 0;
        $totalOrders = 0;
        $productsListed = 0;
        $supportTickets = 0;
        $revenue = 0;
        $forumRegistrationsCount = 0;

        // Users
        $res = $conn->query("SELECT COUNT(*) FROM users WHERE $whereClauseUsers");
        if($res) { $row = $res->fetch_array(); $usersCount = $row[0]; }

        // Sellers
        $res = $conn->query("SELECT COUNT(*) FROM users WHERE role='seller' AND $whereClauseUsers");
        if($res) { $row = $res->fetch_array(); $sellersCount = $row[0]; }

        // Orders
        $res = $conn->query("SELECT COUNT(*), SUM(totalPrice) FROM orders WHERE $whereClause");
        if($res) { $row = $res->fetch_array(); $totalOrders = $row[0]; $revenue = $row[1] ?? 0; $totalSales = $revenue; }

        // Products
        $res = $conn->query("SELECT COUNT(*) FROM products WHERE $whereClause");
        if($res) { $row = $res->fetch_array(); $productsListed = $row[0]; }

        // Pending KYC
        $res = $conn->query("SELECT COUNT(*) FROM kyc_verifications WHERE status='pending'");
        if($res) { $row = $res->fetch_array(); $pendingCount = $row[0]; }
        
        // Forum Registrations
        $res = $conn->query("SELECT COUNT(*) FROM forum_registrations WHERE $whereClauseForum");
        if($res) { $row = $res->fetch_array(); $forumRegistrationsCount = $row[0]; }

        echo json_encode([
            "usersCount" => $usersCount,
            "sellersCount" => $sellersCount,
            "totalSales" => $totalSales,
            "pendingCount" => $pendingCount,
            "totalOrders" => $totalOrders,
            "productsListed" => $productsListed,
            "supportTickets" => $supportTickets,
            "revenue" => $revenue,
            "forumRegistrations" => $forumRegistrationsCount
        ]);
        exit();
    }
}

// 9. Card Transactions
if ($action === 'card-transactions') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $cardId = $_GET['cardId'] ?? '';
        if (!$cardId) {
            http_response_code(400);
            echo json_encode(["error" => "Card ID required"]);
            exit();
        }
        
        // Verify card belongs to user
        $stmt = $conn->prepare("SELECT id FROM cards WHERE id = ? AND userId = ?");
        $stmt->bind_param("ss", $cardId, $userId);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($res->num_rows === 0) {
            http_response_code(403);
            echo json_encode(["error" => "Access denied"]);
            exit();
        }
        $stmt->close();
        
        // Fetch transactions
        $stmt = $conn->prepare("SELECT * FROM card_transactions WHERE cardId = ? ORDER BY createdAt DESC");
        $stmt->bind_param("s", $cardId);
        $stmt->execute();
        $res = $stmt->get_result();
        $txs = [];
        while ($row = $res->fetch_assoc()) {
            $txs[] = $row;
        }
        $stmt->close();
        echo json_encode($txs);
        exit();
    }
}

// 10. Report Issue
if ($action === 'report-issue') {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents("php://input"), true);
        $cardId = $input['cardId'] ?? null;
        $transactionId = $input['transactionId'] ?? null;
        $subject = $input['subject'] ?? '';
        $message = $input['message'] ?? '';
        
        if (empty($subject) || empty($message)) {
            http_response_code(400);
            echo json_encode(["error" => "Subject and message are required"]);
            exit();
        }
        
        $ticketId = generate_uuid();
        $stmt = $conn->prepare("INSERT INTO support_tickets (id, userId, cardId, transactionId, subject, message) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssss", $ticketId, $userId, $cardId, $transactionId, $subject, $message);
        
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "ticketId" => $ticketId]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to create ticket"]);
        }
        $stmt->close();
        exit();
    }
}

// 11. Send Money
if ($action === 'send-money') {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents("php://input"), true);
        $amount = floatval($input['amount'] ?? 0);
        $recipientStr = $input['recipient'] ?? '';

        if ($amount <= 0 || empty($recipientStr)) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid amount or recipient"]);
            exit();
        }

        // Find recipient
        $stmt = $conn->prepare("SELECT id, email, fullName FROM users WHERE email = ? OR phone = ?");
        $stmt->bind_param("ss", $recipientStr, $recipientStr);
        $stmt->execute();
        $res = $stmt->get_result();
        $recipientUser = $res->fetch_assoc();
        $stmt->close();
        
        if (!$recipientUser) {
            http_response_code(404);
            echo json_encode(["error" => "Recipient not found on the platform"]);
            exit();
        }
        
        // Find sender details
        $stmt = $conn->prepare("SELECT email, fullName FROM users WHERE id = ?");
        $stmt->bind_param("s", $userId);
        $stmt->execute();
        $res = $stmt->get_result();
        $senderUser = $res->fetch_assoc();
        $stmt->close();

        // Check wallet balance
        $stmt = $conn->prepare("SELECT id, balance, currency FROM wallets WHERE userId = ?");
        $stmt->bind_param("s", $userId);
        $stmt->execute();
        $res = $stmt->get_result();
        $wallet = $res->fetch_assoc();
        $stmt->close();

        if ($wallet && $wallet['balance'] >= $amount) {
            // Deduct sender
            $stmt = $conn->prepare("UPDATE wallets SET balance = balance - ? WHERE id = ?");
            $stmt->bind_param("ds", $amount, $wallet['id']);
            $stmt->execute();
            $stmt->close();
            
            // Add to recipient wallet
            $stmt = $conn->prepare("SELECT id, balance FROM wallets WHERE userId = ?");
            $stmt->bind_param("s", $recipientUser['id']);
            $stmt->execute();
            $res = $stmt->get_result();
            $recipientWallet = $res->fetch_assoc();
            $stmt->close();
            
            if ($recipientWallet) {
                $stmt = $conn->prepare("UPDATE wallets SET balance = balance + ? WHERE id = ?");
                $stmt->bind_param("ds", $amount, $recipientWallet['id']);
                $stmt->execute();
                $stmt->close();
            } else {
                $recWalletId = generate_uuid();
                $stmt = $conn->prepare("INSERT INTO wallets (id, userId, balance, currency) VALUES (?, ?, ?, ?)");
                $stmt->bind_param("ssds", $recWalletId, $recipientUser['id'], $amount, $wallet['currency']);
                $stmt->execute();
                $stmt->close();
            }

            // Log transactions
            $ref = "TRF-" . time();
            
            // Ensure transactions table exists and log it
            $conn->query("CREATE TABLE IF NOT EXISTS transactions (
                id VARCHAR(100) PRIMARY KEY,
                userId VARCHAR(100) NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                currency VARCHAR(10) DEFAULT 'XAF',
                type VARCHAR(50),
                status VARCHAR(50),
                merchant VARCHAR(255),
                reference VARCHAR(255),
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
            
            // Sender log
            $txId1 = generate_uuid();
            $type1 = "transfer_out";
            $status = "completed";
            $negAmount = -$amount;
            $desc1 = "Transfer to " . $recipientUser['fullName'];
            $stmt = $conn->prepare("INSERT INTO transactions (id, userId, amount, currency, type, status, merchant, reference) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("ssdsssss", $txId1, $userId, $negAmount, $wallet['currency'], $type1, $status, $desc1, $ref);
            $stmt->execute();
            $stmt->close();
            
            // Recipient log
            $txId2 = generate_uuid();
            $type2 = "transfer_in";
            $desc2 = "Transfer from " . $senderUser['fullName'];
            $stmt = $conn->prepare("INSERT INTO transactions (id, userId, amount, currency, type, status, merchant, reference) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("ssdsssss", $txId2, $recipientUser['id'], $amount, $wallet['currency'], $type2, $status, $desc2, $ref);
            $stmt->execute();
            $stmt->close();
            
            // Notifications
            $notifTitleOut = "Funds Sent";
            $notifMsgOut = "You successfully sent " . $wallet['currency'] . " " . $amount . " to " . $recipientUser['fullName'] . ".";
            $notifId1 = generate_uuid();
            $stmt = $conn->prepare("INSERT INTO notifications (id, userId, title, message) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("ssss", $notifId1, $userId, $notifTitleOut, $notifMsgOut);
            $stmt->execute();
            $stmt->close();
            
            $notifTitleIn = "Funds Received";
            $notifMsgIn = "You have received " . $wallet['currency'] . " " . $amount . " from " . $senderUser['fullName'] . ".";
            $notifId2 = generate_uuid();
            $stmt = $conn->prepare("INSERT INTO notifications (id, userId, title, message) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("ssss", $notifId2, $recipientUser['id'], $notifTitleIn, $notifMsgIn);
            $stmt->execute();
            $stmt->close();
            
            // Emails
            if (!empty($senderUser['email'])) {
                send_invoice_email($senderUser['email'], $senderUser['fullName'], $amount, $wallet['currency'], $desc1, "transfer", $ref, $conn);
            }
            if (!empty($recipientUser['email'])) {
                send_invoice_email($recipientUser['email'], $recipientUser['fullName'], $amount, $wallet['currency'], $desc2, "deposit", $ref, $conn);
            }

            echo json_encode(["success" => true, "message" => "Money sent successfully."]);
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Insufficient wallet balance."]);
        }
        exit();
    }
}

// 12. Lookup User
if ($action === 'lookup-user') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $identifier = $_GET['identifier'] ?? '';
        
        $stmt = $conn->prepare("SELECT id, email, fullName FROM users WHERE email = ? OR phone = ?");
        $stmt->bind_param("ss", $identifier, $identifier);
        $stmt->execute();
        $res = $stmt->get_result();
        $userObj = $res->fetch_assoc();
        $stmt->close();
        
        if ($userObj) {
            echo json_encode(["success" => true, "user" => $userObj]);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "User not found"]);
        }
        exit();
    }
}

// If no matched action
http_response_code(404);
echo json_encode(["error" => "Endpoint not found"]);
?>
