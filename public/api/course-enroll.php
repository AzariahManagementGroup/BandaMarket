<?php
// Endpoint: /api/course-enroll
require_once __DIR__ . '/config.php';

if ($request_method === 'POST') {
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);

    $id = "enr-" . round(microtime(true) * 1000);
    $courseId = isset($data['courseId']) ? trim($data['courseId']) : '';
    $courseTitle = isset($data['courseTitle']) ? trim($data['courseTitle']) : 'Camer Market Academy Course';
    $name = isset($data['name']) ? trim($data['name']) : '';
    $email = isset($data['email']) ? trim($data['email']) : '';
    $phone = isset($data['phone']) ? trim($data['phone']) : '';
    $paymentStatus = isset($data['paymentStatus']) ? trim($data['paymentStatus']) : 'free';
    $amountPaid = isset($data['amountPaid']) ? trim($data['amountPaid']) : '0 FCFA';
    $now = date('Y-m-d H:i:s');

    if (empty($name) || empty($email)) {
        http_response_code(400);
        echo json_encode(["error" => "Name and Email are required for enrollment."]);
        exit();
    }

    $stmt = $conn->prepare("INSERT INTO course_enrollments (id, courseId, courseTitle, name, email, phone, paymentStatus, amountPaid, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssssss", $id, $courseId, $courseTitle, $name, $email, $phone, $paymentStatus, $amountPaid, $now);

    if ($stmt->execute()) {
        // A. Send Student Confirmation Email
        $studentSubject = "🎓 Course Enrollment Confirmed: " . $courseTitle;
        $studentBody = "
        <p>Dear <strong>" . htmlspecialchars($name) . "</strong>,</p>
        <p>Congratulations! You have successfully enrolled in <strong>" . htmlspecialchars($courseTitle) . "</strong> on Camer Market Academy.</p>
        <p><strong>Enrollment ID:</strong> " . $id . "<br>
        <strong>Access Type:</strong> " . strtoupper($paymentStatus) . " (" . htmlspecialchars($amountPaid) . ")<br>
        <strong>Portal Access:</strong> Granted immediately on your dashboard.</p>
        <p>Start learning today and build in-demand skills for the African digital economy!</p>
        <a href='https://camemark.com/academy' class='btn'>Go to Academy Portal</a>";

        send_html_email($email, $studentSubject, $studentBody, $conn);

        // B. Send Admin Alert Email
        $adminEmail = "taiwodele88@gmail.com";
        $adminSubject = "🎓 New Academy Student Enrollment: " . $name . " (" . $courseTitle . ")";
        $adminBody = "
        <p>Hello Admin,</p>
        <p>A new student has enrolled in an Academy course!</p>
        <p><strong>Student Name:</strong> " . htmlspecialchars($name) . "<br>
        <strong>Email:</strong> " . htmlspecialchars($email) . "<br>
        <strong>Phone:</strong> " . htmlspecialchars($phone) . "<br>
        <strong>Course Title:</strong> " . htmlspecialchars($courseTitle) . "<br>
        <strong>Payment Status:</strong> " . strtoupper($paymentStatus) . " (" . htmlspecialchars($amountPaid) . ")<br>
        <strong>Enrolled At:</strong> " . $now . "</p>";

        send_html_email($adminEmail, $adminSubject, $adminBody, $conn);

        http_response_code(200);
        echo json_encode(["success" => true, "message" => "Enrollment successful! Confirmation emails dispatched to student and admin."]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to record enrollment."]);
    }
    $stmt->close();
    exit();
}

http_response_code(404);
echo json_encode(["error" => "Endpoint not found."]);
?>
