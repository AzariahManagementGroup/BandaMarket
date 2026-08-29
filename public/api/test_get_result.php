<?php
require_once 'config.php';
ini_set('display_errors', 1);
error_reporting(E_ALL);

try {
    $ipStmt = $conn->prepare("SELECT COUNT(*) as cnt FROM login_logs");
    if($ipStmt) {
        $ipStmt->execute();
        $res = $ipStmt->get_result();
        if ($res === false) {
            echo "get_result returned false. Error: " . $ipStmt->error;
        } else {
            var_dump($res->fetch_assoc());
        }
    } else {
        echo "Prepare failed: " . $conn->error;
    }
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage();
}
?>
