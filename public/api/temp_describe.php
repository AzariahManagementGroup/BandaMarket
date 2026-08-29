<?php
require_once __DIR__ . '/config.php';
$res = $conn->query("DESCRIBE users");
while($row = $res->fetch_assoc()) {
    echo $row['Field'] . ", ";
}
echo "\n---\n";
$res2 = $conn->query("DESCRIBE forum_registrations");
if($res2) {
    while($row = $res2->fetch_assoc()) {
        echo $row['Field'] . ", ";
    }
} else {
    echo "forum_registrations does not exist";
}
?>
