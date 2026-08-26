<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
try {
    require_once "public/api/config.php";
    echo "Loaded config.php successfully.\n";
} catch (Throwable $e) {
    echo "Caught exception: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine() . "\n";
}
