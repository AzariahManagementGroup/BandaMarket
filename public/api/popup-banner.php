<?php
require_once __DIR__ . '/config.php';

// Allow GET requests
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        "success" => true,
        "banner" => [
            "enabled" => 1,
            "imageUrl" => "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
            "title" => "Cameroon E-Commerce Forum 2026",
            "linkUrl" => "/#forum-2026"
        ]
    ]);
    exit();
}
