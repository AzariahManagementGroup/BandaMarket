<?php
// Endpoint: /api/bargains
require_once __DIR__ . '/config.php';

// 1. Automatic Schema Initialization for bargain_deals
$conn->query("CREATE TABLE IF NOT EXISTS bargain_deals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    originalPrice DECIMAL(10,2) NOT NULL,
    discountPercent VARCHAR(20) DEFAULT '-30%',
    imageUrl TEXT,
    region VARCHAR(100) DEFAULT 'Littoral',
    sellerName VARCHAR(255) DEFAULT 'Verified Producer',
    isLive TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

// Removed automatic seed logic for bargain deals per user request.

$request_method = $_SERVER['REQUEST_METHOD'];

// GET Request: Fetch Bargain Deals and Submitted Bargains from Database
if ($request_method === 'GET') {
    // A. Fetch featured bargain deals
    $dealsRes = $conn->query("SELECT id, title, price, originalPrice as oldPrice, discountPercent as off, imageUrl as img, region, sellerName as seller FROM bargain_deals WHERE isLive = 1 ORDER BY id DESC");
    $deals = [];
    if ($dealsRes) {
        while ($row = $dealsRes->fetch_assoc()) {
            $row['id'] = intval($row['id']);
            $row['price'] = floatval($row['price']);
            $row['oldPrice'] = floatval($row['oldPrice']);
            $row['formattedPrice'] = "FCFA " . number_format($row['price']);
            $row['formattedOldPrice'] = "FCFA " . number_format($row['oldPrice']);
            $deals[] = $row;
        }
    }

    // B. Fetch submitted user bargains
    $userBargainsRes = $conn->query("SELECT * FROM bargains ORDER BY createdAt DESC LIMIT 20");
    $userBargains = [];
    if ($userBargainsRes) {
        while ($brow = $userBargainsRes->fetch_assoc()) {
            $userBargains[] = $brow;
        }
    }

    echo json_encode([
        "success" => true,
        "deals" => $deals,
        "bargains" => $userBargains
    ]);
    exit();
}

// POST Request: Submit new user bargain negotiation
if ($request_method === 'POST') {
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);

    $id = "brg-" . round(microtime(true) * 1000);
    $productId = isset($data['productId']) ? trim($data['productId']) : '';
    $productTitle = isset($data['productTitle']) ? trim($data['productTitle']) : 'Marketplace Item';
    $sellerId = isset($data['sellerId']) ? trim($data['sellerId']) : '';
    $sellerEmail = isset($data['sellerEmail']) ? trim($data['sellerEmail']) : 'seller@camemark.com';
    $buyerName = isset($data['buyerName']) ? trim($data['buyerName']) : 'Buyer';
    $buyerEmail = isset($data['buyerEmail']) ? trim($data['buyerEmail']) : 'buyer@camemark.com';
    $buyerPhone = isset($data['buyerPhone']) ? trim($data['buyerPhone']) : '';
    $offerPrice = isset($data['offerPrice']) ? floatval($data['offerPrice']) : 0;
    $offerQty = isset($data['offerQty']) ? intval($data['offerQty']) : 1;
    $currency = isset($data['currency']) ? trim($data['currency']) : 'XAF';
    $now = date('Y-m-d H:i:s');

    if ($offerPrice <= 0) {
        http_response_code(400);
        echo json_encode(["error" => "Offer price must be greater than zero."]);
        exit();
    }

    $stmt = $conn->prepare("INSERT INTO bargains (id, productId, productTitle, sellerId, sellerEmail, buyerName, buyerEmail, buyerPhone, offerPrice, offerQty, currency, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)");
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $conn->error]);
        exit();
    }
    $stmt->bind_param("ssssssssdiss", $id, $productId, $productTitle, $sellerId, $sellerEmail, $buyerName, $buyerEmail, $buyerPhone, $offerPrice, $offerQty, $currency, $now);

    if ($stmt->execute()) {
        // A. Send Bargain Notification Email to Seller
        $sellerSubject = "🤝 New Live Bargain Offer: " . $productTitle;
        $totalAmount = $offerPrice * $offerQty;
        $sellerBody = "
        <p>Hello Seller,</p>
        <p>A buyer has submitted a <strong>live bargain offer</strong> for <strong>" . htmlspecialchars($productTitle) . "</strong>!</p>
        <p><strong>Buyer Name:</strong> " . htmlspecialchars($buyerName) . "<br>
        <strong>Email:</strong> " . htmlspecialchars($buyerEmail) . "<br>
        <strong>Phone / WhatsApp:</strong> " . htmlspecialchars($buyerPhone) . "<br>
        <strong>Offer Price:</strong> " . $currency . " " . number_format($offerPrice) . " / unit<br>
        <strong>Quantity:</strong> " . $offerQty . "<br>
        <strong>Total Bargain Offer:</strong> " . $currency . " " . number_format($totalAmount) . "</p>
        <p>Log in to your CameMark Merchant Portal or reply directly to accept or counter this deal.</p>
        <a href='https://camemark.com/seller' class='btn'>Open Merchant Portal</a>";

        if (!empty($sellerEmail)) {
            send_html_email($sellerEmail, $sellerSubject, $sellerBody, $conn);
        }

        // B. Send Admin Alert Email
        $adminEmail = "taiwodele88@gmail.com";
        $adminSubject = "🤝 Live Market Bargain Submitted: " . $buyerName . " -> " . $productTitle;
        $adminBody = "
        <p>Hello Admin,</p>
        <p>A live bargain negotiation has been created on CameMark Marketplace!</p>
        <p><strong>Bargain ID:</strong> " . $id . "<br>
        <strong>Product:</strong> " . htmlspecialchars($productTitle) . "<br>
        <strong>Offer Amount:</strong> " . $currency . " " . number_format($offerPrice) . " (" . $offerQty . " units)<br>
        <strong>Buyer:</strong> " . htmlspecialchars($buyerName) . " (" . htmlspecialchars($buyerEmail) . ", " . htmlspecialchars($buyerPhone) . ")</p>";

        send_html_email($adminEmail, $adminSubject, $adminBody, $conn);

        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Live bargain offer submitted to seller! Notifications & emails sent.",
            "bargain" => [
                "id" => $id,
                "productId" => $productId,
                "productTitle" => $productTitle,
                "offerPrice" => $offerPrice,
                "offerQty" => $offerQty,
                "totalAmount" => $totalAmount,
                "status" => "pending",
                "createdAt" => $now
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to record live bargain in database."]);
    }
    $stmt->close();
    exit();
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
?>
