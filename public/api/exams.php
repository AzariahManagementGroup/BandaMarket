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

    $exams = [];
    $stmt = $conn->prepare("SELECT * FROM course_exams WHERE courseId = ? ORDER BY createdAt ASC");
    $stmt->bind_param("s", $courseId);
    $stmt->execute();
    $examsRes = $stmt->get_result();

    while ($exam = $examsRes->fetch_assoc()) {
        $exam['questions'] = [];
        $qStmt = $conn->prepare("SELECT * FROM course_exam_questions WHERE examId = ? ORDER BY createdAt ASC");
        $qStmt->bind_param("s", $exam['id']);
        $qStmt->execute();
        $qRes = $qStmt->get_result();
        while ($question = $qRes->fetch_assoc()) {
            if ($question['optionsJson']) {
                $question['options'] = json_decode($question['optionsJson'], true);
            }
            $exam['questions'][] = $question;
        }
        $qStmt->close();
        $exams[] = $exam;
    }
    $stmt->close();
    
    echo json_encode(["success" => true, "exams" => $exams]);
    exit();
}

if (!$auth || !isset($auth['role']) || ($auth['role'] !== 'super_admin' && $auth['role'] !== 'admin')) {
    http_response_code(403);
    echo json_encode(["error" => "Unauthorized access. Admins only."]);
    exit();
}

if ($request_method === 'POST') {
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);
    
    $action = isset($data['action']) ? trim($data['action']) : '';

    if ($action === 'create_exam') {
        $courseId = isset($data['courseId']) ? trim($data['courseId']) : '';
        $title = isset($data['title']) ? trim($data['title']) : '';
        $description = isset($data['description']) ? trim($data['description']) : '';
        $passingScore = isset($data['passingScore']) ? intval($data['passingScore']) : 80;

        if (empty($courseId) || empty($title)) {
            http_response_code(400);
            echo json_encode(["error" => "Course ID and Title are required."]);
            exit();
        }

        $id = "exm-" . round(microtime(true) * 1000);
        $now = date('Y-m-d H:i:s');
        
        $stmt = $conn->prepare("INSERT INTO course_exams (id, courseId, title, description, passingScore, createdAt) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssis", $id, $courseId, $title, $description, $passingScore, $now);
        
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Exam created successfully.", "examId" => $id]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Database error."]);
        }
        exit();
    }

    if ($action === 'add_question') {
        $examId = isset($data['examId']) ? trim($data['examId']) : '';
        $questionText = isset($data['questionText']) ? trim($data['questionText']) : '';
        $questionType = isset($data['questionType']) ? trim($data['questionType']) : 'multiple_choice';
        $options = isset($data['options']) ? $data['options'] : [];
        $correctAnswer = isset($data['correctAnswer']) ? trim($data['correctAnswer']) : '';
        $points = isset($data['points']) ? intval($data['points']) : 1;

        if (empty($examId) || empty($questionText) || empty($correctAnswer)) {
            http_response_code(400);
            echo json_encode(["error" => "Exam ID, Question Text, and Correct Answer are required."]);
            exit();
        }

        $optionsJson = !empty($options) ? json_encode($options) : null;
        $id = "qst-" . round(microtime(true) * 1000);
        $now = date('Y-m-d H:i:s');

        $stmt = $conn->prepare("INSERT INTO course_exam_questions (id, examId, questionText, questionType, optionsJson, correctAnswer, points, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssssis", $id, $examId, $questionText, $questionType, $optionsJson, $correctAnswer, $points, $now);
        
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Question added successfully."]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Database error."]);
        }
        exit();
    }
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
?>
