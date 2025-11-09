<?php
// Step 1: Include the master configuration file.
require_once __DIR__ . '/config.php';

// Step 2: Start the session with secure settings.
session_start([
    'cookie_httponly' => true,
    'cookie_secure' => !DEBUG_MODE,
    'cookie_samesite' => 'Lax'
]);

// Step 3: Get the database connection object.
$pdo = getPDO();

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'POST': // Login endpoint
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data || !isset($data['username']) || !isset($data['password'])) {
                sendJSON(['error' => 'Missing credentials'], 400);
            }
            
            $username = trim($data['username']);
            $password = trim($data['password']);

            // ALWAYS use the database for authentication, both local and production.
            $stmt = $pdo->prepare("SELECT id, password_hash FROM admin_users WHERE username = ? LIMIT 1");
            $stmt->execute([$username]);
            $user = $stmt->fetch();
            
            if ($user && password_verify($password, $user['password_hash'])) {
                // Password is correct, create the session
                $_SESSION['authenticated'] = true;
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $username;
                sendJSON(['success' => true, 'message' => 'Login successful']);
            } else {
                // User not found or password incorrect
                sendJSON(['error' => 'Invalid credentials'], 401);
            }
            break;
            
        case 'GET': // Check authentication status
            $isAuthenticated = isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === true;
            sendJSON([
                'authenticated' => $isAuthenticated,
                'username' => $isAuthenticated ? ($_SESSION['username'] ?? 'Unknown') : null
            ]);
            break;
            
        case 'DELETE': // Logout endpoint
            session_destroy();
            sendJSON(['success' => true, 'message' => 'Logged out successfully']);
            break;
            
        default:
            sendJSON(['error' => 'Method not allowed'], 405);
            break;
    }
} catch (PDOException $e) {
    // If the database connection fails, send a clear error.
    http_response_code(500);
    $errorMessage = DEBUG_MODE ? 'Database error: ' . $e->getMessage() : 'A server error occurred.';
    echo json_encode(['error' => $errorMessage]);
}