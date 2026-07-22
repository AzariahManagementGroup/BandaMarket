<?php
$host = "ssl://smtp.gmail.com";
$port = 465;
$user = "podoremetropolis@gmail.com";
$pass = "ptfjtrjyaidmyqrf";

echo "Connecting to $host:$port...\n";
$socket = @fsockopen($host, $port, $errno, $errstr, 15);
if (!$socket) {
    echo "Connection failed: $errstr ($errno)\n";
    exit;
}
echo "Connected! Banner: " . fgets($socket, 512);

fputs($socket, "EHLO CameMark\r\n");
while ($line = fgets($socket, 512)) {
    echo "EHLO response: " . $line;
    if (substr($line, 3, 1) === " ") break;
}

fputs($socket, "AUTH LOGIN\r\n");
echo "AUTH LOGIN response: " . fgets($socket, 512);

fputs($socket, base64_encode($user) . "\r\n");
echo "USER response: " . fgets($socket, 512);

fputs($socket, base64_encode($pass) . "\r\n");
echo "PASS response: " . fgets($socket, 512);

fputs($socket, "QUIT\r\n");
fclose($socket);
echo "\nTest finished!\n";
?>
