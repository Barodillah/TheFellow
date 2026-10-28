<?php
// Include konfigurasi backend & CORS
require_once __DIR__ . '/config.php';

// Pastikan header respons berupa JSON
header('Content-Type: application/json; charset=UTF-8');

// Hanya terima method POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'error' => [
            'message' => 'Method tidak diizinkan. Endpoint ini hanya menerima POST request.'
        ]
    ]);
    exit();
}

// Cek ketersediaan API Key di backend
$apiKey = defined('OPENROUTER_API_KEY') ? OPENROUTER_API_KEY : ($openrouter_api_key ?? '');
if (empty($apiKey)) {
    http_response_code(500);
    echo json_encode([
        'error' => [
            'message' => 'OpenRouter API Key belum dikonfigurasi di backend (api/config.php).'
        ]
    ]);
    exit();
}

// Baca body input
$rawInput = file_get_contents('php://input');
if (empty($rawInput)) {
    http_response_code(400);
    echo json_encode([
        'error' => [
            'message' => 'Request body kosong. Harap kirimkan payload JSON.'
        ]
    ]);
    exit();
}

// Validasi format JSON
$payload = json_decode($rawInput, true);
if (json_last_error() !== JSON_ERROR_NONE || !is_array($payload)) {
    http_response_code(400);
    echo json_encode([
        'error' => [
            'message' => 'Format payload JSON tidak valid.'
        ]
    ]);
    exit();
}

// Teruskan request ke OpenRouter via cURL
$ch = curl_init('https://openrouter.ai/api/v1/chat/completions');

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $rawInput,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey,
        'HTTP-Referer: https://incsmsociety.site',
        'X-Title: The Fellow Intellectual Society'
    ],
    CURLOPT_TIMEOUT        => 90,
    CURLOPT_CONNECTTIMEOUT => 15,
    CURLOPT_SSL_VERIFYPEER => true
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    $curlError = curl_error($ch);
    curl_close($ch);
    http_response_code(502);
    echo json_encode([
        'error' => [
            'message' => 'Gagal menghubungi server OpenRouter: ' . $curlError
        ]
    ]);
    exit();
}

curl_close($ch);

// Teruskan status code dan response langsung ke client
http_response_code($httpCode ?: 200);
echo $response;
