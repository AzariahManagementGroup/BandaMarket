<?php
$mysqli = new mysqli('localhost', 'root', '', 'camemark_db');
$res = $mysqli->query('DESCRIBE users');
if ($res) {
    while ($row = $res->fetch_assoc()) {
        echo $row['Field'] . "\n";
    }
} else {
    echo "Error: " . $mysqli->error;
}
?>
