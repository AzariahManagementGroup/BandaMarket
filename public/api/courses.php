<?php
// Endpoint: /api/courses
require_once __DIR__ . '/config.php';

if ($request_method === 'POST') {
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);

    $id = "crs-" . round(microtime(true) * 1000);
    $title = isset($data['title']) ? trim($data['title']) : '';
    $category = isset($data['category']) ? trim($data['category']) : 'business';
    $instructor = isset($data['instructor']) ? trim($data['instructor']) : 'Camer Market Academy Instructor';
    $level = isset($data['level']) ? trim($data['level']) : 'All Levels';
    $duration = isset($data['duration']) ? trim($data['duration']) : '4 Weeks';
    $price = isset($data['price']) ? trim($data['price']) : 'Free Access';
    $image = isset($data['image']) ? trim($data['image']) : '';
    $description = isset($data['description']) ? trim($data['description']) : '';
    $videoUrl = isset($data['videoUrl']) ? trim($data['videoUrl']) : '';
    $now = date('Y-m-d H:i:s');

    if (empty($title) || empty($image)) {
        http_response_code(400);
        echo json_encode(["error" => "Course Title and Cover Image URL are required."]);
        exit();
    }

    $stmt = $conn->prepare("INSERT INTO courses (id, title, category, instructor, level, duration, price, image, description, videoUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssssssss", $id, $title, $category, $instructor, $level, $duration, $price, $image, $description, $videoUrl, $now);

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
