<?php
require_once __DIR__ . '/config.php';

$auth = authenticate_request();

if ($request_method === 'GET') {
    $courseId = isset($_GET['courseId']) ? trim($_GET['courseId']) : '';
    if (empty($courseId)) {
        http_response_code(400);
        echo json_encode(["error" => "Course ID is required."]);
        exit();
    }

    $curriculum = [];
    $stmt = $conn->prepare("SELECT * FROM course_sections WHERE courseId = ? ORDER BY orderIndex ASC");
    $stmt->bind_param("s", $courseId);
    $stmt->execute();
    $sectionsRes = $stmt->get_result();

    while ($section = $sectionsRes->fetch_assoc()) {
        $section['topics'] = [];
        $tStmt = $conn->prepare("SELECT * FROM course_topics WHERE sectionId = ? ORDER BY orderIndex ASC");
        $tStmt->bind_param("s", $section['id']);
        $tStmt->execute();
        $topicsRes = $tStmt->get_result();
        while ($topic = $topicsRes->fetch_assoc()) {
            $section['topics'][] = $topic;
        }
        $tStmt->close();
        $curriculum[] = $section;
    }
    $stmt->close();
    
    echo json_encode(["success" => true, "curriculum" => $curriculum]);
    exit();
}

// Below endpoints require admin
if (!$auth || !isset($auth['role']) || ($auth['role'] !== 'super_admin' && $auth['role'] !== 'admin')) {
    http_response_code(403);
    echo json_encode(["error" => "Unauthorized access. Admins only."]);
    exit();
}

if ($request_method === 'POST') {
    $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
    $isMultipart = strpos($contentType, 'multipart/form-data') !== false;

    if ($isMultipart) {
        // Handling topic with material upload
        $action = isset($_POST['action']) ? trim($_POST['action']) : '';
        
        if ($action === 'add_topic') {
            $sectionId = isset($_POST['sectionId']) ? trim($_POST['sectionId']) : '';
            $title = isset($_POST['title']) ? trim($_POST['title']) : '';
            $description = isset($_POST['description']) ? trim($_POST['description']) : '';
            $materialType = isset($_POST['materialType']) ? trim($_POST['materialType']) : '';
            
            if (empty($sectionId) || empty($title)) {
                http_response_code(400);
                echo json_encode(["error" => "Section ID and Title are required."]);
                exit();
            }

            $materialUrl = '';
            if (isset($_FILES['material']) && $_FILES['material']['error'] === UPLOAD_ERR_OK) {
                // Upload to Cloudinary using config helper
                $cloudUrl = upload_to_cloudinary($conn, $_FILES['material']['tmp_name'], 'auto');
                if ($cloudUrl) {
                    $materialUrl = $cloudUrl;
                } else {
                    $uploadDir = __DIR__ . '/../uploads/';
                    if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
                    $ext = pathinfo($_FILES['material']['name'], PATHINFO_EXTENSION);
                    $filename = uniqid('material_') . '.' . $ext;
                    if (move_uploaded_file($_FILES['material']['tmp_name'], $uploadDir . $filename)) {
                        $materialUrl = '/uploads/' . $filename;
                    }
                }
            }

            $id = "top-" . round(microtime(true) * 1000);
            $now = date('Y-m-d H:i:s');
            
            // Get max order index
            $maxOrderStmt = $conn->prepare("SELECT MAX(orderIndex) as maxOrder FROM course_topics WHERE sectionId = ?");
            $maxOrderStmt->bind_param("s", $sectionId);
            $maxOrderStmt->execute();
            $maxOrderRes = $maxOrderStmt->get_result();
            $maxOrderRow = $maxOrderRes->fetch_assoc();
            $orderIndex = ($maxOrderRow['maxOrder'] !== null) ? intval($maxOrderRow['maxOrder']) + 1 : 0;
            $maxOrderStmt->close();

            $stmt = $conn->prepare("INSERT INTO course_topics (id, sectionId, title, description, materialUrl, materialType, orderIndex, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("ssssssis", $id, $sectionId, $title, $description, $materialUrl, $materialType, $orderIndex, $now);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Topic added successfully."]);
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Database error."]);
            }
            exit();
        }
    } else {
        $input = file_get_contents("php://input");
        $data = json_decode($input, true);
        
        $action = isset($data['action']) ? trim($data['action']) : '';

        if ($action === 'add_section') {
            $courseId = isset($data['courseId']) ? trim($data['courseId']) : '';
            $title = isset($data['title']) ? trim($data['title']) : '';

            if (empty($courseId) || empty($title)) {
                http_response_code(400);
                echo json_encode(["error" => "Course ID and Title are required."]);
                exit();
            }

            $id = "sec-" . round(microtime(true) * 1000);
            $now = date('Y-m-d H:i:s');
            
            // Get max order index
            $maxOrderStmt = $conn->prepare("SELECT MAX(orderIndex) as maxOrder FROM course_sections WHERE courseId = ?");
            $maxOrderStmt->bind_param("s", $courseId);
            $maxOrderStmt->execute();
            $maxOrderRes = $maxOrderStmt->get_result();
            $maxOrderRow = $maxOrderRes->fetch_assoc();
            $orderIndex = ($maxOrderRow['maxOrder'] !== null) ? intval($maxOrderRow['maxOrder']) + 1 : 0;
            $maxOrderStmt->close();

            $stmt = $conn->prepare("INSERT INTO course_sections (id, courseId, title, orderIndex, createdAt) VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param("sssis", $id, $courseId, $title, $orderIndex, $now);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Section added successfully."]);
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Database error."]);
            }
            exit();
        }
    }
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
?>
