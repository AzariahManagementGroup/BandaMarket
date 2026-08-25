<?php
require 'public/api/config.php';

// check products schema
echo "Products:\n";
$res = $conn->query("DESCRIBE products");
while($row=$res->fetch_assoc()){
    echo $row['Field'] . "\n";
}

echo "\nAdmin logs:\n";
$res = $conn->query("DESCRIBE admin_activity_logs");
if ($res) {
    while($row=$res->fetch_assoc()){
        echo $row['Field'] . "\n";
    }
} else {
    echo $conn->error;
}
echo "Done\n";
