<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'config.php';

if (!isset($pdo) || $pdo === null) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit();
}

$action = $_GET['action'] ?? '';
$hide_guests = isset($_GET['hide_guests']) && $_GET['hide_guests'] === 'true';
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;

try {
    switch ($action) {
        case 'recent':
            // Get 50 most recent logs
            $query = "SELECT pl.id, pl.user_id, pl.page_title, pl.page_url, pl.ip_address, pl.user_agent, pl.created_at, 
                             u.name as user_name, u.role as user_role, pl.session_id
                      FROM page_logs pl 
                      LEFT JOIN users u ON pl.user_id = u.id 
                      WHERE pl.page_url NOT LIKE '%localhost%' AND pl.page_url NOT LIKE '%127.0.0.1%'
                      ORDER BY pl.created_at DESC LIMIT :limit";
            $stmt = $pdo->prepare($query);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            $data = $stmt->fetchAll();
            echo json_encode(['status' => 'success', 'data' => $data]);
            break;

        case 'top_users':
            // Get top users by visit count
            $whereClause = "WHERE pl.page_url NOT LIKE '%localhost%' AND pl.page_url NOT LIKE '%127.0.0.1%'";
            if ($hide_guests) {
                $whereClause .= " AND pl.user_id IS NOT NULL";
            }
            $query = "SELECT pl.user_id, u.name as user_name, u.role as user_role, MAX(pl.session_id) as session_id, COUNT(*) as visit_count 
                      FROM page_logs pl 
                      LEFT JOIN users u ON pl.user_id = u.id 
                      $whereClause
                      GROUP BY pl.user_id, u.name, u.role, CASE WHEN pl.user_id IS NULL THEN pl.session_id ELSE 'logged_in' END 
                      ORDER BY visit_count DESC LIMIT :limit";
            $stmt = $pdo->prepare($query);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            $data = $stmt->fetchAll();
            echo json_encode(['status' => 'success', 'data' => $data]);
            break;

        case 'top_pages':
            // Get top pages by visit count
            $whereClause = "WHERE pl.page_url NOT LIKE '%localhost%' AND pl.page_url NOT LIKE '%127.0.0.1%'";
            if ($hide_guests) {
                $whereClause .= " AND pl.user_id IS NOT NULL";
            }
            $query = "SELECT pl.page_title, pl.page_url, COUNT(*) as visit_count 
                      FROM page_logs pl 
                      $whereClause
                      GROUP BY pl.page_title, pl.page_url 
                      ORDER BY visit_count DESC LIMIT :limit";
            $stmt = $pdo->prepare($query);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            $data = $stmt->fetchAll();
            echo json_encode(['status' => 'success', 'data' => $data]);
            break;

        case 'user_top_pages':
            // Get top pages for a specific user (or session if guest)
            $user_id = $_GET['user_id'] ?? null;
            $session_id = $_GET['session_id'] ?? null;
            
            if ($user_id) {
                $query = "SELECT page_title, page_url, COUNT(*) as visit_count 
                          FROM page_logs 
                          WHERE user_id = :user_id AND page_url NOT LIKE '%localhost%' AND page_url NOT LIKE '%127.0.0.1%'
                          GROUP BY page_title, page_url 
                          ORDER BY visit_count DESC LIMIT :limit";
                $stmt = $pdo->prepare($query);
                $stmt->bindValue(':user_id', $user_id);
            } else {
                $query = "SELECT page_title, page_url, COUNT(*) as visit_count 
                          FROM page_logs 
                          WHERE session_id = :session_id AND user_id IS NULL AND page_url NOT LIKE '%localhost%' AND page_url NOT LIKE '%127.0.0.1%'
                          GROUP BY page_title, page_url 
                          ORDER BY visit_count DESC LIMIT :limit";
                $stmt = $pdo->prepare($query);
                $stmt->bindValue(':session_id', $session_id);
            }
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            $data = $stmt->fetchAll();
            echo json_encode(['status' => 'success', 'data' => $data]);
            break;

        case 'page_top_users':
            // Get top users for a specific page
            $page_url = $_GET['page_url'] ?? '';
            $query = "SELECT pl.user_id, u.name as user_name, u.role as user_role, MAX(pl.session_id) as session_id, COUNT(*) as visit_count 
                      FROM page_logs pl 
                      LEFT JOIN users u ON pl.user_id = u.id 
                      WHERE pl.page_url = :page_url
                      GROUP BY pl.user_id, u.name, u.role, CASE WHEN pl.user_id IS NULL THEN pl.session_id ELSE 'logged_in' END 
                      ORDER BY visit_count DESC LIMIT :limit";
            $stmt = $pdo->prepare($query);
            $stmt->bindValue(':page_url', $page_url);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            $data = $stmt->fetchAll();
            echo json_encode(['status' => 'success', 'data' => $data]);
            break;

        default:
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
            break;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
