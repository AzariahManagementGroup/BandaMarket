<?php
$mysqli = new mysqli('localhost', 'root', '', 'camemark_db');
$sql = "ALTER TABLE products MODIFY COLUMN id VARCHAR(36) DEFAULT (UUID());";
if ($mysqli->query($sql)) {
    echo "Success\n";
} else {
    echo "Error: " . $mysqli->error . "\n";
}
?>
