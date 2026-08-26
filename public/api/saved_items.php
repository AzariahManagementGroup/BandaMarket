<?php
require_once "config.php";

header("Content-Type: application/json");

// Ensure the request is authenticated
$user = authenticate_request();
if (!$user) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Unauthorized"]);
    exit;
}

$userId = $user['sub'] ?? $user['id'] ?? null;
if (!$userId) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "User ID not found in token"]);
    exit;
}
$method = $_SERVER['REQUEST_METHOD'];
$db = get_db_connection();

// Initialize the saved_items table if it doesn't exist
try {
    // Modify column if exists, otherwise create table
    $db->exec("CREATE TABLE IF NOT EXISTS saved_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        product_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_save (user_id, product_id)
    )");
    // In case it was created with INT, alter it:
    $db->exec("ALTER TABLE saved_items MODIFY user_id VARCHAR(100) NOT NULL");
} catch (PDOException $e) {
    // Ignore error if table exists
}

if ($method === 'GET') {
    try {
        $stmt = $db->prepare("SELECT product_id FROM saved_items WHERE user_id = ?");
        $stmt->execute([$userId]);
        $savedIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        echo json_encode(["success" => true, "savedIds" => $savedIds]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to fetch saved items"]);
    }
} elseif ($method === 'POST') {
    $rawInput = file_get_contents("php://input");
    error_log("Raw POST input: " . $rawInput, 3, "debug.log");
    $input = json_decode($rawInput, true);
    $productId = $input['productId'] ?? null;
    
    if ($productId === null) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Product ID is required", "raw" => $rawInput]);
        exit;
    }
    
    try {
        $stmt = $db->prepare("INSERT IGNORE INTO saved_items (user_id, product_id) VALUES (?, ?)");
        $stmt->execute([$userId, $productId]);
        
        echo json_encode(["success" => true, "message" => "Item saved"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to save item"]);
    }
} elseif ($method === 'DELETE') {
    $input = json_decode(file_get_contents("php://input"), true);
    $productId = $input['productId'] ?? null;
    
    if ($productId === null) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Product ID is required"]);
        exit;
    }
    
    try {
        $stmt = $db->prepare("DELETE FROM saved_items WHERE user_id = ? AND product_id = ?");
        $stmt->execute([$userId, $productId]);
        
        echo json_encode(["success" => true, "message" => "Item removed from saved"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to remove item"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method Not Allowed"]);
}
?>
