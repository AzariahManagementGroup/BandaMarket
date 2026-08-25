<?php
require_once __DIR__ . '/config.php';

$user = authenticate_request();

if (!$user || $user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["error" => "Forbidden"]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $conn->prepare("SELECT id, role, modules FROM roles_permissions ORDER BY id ASC");
    $stmt->execute();
    $res = $stmt->get_result();
    
    $roles = [];
    while ($row = $res->fetch_assoc()) {
        $row['modules'] = json_decode($row['modules'], true);
        $roles[] = $row;
    }
    $stmt->close();
    
    echo json_encode($roles);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);
    
    $roleId = isset($data['roleId']) ? trim($data['roleId']) : '';
    $modules = isset($data['modules']) && is_array($data['modules']) ? $data['modules'] : [];
    
    if (empty($roleId)) {
        http_response_code(400);
        echo json_encode(["error" => "Role ID is required"]);
        exit();
    }
    
    // Prevent changing super_admin's "all" permission
    $stmt = $conn->prepare("SELECT role FROM roles_permissions WHERE id = ?");
    $stmt->bind_param("s", $roleId);
    $stmt->execute();
    $res = $stmt->get_result();
    $row = $res->fetch_assoc();
    $stmt->close();
    
    if ($row && $row['role'] === 'super_admin' && !in_array("all", $modules)) {
        $modules[] = "all";
    }
    
    $modulesJson = json_encode($modules);
    
    $updateStmt = $conn->prepare("UPDATE roles_permissions SET modules = ?, updatedAt = NOW() WHERE id = ?");
    $updateStmt->bind_param("ss", $modulesJson, $roleId);
    
    if ($updateStmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to update role"]);
    }
    $updateStmt->close();
    exit();
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
?>
