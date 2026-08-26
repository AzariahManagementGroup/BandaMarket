<?php
$data = json_encode(['email' => 'info@azariahmg.com', 'password' => '12345678']);
$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => $data,
        'ignore_errors' => true // To get the content even on 4xx/5xx responses
    ]
];
$context  = stream_context_create($options);
$result = file_get_contents('http://localhost:5000/api/signin', false, $context);
echo "RESPONSE:\n";
var_dump($result);
?>
