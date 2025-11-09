<?php
// =================================================================
// MASTER CONFIGURATION FILE
// =================================================================

// --- Environment Detection ---
$isLocal = ($_SERVER['HTTP_HOST'] === 'localhost' ||
            $_SERVER['HTTP_HOST'] === '127.0.0.1' ||
            strpos($_SERVER['HTTP_HOST'], 'localhost:') === 0);

// --- Error Reporting ---
if ($isLocal) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    define('DEBUG_MODE', true);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
    define('DEBUG_MODE', false);
}

// --- CORS Headers ---
// This section must come before any JSON output
if ($isLocal) {
    header('Access-Control-Allow-Origin: *'); // Allow any origin for local dev
} else {
    // Production: Be specific
    header('Access-Control-Allow-Origin: https://spaceprobe.in');
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
// Set the content type for all JSON responses
header('Content-Type: application/json; charset=UTF-8');

// --- Database Credentials ---
if ($isLocal) {
    // Local XAMPP Configuration
    $db_host = 'localhost';
    $db_name = 'blog_local';
    $db_user = 'admin';       // The user we created in phpMyAdmin
    $db_pass = 'password123'; // The password for that user
} else {
    // Production Hostinger Configuration
    $db_host = 'localhost';
    $db_name = 'u712572557_Blogs';
    $db_user = 'u712572557_Spaceprobe';
    $db_pass = '16LmQ7thK&';
}

// --- Database Connection Function (PDO) ---
function getPDO() {
    global $db_host, $db_name, $db_user, $db_pass, $isLocal;
    static $pdo = null;

    if ($pdo === null) {
        try {
            $dsn = "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_TIMEOUT            => 5,
            ];
            $pdo = new PDO($dsn, $db_user, $db_pass, $options);
        } catch(PDOException $e) {
            http_response_code(500);
            $errorMessage = $isLocal ? $e->getMessage() : 'Database connection failed.';
            echo json_encode(['error' => $errorMessage]);
            exit;
        }
    }
    return $pdo;
}

// --- Helper Functions ---
function sendJSON($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit();
}