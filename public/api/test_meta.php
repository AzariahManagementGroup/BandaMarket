<?php
require_once __DIR__ . '/config.php';
$stmt = $conn->prepare("SELECT id, email FROM users LIMIT 1");
$stmt->execute();
$meta = $stmt->result_metadata();
if ($meta) {
    echo "Metadata works! Fields:\n";
    while ($field = $meta->fetch_field()) {
        echo $field->name . "\n";
    }
} else {
    echo "No metadata!";
}
?>
