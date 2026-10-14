<?php
/**
 * Rayan Group — Production Server Live Assistance & Chat Desk API
 * Endpoint: /api/chat.php (or /api/chat via rewrite)
 */

require_once __DIR__ . '/db.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$pdo = getDbConnection();
$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true) ?: $_POST;
$action = $_GET['action'] ?? $body['action'] ?? 'poll';

// Fallback JSON file storage when database is momentarily unreachable
$storageFile = __DIR__ . '/chat_store.json';

function getFallbackStore($file) {
    if (file_exists($file)) {
        $data = json_decode(file_get_contents($file), true);
        if (is_array($data)) return $data;
    }
    return ['sessions' => [], 'messages' => []];
}

function saveFallbackStore($file, $data) {
    @file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
}

function normalizeSessionRow($row) {
    if (!$row) return null;
    $lastAct = !empty($row['last_activity']) 
        ? (is_numeric($row['last_activity']) ? (int)$row['last_activity'] : strtotime($row['last_activity']) * 1000)
        : round(microtime(true) * 1000);
    $created = !empty($row['created_at']) 
        ? (is_numeric($row['created_at']) ? (int)$row['created_at'] : strtotime($row['created_at']) * 1000)
        : $lastAct;

    return [
        'id' => $row['session_id'] ?? $row['id'] ?? '',
        'session_id' => $row['session_id'] ?? $row['id'] ?? '',
        'visitorName' => $row['visitor_name'] ?? $row['visitorName'] ?? 'Website Visitor',
        'visitor_name' => $row['visitor_name'] ?? $row['visitorName'] ?? 'Website Visitor',
        'page' => $row['page'] ?? '/',
        'status' => $row['status'] ?? 'active',
        'createdAt' => $created,
        'created_at' => $row['created_at'] ?? date('Y-m-d H:i:s', (int)($created / 1000)),
        'lastActivity' => $lastAct,
        'last_activity' => $row['last_activity'] ?? date('Y-m-d H:i:s', (int)($lastAct / 1000)),
        'lastMessage' => $row['last_message'] ?? $row['lastMessage'] ?? 'Active conversation',
        'last_message' => $row['last_message'] ?? $row['lastMessage'] ?? 'Active conversation',
        'unreadForAdmin' => (int)($row['unread_for_admin'] ?? $row['unreadForAdmin'] ?? 0),
        'unread_for_admin' => (int)($row['unread_for_admin'] ?? $row['unreadForAdmin'] ?? 0),
        'unreadForVisitor' => (int)($row['unread_for_visitor'] ?? $row['unreadForVisitor'] ?? 0),
        'unread_for_visitor' => (int)($row['unread_for_visitor'] ?? $row['unreadForVisitor'] ?? 0)
    ];
}

function normalizeMessageRow($row) {
    if (!$row) return null;
    $ts = (int)($row['timestamp'] ?? round(microtime(true) * 1000));
    $msgId = $row['msg_id'] ?? $row['id'] ?? ('msg_' . $ts);
    return [
        'id' => (string)$msgId,
        'msg_id' => (string)$msgId,
        'sessionId' => $row['session_id'] ?? $row['sessionId'] ?? '',
        'session_id' => $row['session_id'] ?? $row['sessionId'] ?? '',
        'sender' => $row['sender'] ?? 'visitor',
        'senderName' => $row['sender_name'] ?? $row['senderName'] ?? ($row['sender'] === 'admin' ? '🏛️ Executive Desk' : 'Visitor'),
        'sender_name' => $row['sender_name'] ?? $row['senderName'] ?? ($row['sender'] === 'admin' ? '🏛️ Executive Desk' : 'Visitor'),
        'text' => $row['message_text'] ?? $row['text'] ?? '',
        'message_text' => $row['message_text'] ?? $row['text'] ?? '',
        'timestamp' => $ts,
        'read' => !empty($row['read_status']) || !empty($row['read'])
    ];
}

/**
 * Dispatches an executive email notification to rayan@rayan-group.com
 * when a client opens live chat or requests a live human agent.
 */
function sendLiveChatEmailNotification($sessionId, $visitorName = 'Website Visitor', $page = '/', $triggerEvent = 'opened_chat', $messageText = '') {
    $to = 'rayan@rayan-group.com';
    $cc = 'tender@rayan-group.com';
    $from = 'no-reply@rayan-group.com';

    $eventTitle = 'Client Opened Live Assistance Desk';
    $badgeColor = '#0099e6';
    $badgeBg = 'rgba(0,153,230,0.15)';

    if ($triggerEvent === 'live_agent' || $triggerEvent === 'live_human') {
        $eventTitle = '🚨 Client Requested Live Human Agent';
        $badgeColor = '#10b981';
        $badgeBg = 'rgba(16,185,129,0.15)';
    } elseif ($triggerEvent === 'message' || $triggerEvent === 'first_message') {
        $eventTitle = '💬 Client Sent Live Chat Message';
        $badgeColor = '#f59e0b';
        $badgeBg = 'rgba(245,158,11,0.15)';
    }

    $subject = "🔔 [Live Chat Alert] {$eventTitle} on rayan-group.com";
    $dateGst = gmdate('d M Y, h:i A', time() + 4 * 3600) . ' GST (Gulf Standard Time)';
    $adminUrl = 'https://rayan-group.com/admin/';
    $safeVisitor = htmlspecialchars($visitorName ?: 'Website Visitor', ENT_QUOTES, 'UTF-8');
    $safePage = htmlspecialchars($page ?: '/', ENT_QUOTES, 'UTF-8');
    $safeMsg = $messageText ? nl2br(htmlspecialchars($messageText, ENT_QUOTES, 'UTF-8')) : '<em>(Client has opened the live chat desk and is awaiting assistance.)</em>';

    $html = <<<HTML
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{$subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050b14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #050b14; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #0c1828; border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.5); max-width: 600px; width: 100%;">
          <tr>
            <td style="background: linear-gradient(135deg, #07111e 0%, #0d2238 100%); padding: 24px 30px; border-bottom: 1px solid rgba(255,255,255,0.08);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.15em; color: #0099e6; text-transform: uppercase;">REAL-TIME VISITOR NOTIFICATION</div>
                    <div style="font-size: 20px; font-weight: 800; color: #ffffff; margin-top: 4px;">RAYAN GROUP LIVE DESK</div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 5px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; color: {$badgeColor}; background: {$badgeBg}; border: 1px solid {$badgeColor};">
                      ONLINE
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 30px 10px 30px;">
              <div style="background: rgba(0,153,230,0.08); border-left: 4px solid {$badgeColor}; padding: 14px 18px; border-radius: 4px; margin-bottom: 20px;">
                <div style="font-size: 15px; font-weight: 700; color: #ffffff;">{$eventTitle}</div>
                <div style="font-size: 13px; color: #94a3b8; margin-top: 4px;">A client has initiated a live assistance session on <strong>rayan-group.com</strong>.</div>
              </div>
              <table width="100%" cellpadding="10" cellspacing="0" style="font-size: 14px; border-collapse: collapse; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                  <td width="35%" style="color: #94a3b8; font-weight: 600;">Client / Visitor:</td>
                  <td width="65%" style="color: #ffffff; font-weight: 700;">{$safeVisitor}</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                  <td style="color: #94a3b8; font-weight: 600;">Session ID:</td>
                  <td style="color: #38bdf8; font-family: monospace; font-size: 12px;">{$sessionId}</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                  <td style="color: #94a3b8; font-weight: 600;">Website Page:</td>
                  <td style="color: #cbd5e1;"><a href="{$safePage}" style="color: #38bdf8; text-decoration: none;">{$safePage}</a></td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                  <td style="color: #94a3b8; font-weight: 600;">Time:</td>
                  <td style="color: #cbd5e1;">{$dateGst}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; font-weight: 600; vertical-align: top;">Inquiry Details:</td>
                  <td style="color: #f1f5f9; background: rgba(255,255,255,0.03); padding: 12px; border-radius: 6px; line-height: 1.5;">{$safeMsg}</td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0 30px;">
                <tr>
                  <td align="center">
                    <a href="{$adminUrl}" style="display: inline-block; background: #0099e6; color: #ffffff; font-size: 14px; font-weight: 800; letter-spacing: 0.05em; padding: 14px 28px; border-radius: 6px; text-decoration: none; box-shadow: 0 4px 16px rgba(0,153,230,0.4);">
                      OPEN LIVE EXECUTIVE DESK &amp; REPLY NOW →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background: #07111e; padding: 16px 30px; border-top: 1px solid rgba(255,255,255,0.08); text-align: center; font-size: 12px; color: #64748b;">
              Rayan Group Corporate Headquarters • Abu Dhabi, United Arab Emirates<br>
              Real-Time Live Assistance Notification System • <a href="https://rayan-group.com" style="color: #94a3b8; text-decoration: none;">rayan-group.com</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;

    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: Rayan Group Live Desk <{$from}>\r\n";
    $headers .= "Reply-To: {$to}\r\n";
    $headers .= "Cc: {$cc}\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
    $headers .= "X-Priority: 1\r\n";

    return @mail($to, $subject, $html, $headers);
}

// ============================================================================
// 1. GET REQUESTS
// ============================================================================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    // Action: list_sessions (Admin Panel)
    if ($action === 'list_sessions') {
        $sessionList = [];

        if ($pdo) {
            try {
                $stmt = $pdo->query("SELECT * FROM chat_sessions ORDER BY last_activity DESC LIMIT 100");
                $rawRows = $stmt->fetchAll();
                foreach ($rawRows as $r) {
                    $norm = normalizeSessionRow($r);
                    if ($norm && !empty($norm['id'])) {
                        // If lastMessage is empty, attempt to fetch latest from chat_messages
                        if (empty($norm['lastMessage']) || $norm['lastMessage'] === 'Active conversation') {
                            $mStmt = $pdo->prepare("SELECT message_text FROM chat_messages WHERE session_id = ? ORDER BY timestamp DESC LIMIT 1");
                            $mStmt->execute([$norm['id']]);
                            $latestText = $mStmt->fetchColumn();
                            if ($latestText) {
                                $norm['lastMessage'] = $latestText;
                                $norm['last_message'] = $latestText;
                            }
                        }
                        $sessionList[] = $norm;
                    }
                }
            } catch (Exception $e) {
                // fall through to file fallback
            }
        }

        // Merge with file fallback if database had none or failed
        if (empty($sessionList)) {
            $fallback = getFallbackStore($storageFile);
            foreach ($fallback['sessions'] as $s) {
                $sessionList[] = normalizeSessionRow($s);
            }
            usort($sessionList, fn($a, $b) => ($b['lastActivity'] ?? 0) - ($a['lastActivity'] ?? 0));
        }

        echo json_encode(['success' => true, 'sessions' => $sessionList], JSON_UNESCAPED_SLASHES);
        exit;
    }

    // Action: get_messages (Admin Panel selects session)
    if ($action === 'get_messages') {
        $sessionId = $_GET['sessionId'] ?? $_GET['session_id'] ?? '';
        if (!$sessionId) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing sessionId']);
            exit;
        }

        $sessionData = null;
        $messages = [];

        if ($pdo) {
            try {
                $sStmt = $pdo->prepare("SELECT * FROM chat_sessions WHERE session_id = ?");
                $sStmt->execute([$sessionId]);
                $sRow = $sStmt->fetch();
                if ($sRow) {
                    $sessionData = normalizeSessionRow($sRow);
                }

                $mStmt = $pdo->prepare("SELECT * FROM chat_messages WHERE session_id = ? ORDER BY timestamp ASC");
                $mStmt->execute([$sessionId]);
                $mRows = $mStmt->fetchAll();
                foreach ($mRows as $m) {
                    $messages[] = normalizeMessageRow($m);
                }
            } catch (Exception $e) {}
        }

        // Check fallback store if empty
        if (empty($messages)) {
            $fallback = getFallbackStore($storageFile);
            if (isset($fallback['sessions'][$sessionId])) {
                $sessionData = normalizeSessionRow($fallback['sessions'][$sessionId]);
            }
            if (isset($fallback['messages'][$sessionId])) {
                foreach ($fallback['messages'][$sessionId] as $m) {
                    $messages[] = normalizeMessageRow($m);
                }
            }
        }

        echo json_encode([
            'success' => true,
            'session' => $sessionData,
            'messages' => $messages
        ], JSON_UNESCAPED_SLASHES);
        exit;
    }

    // Action: poll (Visitor widget or admin polling)
    if ($action === 'poll') {
        $sessionId = $_GET['sessionId'] ?? $_GET['session_id'] ?? '';
        $since = (int)($_GET['since'] ?? 0);
        $newMsgs = [];
        $sessionData = null;

        if ($pdo && $sessionId) {
            try {
                $sStmt = $pdo->prepare("SELECT * FROM chat_sessions WHERE session_id = ?");
                $sStmt->execute([$sessionId]);
                $sRow = $sStmt->fetch();
                if ($sRow) {
                    $sessionData = normalizeSessionRow($sRow);
                }

                $mStmt = $pdo->prepare("SELECT * FROM chat_messages WHERE session_id = ? AND timestamp > ? ORDER BY timestamp ASC");
                $mStmt->execute([$sessionId, $since]);
                foreach ($mStmt->fetchAll() as $m) {
                    $newMsgs[] = normalizeMessageRow($m);
                }
            } catch (Exception $e) {}
        }

        if ($sessionId && empty($newMsgs)) {
            $fallback = getFallbackStore($storageFile);
            if (isset($fallback['sessions'][$sessionId])) {
                $sessionData = normalizeSessionRow($fallback['sessions'][$sessionId]);
            }
            if (isset($fallback['messages'][$sessionId])) {
                foreach ($fallback['messages'][$sessionId] as $m) {
                    if (($m['timestamp'] ?? 0) > $since) {
                        $newMsgs[] = normalizeMessageRow($m);
                    }
                }
            }
        }

        echo json_encode([
            'success' => true,
            'session' => $sessionData,
            'messages' => $newMsgs,
            'serverTime' => round(microtime(true) * 1000)
        ], JSON_UNESCAPED_SLASHES);
        exit;
    }

    echo json_encode(['success' => true, 'status' => 'Live Assistance API Online']);
    exit;
}

// ============================================================================
// 2. POST REQUESTS
// ============================================================================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $postAction = $body['action'] ?? $action;
    $sessionId = $body['sessionId'] ?? $body['session_id'] ?? '';

    if (!$sessionId) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing sessionId']);
        exit;
    }

    // Handle 'send' (visitor) OR 'reply' (admin) OR 'send_message'
    if (in_array($postAction, ['send', 'reply', 'send_message'])) {
        $text = trim($body['text'] ?? $body['message'] ?? '');
        if (!$text) {
            http_response_code(400);
            echo json_encode(['error' => 'Message text cannot be empty']);
            exit;
        }

        $sender = ($postAction === 'reply' || ($body['sender'] ?? '') === 'admin') ? 'admin' : 'visitor';
        $senderName = $body['senderName'] ?? $body['sender_name'] ?? ($body['visitorInfo']['name'] ?? ($sender === 'admin' ? '🏛️ Executive Desk' : 'Website Visitor'));
        $page = $body['page'] ?? '/';
        $ts = (int)($body['timestamp'] ?? round(microtime(true) * 1000));
        $msgId = $body['id'] ?? $body['msg_id'] ?? ('msg_' . $ts . '_' . substr(bin2hex(random_bytes(4)), 0, 6));

        $msgObj = [
            'id' => $msgId,
            'msg_id' => $msgId,
            'sessionId' => $sessionId,
            'session_id' => $sessionId,
            'sender' => $sender,
            'senderName' => $senderName,
            'sender_name' => $senderName,
            'text' => $text,
            'message_text' => $text,
            'timestamp' => $ts,
            'read' => false
        ];

        $sessionObj = null;

        if ($pdo) {
            try {
                // Upsert chat_sessions
                if ($sender === 'visitor') {
                    $sStmt = $pdo->prepare("
                        INSERT INTO chat_sessions (session_id, visitor_name, page, status, last_message, unread_for_admin, last_activity)
                        VALUES (?, ?, ?, 'active', ?, 1, CURRENT_TIMESTAMP)
                        ON DUPLICATE KEY UPDATE
                            visitor_name = IF(VALUES(visitor_name) != 'Website Visitor', VALUES(visitor_name), visitor_name),
                            page = VALUES(page),
                            status = 'active',
                            last_message = VALUES(last_message),
                            unread_for_admin = unread_for_admin + 1,
                            last_activity = CURRENT_TIMESTAMP
                    ");
                    $sStmt->execute([$sessionId, $senderName, $page, $text]);
                } else {
                    $sStmt = $pdo->prepare("
                        INSERT INTO chat_sessions (session_id, visitor_name, page, status, last_message, unread_for_visitor, last_activity)
                        VALUES (?, 'Website Visitor', ?, 'active', ?, 1, CURRENT_TIMESTAMP)
                        ON DUPLICATE KEY UPDATE
                            last_message = VALUES(last_message),
                            unread_for_visitor = unread_for_visitor + 1,
                            last_activity = CURRENT_TIMESTAMP
                    ");
                    $sStmt->execute([$sessionId, $page, $text]);
                }

                // Check for duplicate message insertion
                $checkStmt = $pdo->prepare("SELECT id FROM chat_messages WHERE session_id = ? AND (msg_id = ? OR (sender = ? AND message_text = ? AND ABS(timestamp - ?) < 4000)) LIMIT 1");
                $checkStmt->execute([$sessionId, $msgId, $sender, $text, $ts]);
                if (!$checkStmt->fetch()) {
                    $mStmt = $pdo->prepare("INSERT INTO chat_messages (msg_id, session_id, sender, sender_name, message_text, timestamp) VALUES (?, ?, ?, ?, ?, ?)");
                    $mStmt->execute([$msgId, $sessionId, $sender, $senderName, $text, $ts]);
                }

                // Fetch updated session
                $qStmt = $pdo->prepare("SELECT * FROM chat_sessions WHERE session_id = ?");
                $qStmt->execute([$sessionId]);
                $sessionObj = normalizeSessionRow($qStmt->fetch());
            } catch (Exception $e) {
                error_log("Chat DB error: " . $e->getMessage());
            }
        }

        // Always sync to file fallback as a durable snapshot
        $fallback = getFallbackStore($storageFile);
        if (!isset($fallback['sessions'][$sessionId])) {
            $fallback['sessions'][$sessionId] = [
                'session_id' => $sessionId,
                'visitor_name' => $senderName,
                'page' => $page,
                'status' => 'active',
                'last_message' => $text,
                'unread_for_admin' => ($sender === 'visitor' ? 1 : 0),
                'unread_for_visitor' => ($sender === 'admin' ? 1 : 0),
                'created_at' => date('Y-m-d H:i:s'),
                'last_activity' => date('Y-m-d H:i:s')
            ];
        } else {
            $fallback['sessions'][$sessionId]['last_message'] = $text;
            $fallback['sessions'][$sessionId]['last_activity'] = date('Y-m-d H:i:s');
            if ($sender === 'visitor') {
                $fallback['sessions'][$sessionId]['unread_for_admin'] = ($fallback['sessions'][$sessionId]['unread_for_admin'] ?? 0) + 1;
                if ($senderName !== 'Website Visitor') $fallback['sessions'][$sessionId]['visitor_name'] = $senderName;
            } else {
                $fallback['sessions'][$sessionId]['unread_for_visitor'] = ($fallback['sessions'][$sessionId]['unread_for_visitor'] ?? 0) + 1;
            }
        }
        if (!isset($fallback['messages'][$sessionId])) {
            $fallback['messages'][$sessionId] = [];
        }
        $fallback['messages'][$sessionId][] = $msgObj;
        saveFallbackStore($storageFile, $fallback);

        if (!$sessionObj) {
            $sessionObj = normalizeSessionRow($fallback['sessions'][$sessionId]);
        }

        // Auto-notify Rayan Group email if visitor message and email not yet sent
        if ($sender === 'visitor') {
            $needNotify = false;
            if ($pdo) {
                try {
                    $chk = $pdo->prepare("SELECT email_notified FROM chat_sessions WHERE session_id = ?");
                    $chk->execute([$sessionId]);
                    $en = $chk->fetchColumn();
                    if (!$en) {
                        $needNotify = true;
                        $upd = $pdo->prepare("UPDATE chat_sessions SET email_notified = 1 WHERE session_id = ?");
                        $upd->execute([$sessionId]);
                    }
                } catch (Exception $e) {}
            }
            if (empty($fallback['sessions'][$sessionId]['email_notified'])) {
                $needNotify = true;
                $fallback['sessions'][$sessionId]['email_notified'] = 1;
                saveFallbackStore($storageFile, $fallback);
            }
            if ($needNotify) {
                sendLiveChatEmailNotification($sessionId, $senderName, $page, 'first_message', $text);
            }
        }

        echo json_encode([
            'success' => true,
            'message' => $msgObj,
            'session' => $sessionObj
        ], JSON_UNESCAPED_SLASHES);
        exit;
    }

    // Action: mark_read
    if ($postAction === 'mark_read') {
        $by = $body['by'] ?? 'admin';
        if ($pdo) {
            try {
                if ($by === 'admin') {
                    $stmt = $pdo->prepare("UPDATE chat_sessions SET unread_for_admin = 0 WHERE session_id = ?");
                    $stmt->execute([$sessionId]);
                    $mStmt = $pdo->prepare("UPDATE chat_messages SET read_status = 1 WHERE session_id = ? AND sender = 'visitor'");
                    $mStmt->execute([$sessionId]);
                } else {
                    $stmt = $pdo->prepare("UPDATE chat_sessions SET unread_for_visitor = 0 WHERE session_id = ?");
                    $stmt->execute([$sessionId]);
                    $mStmt = $pdo->prepare("UPDATE chat_messages SET read_status = 1 WHERE session_id = ? AND sender = 'admin'");
                    $mStmt->execute([$sessionId]);
                }
            } catch (Exception $e) {}
        }

        $fallback = getFallbackStore($storageFile);
        if (isset($fallback['sessions'][$sessionId])) {
            if ($by === 'admin') $fallback['sessions'][$sessionId]['unread_for_admin'] = 0;
            else $fallback['sessions'][$sessionId]['unread_for_visitor'] = 0;
            saveFallbackStore($storageFile, $fallback);
        }

        echo json_encode(['success' => true, 'sessionId' => $sessionId]);
        exit;
    }

    // Action: resolve
    if ($postAction === 'resolve') {
        if ($pdo) {
            try {
                $stmt = $pdo->prepare("UPDATE chat_sessions SET status = 'resolved' WHERE session_id = ?");
                $stmt->execute([$sessionId]);
            } catch (Exception $e) {}
        }

        $fallback = getFallbackStore($storageFile);
        if (isset($fallback['sessions'][$sessionId])) {
            $fallback['sessions'][$sessionId]['status'] = 'resolved';
            saveFallbackStore($storageFile, $fallback);
        }

        echo json_encode(['success' => true, 'sessionId' => $sessionId, 'status' => 'resolved']);
        exit;
    }

    // Action: clear_messages (Clears all message history in a session, keeps session record)
    if ($postAction === 'clear_messages') {
        if ($pdo) {
            try {
                $mStmt = $pdo->prepare("DELETE FROM chat_messages WHERE session_id = ?");
                $mStmt->execute([$sessionId]);
                $sStmt = $pdo->prepare("UPDATE chat_sessions SET last_message = '(Conversation cleared)', unread_for_admin = 0, unread_for_visitor = 0, last_activity = CURRENT_TIMESTAMP WHERE session_id = ?");
                $sStmt->execute([$sessionId]);
            } catch (Exception $e) {}
        }

        $fallback = getFallbackStore($storageFile);
        $fallback['messages'][$sessionId] = [];
        if (isset($fallback['sessions'][$sessionId])) {
            $fallback['sessions'][$sessionId]['last_message'] = '(Conversation cleared)';
            $fallback['sessions'][$sessionId]['unread_for_admin'] = 0;
            $fallback['sessions'][$sessionId]['unread_for_visitor'] = 0;
        }
        saveFallbackStore($storageFile, $fallback);

        echo json_encode(['success' => true, 'action' => 'cleared_messages', 'sessionId' => $sessionId]);
        exit;
    }

    // Action: delete_session / delete / clear (Permanently deletes session and all associated messages)
    if (in_array($postAction, ['delete_session', 'delete', 'clear'])) {
        if ($pdo) {
            try {
                $mStmt = $pdo->prepare("DELETE FROM chat_messages WHERE session_id = ?");
                $mStmt->execute([$sessionId]);
                $sStmt = $pdo->prepare("DELETE FROM chat_sessions WHERE session_id = ?");
                $sStmt->execute([$sessionId]);
            } catch (Exception $e) {}
        }

        $fallback = getFallbackStore($storageFile);
        unset($fallback['sessions'][$sessionId]);
        unset($fallback['messages'][$sessionId]);
        saveFallbackStore($storageFile, $fallback);

        echo json_encode(['success' => true, 'action' => 'deleted_session', 'sessionId' => $sessionId]);
        exit;
    }

    // Action: init_session
    if ($postAction === 'init_session') {
        $visitorName = $body['visitorName'] ?? $body['visitor_name'] ?? 'Website Visitor';
        $page = $body['page'] ?? '/';

        if ($pdo) {
            try {
                $stmt = $pdo->prepare("
                    INSERT INTO chat_sessions (session_id, visitor_name, page, status) 
                    VALUES (?, ?, ?, 'active') 
                    ON DUPLICATE KEY UPDATE visitor_name = VALUES(visitor_name), page = VALUES(page)
                ");
                $stmt->execute([$sessionId, $visitorName, $page]);
            } catch (Exception $e) {}
        }

        echo json_encode(['success' => true, 'sessionId' => $sessionId, 'visitorName' => $visitorName]);
        exit;
    }

    // Action: notify_chat_open (Triggered when client opens live chat or requests human agent)
    if ($postAction === 'notify_chat_open') {
        $visitorName = $body['visitorName'] ?? $body['visitor_name'] ?? 'Website Visitor';
        $page = $body['page'] ?? '/';
        $trigger = $body['trigger'] ?? 'opened_chat';
        $messageText = $body['message'] ?? $body['text'] ?? '';

        $alreadyNotified = false;
        if ($pdo) {
            try {
                $check = $pdo->prepare("SELECT email_notified FROM chat_sessions WHERE session_id = ?");
                $check->execute([$sessionId]);
                $val = $check->fetchColumn();
                if ($val && $trigger !== 'live_agent' && $trigger !== 'live_human') {
                    $alreadyNotified = true;
                }
                // Mark email_notified in DB
                $up = $pdo->prepare("
                    INSERT INTO chat_sessions (session_id, visitor_name, page, status, email_notified) 
                    VALUES (?, ?, ?, 'active', 1) 
                    ON DUPLICATE KEY UPDATE email_notified = 1, page = VALUES(page)
                ");
                $up->execute([$sessionId, $visitorName, $page]);
            } catch (Exception $e) {}
        }

        $fallback = getFallbackStore($storageFile);
        if (!empty($fallback['sessions'][$sessionId]['email_notified']) && $trigger !== 'live_agent' && $trigger !== 'live_human') {
            $alreadyNotified = true;
        } else {
            if (!isset($fallback['sessions'][$sessionId])) {
                $fallback['sessions'][$sessionId] = [
                    'session_id' => $sessionId,
                    'visitor_name' => $visitorName,
                    'page' => $page,
                    'status' => 'active',
                    'email_notified' => 1,
                    'created_at' => date('Y-m-d H:i:s'),
                    'last_activity' => date('Y-m-d H:i:s')
                ];
            } else {
                $fallback['sessions'][$sessionId]['email_notified'] = 1;
            }
            saveFallbackStore($storageFile, $fallback);
        }

        $sent = false;
        if (!$alreadyNotified) {
            $sent = sendLiveChatEmailNotification($sessionId, $visitorName, $page, $trigger, $messageText);
        }

        echo json_encode([
            'success' => true,
            'notified' => (bool)$sent,
            'alreadyNotified' => $alreadyNotified,
            'sessionId' => $sessionId
        ]);
        exit;
    }
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Unknown action']);
