<?php
$mysqli = new mysqli('localhost', 'root', '', 'camemark_db');
$sql = file_get_contents('alter_products.sql');
if ($mysqli->multi_query($sql)) {
    echo "Success\n";
} else {
    echo "Error: " . $mysqli->error . "\n";
}
?>
