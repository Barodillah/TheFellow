<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

require_once 'config.php';

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check database connection
if (!isset($pdo) || $pdo === null) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

$page_url = $data['page_url'] ?? '';

if(!empty($page_url)) {
    try {
        $query = "INSERT INTO page_logs (user_id, session_id, page_title, page_url, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)";
        
        $stmt = $pdo->prepare($query);

        $user_id = !empty($data['user_id']) ? htmlspecialchars(strip_tags($data['user_id'])) : null;
        $session_id = !empty($data['session_id']) ? htmlspecialchars(strip_tags($data['session_id'])) : null;
        $page_title = !empty($data['page_title']) ? htmlspecialchars(strip_tags($data['page_title'])) : null;
        $page_url = htmlspecialchars(strip_tags($page_url));
        
        $ip_address = $_SERVER['REMOTE_ADDR'] ?? null;
        $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? null;

        if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip_address = $_SERVER['HTTP_X_FORWARDED_FOR'];
        }

        if($stmt->execute([$user_id, $session_id, $page_title, $page_url, $ip_address, $user_agent])) {
            http_response_code(201);
            echo json_encode(['status' => 'success', 'message' => 'Page visit logged successfully.']);
        } else {
            http_response_code(503);
            echo json_encode(['status' => 'error', 'message' => 'Unable to log page visit.']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Incomplete data. page_url is required.']);
}
?>
