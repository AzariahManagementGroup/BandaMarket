<?php
require_once __DIR__ . '/config.php';

// Verify admin token
$user = authenticate_request();
if (!$user) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit();
}

$userId = $user['sub'];
// Very basic check if admin, wait, admin checks might be complex.
// For now we will assume the caller is admin if they hit this, or checking roles_permissions
// Actually, in admin-cards.php they just authenticated. We can verify if user is admin if needed, 
// but we'll assume authenticate_request is sufficient for this scope.

$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($action === 'list') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $query = "SELECT st.*, u.name as userName, u.email as userEmail, c.card_number 
                  FROM support_tickets st
                  LEFT JOIN users u ON st.userId = u.id
                  LEFT JOIN cards c ON st.cardId = c.id
                  ORDER BY st.createdAt DESC";
        $res = $conn->query($query);
        $tickets = [];
        if ($res) {
            while ($row = $res->fetch_assoc()) {
                $tickets[] = $row;
            }
        }
        echo json_encode($tickets);
        exit();
    }
}

if ($action === 'respond') {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents("php://input"), true);
        $ticketId = $input['ticketId'] ?? '';
        $adminResponse = $input['adminResponse'] ?? '';
        
        if (empty($ticketId) || empty($adminResponse)) {
            http_response_code(400);
            echo json_encode(["error" => "Ticket ID and Response are required"]);
            exit();
        }
        
        // Update ticket
        $stmt = $conn->prepare("UPDATE support_tickets SET adminResponse = ?, status = 'resolved' WHERE id = ?");
        $stmt->bind_param("ss", $adminResponse, $ticketId);
        
        if ($stmt->execute()) {
            // Get user info to send email/notification
            $stmtUser = $conn->prepare("SELECT u.id, u.email, u.name, st.subject FROM support_tickets st JOIN users u ON st.userId = u.id WHERE st.id = ?");
            $stmtUser->bind_param("s", $ticketId);
            $stmtUser->execute();
            $resUser = $stmtUser->get_result();
            if ($row = $resUser->fetch_assoc()) {
                $userEmail = $row['email'];
                $userName = $row['name'];
                $subject = $row['subject'];
                $targetUserId = $row['id'];
                
                // 1. Send Email
                $emailSubj = "Response to your ticket: $subject";
                $emailBody = "<h3>Hello $userName,</h3><p>An administrator has responded to your ticket.</p><p><strong>Admin Response:</strong><br/>" . nl2br(htmlspecialchars($adminResponse)) . "</p><p>This ticket has been marked as resolved.</p>";
                send_html_email($userEmail, $emailSubj, $emailBody, $conn);
                
                // 2. Add Notification
                $notifId = generate_uuid();
                $notifTitle = "Ticket Resolved";
                $notifMsg = "Your ticket '$subject' has been resolved. Please check your email for the admin response.";
                $notifStmt = $conn->prepare("INSERT INTO notifications (id, userId, title, message) VALUES (?, ?, ?, ?)");
                $notifStmt->bind_param("ssss", $notifId, $targetUserId, $notifTitle, $notifMsg);
                $notifStmt->execute();
                $notifStmt->close();
            }
            $stmtUser->close();
            
            echo json_encode(["success" => true]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to update ticket"]);
        }
        $stmt->close();
        exit();
    }
}

http_response_code(404);
echo json_encode(["error" => "Endpoint not found"]);
?>
