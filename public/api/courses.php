<?php
// Endpoint: /api/courses
require_once __DIR__ . '/config.php';

if ($request_method === 'POST') {
    $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
    $isMultipart = strpos($contentType, 'multipart/form-data') !== false;

    if ($isMultipart) {
        $title = isset($_POST['title']) ? trim($_POST['title']) : '';
        $category = isset($_POST['category']) ? trim($_POST['category']) : 'business';
        $instructor = isset($_POST['instructor']) ? trim($_POST['instructor']) : 'Camer Market Academy Instructor';
        $level = isset($_POST['level']) ? trim($_POST['level']) : 'All Levels';
        $duration = isset($_POST['duration']) ? trim($_POST['duration']) : '4 Weeks';
        $price = isset($_POST['price']) ? trim($_POST['price']) : 'Free Access';
        $description = isset($_POST['description']) ? trim($_POST['description']) : '';
        $videoUrl = isset($_POST['videoUrl']) ? trim($_POST['videoUrl']) : '';

        $image = '';
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $cloudUrl = upload_to_cloudinary($conn, $_FILES['image']['tmp_name'], 'image');
            if ($cloudUrl) {
                $image = $cloudUrl;
            } else {
                $uploadDir = __DIR__ . '/../uploads/';
                if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
                $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
                $filename = uniqid('course_') . '.' . $ext;
                if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadDir . $filename)) {
                    $image = '/uploads/' . $filename;
                }
            }
        }
        
        $certParticipationUrl = '';
        if (isset($_FILES['certParticipation']) && $_FILES['certParticipation']['error'] === UPLOAD_ERR_OK) {
            $cloudUrl = upload_to_cloudinary($conn, $_FILES['certParticipation']['tmp_name'], 'auto');
            if ($cloudUrl) {
                $certParticipationUrl = $cloudUrl;
            } else {
                $uploadDir = __DIR__ . '/../uploads/';
                if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
                $ext = pathinfo($_FILES['certParticipation']['name'], PATHINFO_EXTENSION);
                $filename = uniqid('cert_part_') . '.' . $ext;
                if (move_uploaded_file($_FILES['certParticipation']['tmp_name'], $uploadDir . $filename)) {
                    $certParticipationUrl = '/uploads/' . $filename;
                }
            }
        }

        $certCompletionUrl = '';
        if (isset($_FILES['certCompletion']) && $_FILES['certCompletion']['error'] === UPLOAD_ERR_OK) {
            $cloudUrl = upload_to_cloudinary($conn, $_FILES['certCompletion']['tmp_name'], 'auto');
            if ($cloudUrl) {
                $certCompletionUrl = $cloudUrl;
            } else {
                $uploadDir = __DIR__ . '/../uploads/';
                if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
                $ext = pathinfo($_FILES['certCompletion']['name'], PATHINFO_EXTENSION);
                $filename = uniqid('cert_comp_') . '.' . $ext;
                if (move_uploaded_file($_FILES['certCompletion']['tmp_name'], $uploadDir . $filename)) {
                    $certCompletionUrl = '/uploads/' . $filename;
                }
            }
        }
    } else {
        $input = file_get_contents("php://input");
        $data = json_decode($input, true);
        
        $title = isset($data['title']) ? trim($data['title']) : '';
        $category = isset($data['category']) ? trim($data['category']) : 'business';
        $instructor = isset($data['instructor']) ? trim($data['instructor']) : 'Camer Market Academy Instructor';
        $level = isset($data['level']) ? trim($data['level']) : 'All Levels';
        $duration = isset($data['duration']) ? trim($data['duration']) : '4 Weeks';
        $price = isset($data['price']) ? trim($data['price']) : 'Free Access';
        $image = isset($data['image']) ? trim($data['image']) : '';
        $description = isset($data['description']) ? trim($data['description']) : '';
        $videoUrl = isset($data['videoUrl']) ? trim($data['videoUrl']) : '';
        $certParticipationUrl = isset($data['certParticipationUrl']) ? trim($data['certParticipationUrl']) : '';
        $certCompletionUrl = isset($data['certCompletionUrl']) ? trim($data['certCompletionUrl']) : '';
    }

    $id = "crs-" . round(microtime(true) * 1000);
    $now = date('Y-m-d H:i:s');

    if (empty($title) || empty($image)) {
        http_response_code(400);
        echo json_encode(["error" => "Course Title and Cover Image are required."]);
        exit();
    }

    $stmt = $conn->prepare("INSERT INTO courses (id, title, category, instructor, level, duration, price, image, description, videoUrl, certParticipationUrl, certCompletionUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssssssssss", $id, $title, $category, $instructor, $level, $duration, $price, $image, $description, $videoUrl, $certParticipationUrl, $certCompletionUrl, $now);

    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Course uploaded successfully to Camer Market Academy!",
            "course" => [
                "id" => $id,
                "title" => $title,
                "category" => $category,
                "instructor" => $instructor,
                "level" => $level,
                "duration" => $duration,
                "price" => $price,
                "image" => $image,
                "description" => $description,
                "videoUrl" => $videoUrl,
                "createdAt" => $now
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to upload course to database."]);
    }
    $stmt->close();
    exit();
} else {
    $result = $conn->query("SELECT id, title, category, instructor, level, duration, price, image, description, videoUrl, createdAt FROM courses ORDER BY id DESC");
    $coursesList = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $coursesList[] = $row;
        }
    }
    http_response_code(200);
    echo json_encode(["courses" => $coursesList]);
    exit();
}
?>
