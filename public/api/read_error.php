<?php
header("Content-Type: text/plain");
$log = __DIR__ . '/error_log';
if (file_exists($log)) {
    echo "=== error_log ===\n";
    $lines = file($log);
    $last_lines = array_slice($lines, -50);
    echo implode("", $last_lines);
} else {
    echo "No error_log found.";
}

// Also check the root directory error log
$rootLog = dirname(__DIR__) . '/error_log';
if (file_exists($rootLog)) {
    echo "\n\n=== ../error_log ===\n";
    $lines = file($rootLog);
    $last_lines = array_slice($lines, -50);
    echo implode("", $last_lines);
}
?>
