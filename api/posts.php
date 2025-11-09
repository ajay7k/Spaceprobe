<?php
// Step 1: Include the master configuration file.
// This handles errors, CORS headers, and the database connection function.
require_once __DIR__ . '/config.php';

// Step 2: Start the session to check for authentication.
session_start([
    'cookie_httponly' => true,
    'cookie_secure' => !DEBUG_MODE,
    'cookie_samesite' => 'Lax'
]);

// Step 3: Get the database connection object from our centralized function.
$pdo = getPDO();

// --- All the code below is YOUR original logic, it does not need to change ---

$method = $_SERVER['REQUEST_METHOD'];

// If the request is trying to change data (POST, PUT, DELETE),
// we must check if the user is logged in.
if ($method === 'POST' || $method === 'PUT' || $method === 'DELETE') {
    if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
        // If they are NOT logged in, stop everything and send an error.
        http_response_code(401); // Unauthorized
        echo json_encode(['error' => 'Authentication required to perform this action.']);
        exit(); // Stop the script immediately.
    }
}

try {
    switch($method) {
        case 'GET':
            if (isset($_GET['pinned']) && $_GET['pinned'] === 'true') {
                $stmt = $pdo->query("SELECT * FROM blog_posts WHERE is_pinned = 1 AND published = 1 ORDER BY created_at DESC");
                $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                foreach ($posts as &$post) {
                    $post['tags'] = json_decode($post['tags'], true) ?: [];
                    $post['published'] = (bool)$post['published'];
                    $post['is_pinned'] = (bool)$post['is_pinned'];
                    $post['view_count'] = (int)$post['view_count'];
                }

                echo json_encode($posts);
            }
            else if (isset($_GET['id'])) {
                $postId = $_GET['id'];
                
                $updateViewStmt = $pdo->prepare("UPDATE blog_posts SET view_count = view_count + 1 WHERE id = ?");
                $updateViewStmt->execute([$postId]);

                $stmt = $pdo->prepare("SELECT * FROM blog_posts WHERE id = ?");
                $stmt->execute([$postId]);
                $post = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($post) {
                    $post['tags'] = json_decode($post['tags'], true) ?: [];
                    $post['published'] = (bool)$post['published'];
                    $post['is_pinned'] = (bool)$post['is_pinned'];
                    $post['view_count'] = (int)$post['view_count'];

                    $faqStmt = $pdo->prepare("SELECT id, question, answer FROM faqs WHERE post_id = ? ORDER BY order_num ASC");
                    $faqStmt->execute([$postId]);
                    $faqs = $faqStmt->fetchAll(PDO::FETCH_ASSOC);
                    $post['faqs'] = $faqs;

                    echo json_encode($post);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Post not found']);
                }
            } 
            else {
                $admin = isset($_GET['admin']) ? true : false;
                $sql = $admin ? "SELECT * FROM blog_posts ORDER BY created_at DESC" : "SELECT * FROM blog_posts WHERE published = 1 ORDER BY created_at DESC";
                $stmt = $pdo->query($sql);
                $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                $faqStmt = $pdo->prepare("SELECT id, question, answer FROM faqs WHERE post_id = ? ORDER BY order_num ASC");

                foreach ($posts as &$post) {
                    $post['tags'] = json_decode($post['tags'], true) ?: [];
                    $post['published'] = (bool)$post['published'];
                    $post['is_pinned'] = (bool)$post['is_pinned'];
                    $post['view_count'] = (int)$post['view_count'];

                    $faqStmt->execute([$post['id']]);
                    $faqs = $faqStmt->fetchAll(PDO::FETCH_ASSOC);
                    $post['faqs'] = $faqs;
                }
                
                echo json_encode($posts);
            }
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $post = $data['post'];
            
            if (empty($post['title'])) { http_response_code(400); echo json_encode(['error' => 'Title is required']); exit; }
            
            $stmt = $pdo->prepare("INSERT INTO blog_posts (title, excerpt, content, category, tags, image, author, date, read_time, published, meta_title, meta_description, meta_keywords, is_pinned, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)");
            $result = $stmt->execute([ $post['title'] ?? '', $post['excerpt'] ?? '', $post['content'] ?? '', $post['category'] ?? 'astronomy', json_encode($post['tags'] ?? []), $post['image'] ?? '', $post['author'] ?? '', $post['date'] ?? date('Y-m-d H:i:s'), $post['readTime'] ?? '', isset($post['published']) ? ($post['published'] ? 1 : 0) : 0, $post['metaTitle'] ?? null, $post['metaDescription'] ?? null, $post['metaKeywords'] ?? null ]);
            
            if ($result) {
                $postId = $pdo->lastInsertId();

                if ($postId && isset($post['faqs']) && is_array($post['faqs'])) {
                    $faqStmt = $pdo->prepare("INSERT INTO faqs (post_id, question, answer, order_num) VALUES (?, ?, ?, ?)");
                    $order = 0;
                    foreach ($post['faqs'] as $faq) {
                        if (!empty($faq['question']) && !empty($faq['answer'])) {
                            $faqStmt->execute([$postId, $faq['question'], $faq['answer'], $order++]);
                        }
                    }
                }

                echo json_encode(['success' => true, 'id' => (int)$postId, 'message' => 'Post created successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create post']);
            }
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            $post = $data['post'];
            
            if (!isset($post['id']) || empty($post['id'])) { http_response_code(400); echo json_encode(['error' => 'Post ID required for update']); exit; }
            $postId = $post['id'];

            $stmt = $pdo->prepare("UPDATE blog_posts SET title=?, excerpt=?, content=?, category=?, tags=?, image=?, author=?, date=?, read_time=?, published=?, meta_title=?, meta_description=?, meta_keywords=?, is_pinned=? WHERE id=?");
            $result = $stmt->execute([ $post['title'] ?? '', $post['excerpt'] ?? '', $post['content'] ?? '', $post['category'] ?? 'astronomy', json_encode($post['tags'] ?? []), $post['image'] ?? '', $post['author'] ?? '', $post['date'] ?? date('Y-m-d H:i:s'), $post['readTime'] ?? '', isset($post['published']) ? ($post['published'] ? 1 : 0) : 0, $post['metaTitle'] ?? null, $post['metaDescription'] ?? null, $post['metaKeywords'] ?? null, isset($post['is_pinned']) ? ($post['is_pinned'] ? 1 : 0) : 0, $postId ]);
            
            if ($result) {
                if ($postId && isset($post['faqs']) && is_array($post['faqs'])) {
                    $deleteStmt = $pdo->prepare("DELETE FROM faqs WHERE post_id = ?");
                    $deleteStmt->execute([$postId]);

                    $faqStmt = $pdo->prepare("INSERT INTO faqs (post_id, question, answer, order_num) VALUES (?, ?, ?, ?)");
                    $order = 0;
                    foreach ($post['faqs'] as $faq) {
                        if (!empty($faq['question']) && !empty($faq['answer'])) {
                            $faqStmt->execute([$postId, $faq['question'], $faq['answer'], $order++]);
                        }
                    }
                }
                echo json_encode(['success' => true, 'id' => (int)$postId, 'message' => 'Post updated successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update post']);
            }
            break;
            
        case 'DELETE':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id']) || empty($data['id'])) { http_response_code(400); echo json_encode(['error' => 'Post ID required']); exit; }
            
            $stmt = $pdo->prepare("DELETE FROM blog_posts WHERE id = ?");
            $result = $stmt->execute([$data['id']]);
            
            if ($result) {
                echo json_encode(['success' => true, 'message' => 'Post deleted successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to delete post']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch (PDOException $e) {
    http_response_code(500);
    // Use the error message from the exception for detailed debugging
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
