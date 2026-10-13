<?php
require_once __DIR__ . '/db.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$pdo = getDbConnection();

// GET: Audit recent submissions (e.g. for admin desk)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($pdo) {
        $stmt = $pdo->query("SELECT * FROM contact_submissions ORDER BY id DESC LIMIT 50");
        $rows = $stmt->fetchAll();
        echo json_encode(['success' => true, 'source' => 'hostinger_database', 'count' => count($rows), 'submissions' => $rows]);
    } else {
        echo json_encode(['success' => true, 'source' => 'fallback', 'count' => 0, 'submissions' => []]);
    }
    exit;
}

// POST: Save inquiry
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true) ?: $_POST;

    $ref = $body['reference'] ?? ('RYN-' . time());
    $formId = $body['formId'] ?? 'contactForm';
    $formTitle = $body['formTitle'] ?? 'General Commercial Inquiry';
    $targetEmail = $body['targetEmail'] ?? 'rayan@rayan-group.com';
    $senderName = $body['senderName'] ?? 'Website Visitor';
    $senderEmail = $body['senderEmail'] ?? 'no-reply@rayan-group.com';
    $senderPhone = $body['senderPhone'] ?? '';
    $fields = json_encode($body['fields'] ?? []);

    $dbSaved = false;
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("INSERT INTO contact_submissions (reference, form_id, form_title, target_email, sender_name, sender_email, sender_phone, fields_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$ref, $formId, $formTitle, $targetEmail, $senderName, $senderEmail, $senderPhone, $fields]);
            $dbSaved = true;
        } catch (Exception $e) {
            error_log("DB insert failed: " . $e->getMessage());
        }
    }

    // Optional mail dispatch via PHP mail()
    $subject = "Rayan Group Inquiry: {$formTitle} [{$ref}]";
    $msgBody = "Reference: {$ref}\nName: {$senderName}\nEmail: {$senderEmail}\nPhone: {$senderPhone}\n\nDetails:\n" . print_r($body['fields'] ?? [], true);
    $headers = "From: {$senderEmail}\r\nReply-To: {$senderEmail}\r\nX-Mailer: PHP/" . phpversion();
    @mail($targetEmail, $subject, $msgBody, $headers);

    echo json_encode([
        'success' => true,
        'reference' => $ref,
        'db_saved' => $dbSaved,
        'message' => 'Your inquiry has been successfully registered and logged in the Rayan Group corporate registry.'
    ]);
    exit;
}
