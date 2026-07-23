<?php
// API Endpoint for Products Database Management
require_once __DIR__ . '/config.php';

// 1. Automatic Schema Initialization for products
$conn->query("CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'Agriculture',
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'FCFA',
    rating VARCHAR(50) DEFAULT '4.8 (120)',
    reviewsCount INT DEFAULT 120,
    region VARCHAR(100) DEFAULT 'Littoral',
    sellerName VARCHAR(255) DEFAULT 'Cameroon Producer Co-op',
    imageUrl TEXT,
    badge VARCHAR(50) DEFAULT 'Farm Fresh',
    isBargainable TINYINT(1) DEFAULT 0,
    stock INT DEFAULT 100,
    description TEXT,
    sellerId VARCHAR(100) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

// 2. Automatic Seed Logic if table is empty
$countRes = $conn->query("SELECT COUNT(*) as cnt FROM products");
$countRow = $countRes ? $countRes->fetch_assoc() : ['cnt' => 0];

if (intval($countRow['cnt']) === 0) {
    $seedProducts = [
        [
            'title' => 'Red Palm Oil (1L)',
            'category' => 'Agriculture',
            'price' => 2100.00,
            'rating' => '4.8 (126)',
            'region' => 'South West',
            'sellerName' => 'Best Palm Cooperative',
            'imageUrl' => 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80',
            'badge' => 'Farm Fresh',
            'isBargainable' => 0,
            'description' => 'Pure unrefined 100% natural red palm oil directly from South West plantations.'
        ],
        [
            'title' => 'Organic Cocoa Beans (1kg)',
            'category' => 'Agriculture',
            'price' => 3500.00,
            'rating' => '4.7 (98)',
            'region' => 'Centre',
            'sellerName' => 'Cocoa Farmers Union',
            'imageUrl' => 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=400&q=80',
            'badge' => 'Bargain',
            'isBargainable' => 1,
            'description' => 'Sun-dried premium grade cocoa beans harvested in the Centre region.'
        ],
        [
            'title' => 'Plantains (1 Bunch)',
            'category' => 'Food & Beverages',
            'price' => 800.00,
            'rating' => '4.6 (76)',
            'region' => 'Littoral',
            'sellerName' => 'Green Valley Farms',
            'imageUrl' => 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80',
            'badge' => 'Farm Fresh',
            'isBargainable' => 0,
            'description' => 'Fresh sweet plantains grown locally in Douala/Littoral area.'
        ],
        [
            'title' => 'Fresh Tomatoes (1kg)',
            'category' => 'Agriculture',
            'price' => 1600.00,
            'rating' => '4.7 (112)',
            'region' => 'North West',
            'sellerName' => 'Healthy Fields Co-op',
            'imageUrl' => 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
            'badge' => 'Farm Fresh',
            'isBargainable' => 0,
            'description' => 'Ripe organic red tomatoes from North West volcanic soil.'
        ],
        [
            'title' => 'Robusta Coffee (1kg)',
            'category' => 'Food & Beverages',
            'price' => 4200.00,
            'rating' => '4.8 (89)',
            'region' => 'Ouest',
            'sellerName' => 'Highland Coffee Farmers',
            'imageUrl' => 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80',
            'badge' => 'Bargain',
            'isBargainable' => 1,
            'description' => 'Aromatic high-altitude roasted Robusta coffee beans from Ouest region.'
        ],
        [
            'title' => 'Handmade Woven Basket',
            'category' => 'Handmade',
            'price' => 3600.00,
            'rating' => '4.7 (64)',
            'region' => 'Adamawa',
            'sellerName' => 'Artisans du Cameroun',
            'imageUrl' => 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=400&q=80',
            'badge' => 'Handmade',
            'isBargainable' => 0,
            'description' => 'Handcrafted traditional African decorative & utility storage basket.'
        ]
    ];

    $stmt = $conn->prepare("INSERT INTO products (title, category, price, rating, region, sellerName, imageUrl, badge, isBargainable, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    foreach ($seedProducts as $p) {
        $stmt->bind_param("ssdsssssis", 
            $p['title'], 
            $p['category'], 
            $p['price'], 
            $p['rating'], 
            $p['region'], 
            $p['sellerName'], 
            $p['imageUrl'], 
            $p['badge'], 
            $p['isBargainable'], 
            $p['description']
        );
        $stmt->execute();
    }
    $stmt->close();
}

$request_method = $_SERVER['REQUEST_METHOD'];

// Handle GET request: Fetch products from database
if ($request_method === 'GET') {
    $where = [];
    $params = [];
    $types = "";

    // Optional query parameters
    $region = isset($_GET['region']) ? trim($_GET['region']) : '';
    $category = isset($_GET['category']) ? trim($_GET['category']) : '';
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';

    if (!empty($region) && $region !== 'All Regions' && $region !== 'all-reg') {
        $where[] = "region LIKE ?";
        $params[] = "%" . $region . "%";
        $types .= "s";
    }

    if (!empty($category) && $category !== 'All Categories' && $category !== 'all-cat') {
        $where[] = "category LIKE ?";
        $params[] = "%" . $category . "%";
        $types .= "s";
    }

    if (!empty($search)) {
        $where[] = "(title LIKE ? OR description LIKE ? OR sellerName LIKE ?)";
        $searchParam = "%" . $search . "%";
        $params[] = $searchParam;
        $params[] = $searchParam;
        $params[] = $searchParam;
        $types .= "sss";
    }

    $sql = "SELECT id, title, category, price, currency, rating, reviewsCount, region, sellerName as seller, imageUrl as img, badge as tag, isBargainable as isBargain, stock, description, created_at FROM products";
    if (count($where) > 0) {
        $sql .= " WHERE " . implode(" AND ", $where);
    }
    $sql .= " ORDER BY id DESC";

    $stmt = $conn->prepare($sql);
    if (!empty($types) && count($params) > 0) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();

    $products = [];
    while ($row = $result->fetch_assoc()) {
        $row['id'] = intval($row['id']);
        $row['price'] = floatval($row['price']);
        $row['isBargain'] = boolval($row['isBargain']);
        $row['stock'] = intval($row['stock']);
        $products[] = $row;
    }
    $stmt->close();

    echo json_encode([
        "success" => true,
        "count" => count($products),
        "products" => $products
    ]);
    exit();
}

// Handle POST request: Add new product to database
if ($request_method === 'POST') {
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);

    if (empty($data['title']) || empty($data['price'])) {
        http_response_code(400);
        echo json_encode(["error" => "Title and price are required."]);
        exit();
    }

    $title = trim($data['title']);
    $category = isset($data['category']) ? trim($data['category']) : 'Agriculture';
    $price = floatval($data['price']);
    $rating = isset($data['rating']) ? trim($data['rating']) : '5.0 (1)';
    $region = isset($data['region']) ? trim($data['region']) : 'Littoral';
    $sellerName = isset($data['sellerName']) ? trim($data['sellerName']) : 'Verified Merchant';
    $imageUrl = isset($data['imageUrl']) ? trim($data['imageUrl']) : 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80';
    $badge = isset($data['badge']) ? trim($data['badge']) : 'Farm Fresh';
    $isBargainable = !empty($data['isBargainable']) ? 1 : 0;
    $description = isset($data['description']) ? trim($data['description']) : '';
    $sellerId = isset($data['sellerId']) ? trim($data['sellerId']) : null;

    $stmt = $conn->prepare("INSERT INTO products (title, category, price, rating, region, sellerName, imageUrl, badge, isBargainable, description, sellerId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssdsssssiss", $title, $category, $price, $rating, $region, $sellerName, $imageUrl, $badge, $isBargainable, $description, $sellerId);
    
    if ($stmt->execute()) {
        $newId = $stmt->insert_id;
        http_response_code(201);
        echo json_encode([
            "success" => true,
            "message" => "Product created successfully in database",
            "product" => [
                "id" => $newId,
                "title" => $title,
                "category" => $category,
                "price" => $price,
                "region" => $region,
                "seller" => $sellerName,
                "img" => $imageUrl,
                "tag" => $badge,
                "isBargain" => (bool)$isBargainable
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to create product in database."]);
    }
    $stmt->close();
    exit();
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
?>
