<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');

// Get action
$action = $_GET['action'] ?? '';

if ($action === 'list') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Fetch all cards with user details
        $query = "
            SELECT c.*, u.fullName as userName, u.email as userEmail 
            FROM cards c
            LEFT JOIN users u ON c.userId = u.id
            ORDER BY c.createdAt DESC
        ";
        $stmt = $conn->prepare($query);
        if ($stmt) {
            $stmt->execute();
            $res = $stmt->get_result();
            $cards = [];
            while ($row = $res->fetch_assoc()) {
                $cards[] = $row;
            }
            $stmt->close();
            echo json_encode($cards);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Database error"]);
        }
        exit();
    }
}

if ($action === 'transactions') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $cardId = $_GET['cardId'] ?? '';
        if (!$cardId) {
            http_response_code(400);
            echo json_encode(["error" => "Missing cardId"]);
            exit();
        }

        $stmt = $conn->prepare("SELECT * FROM card_transactions WHERE cardId = ? ORDER BY createdAt DESC");
        if ($stmt) {
            $stmt->bind_param("s", $cardId);
            $stmt->execute();
            $res = $stmt->get_result();
            $transactions = [];
            while ($row = $res->fetch_assoc()) {
                $transactions[] = $row;
            }
            $stmt->close();
            echo json_encode($transactions);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Database error"]);
        }
        exit();
    }
}

if ($action === 'update-status') {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents("php://input"), true);
        $cardId = $input['cardId'] ?? '';
        $newStatus = $input['status'] ?? '';

        if ($cardId && $newStatus) {
            // First get the user ID to send notifications
            $stmtInfo = $conn->prepare("SELECT userId FROM cards WHERE id = ?");
            $stmtInfo->bind_param("s", $cardId);
            $stmtInfo->execute();
            $resInfo = $stmtInfo->get_result();
            $cardRow = $resInfo->fetch_assoc();
            $stmtInfo->close();

            if (!$cardRow) {
                http_response_code(404);
                echo json_encode(["error" => "Card not found"]);
                exit();
            }

            $userId = $cardRow['userId'];

            if ($newStatus === 'deleted') {
                $stmt = $conn->prepare("DELETE FROM cards WHERE id = ?");
                $stmt->bind_param("s", $cardId);
            } else {
                $stmt = $conn->prepare("UPDATE cards SET status = ? WHERE id = ?");
                $stmt->bind_param("ss", $newStatus, $cardId);
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
                    $subject = "Admin Update: Your Card Status";
                    $statusText = $newStatus === 'deleted' ? 'deleted' : ($newStatus === 'frozen' ? 'frozen' : 'unfrozen');
                    
                    $body = "<h2>Hello {$userName},</h2>
                             <p>An administrator has <strong>{$statusText}</strong> your card.</p>
                             <p>If you have any questions, please contact support.</p>
                             <p>Thank you for using CameMark!</p>";
                    send_html_email($userEmail, $subject, $body, $conn);
                    
                    // Add notification
                    $notifId = generate_uuid();
                    $notifTitle = "Card " . ucfirst($statusText);
                    $notifMessage = "An administrator has {$statusText} your card.";
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

// If no matched action
http_response_code(404);
echo json_encode(["error" => "Endpoint not found"]);
?>
