<?php
require_once '../config.php';

// Cek method
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$url = isset($_GET['url']) ? trim($_GET['url']) : '';

if (empty($url) || !filter_var($url, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'URL tidak valid']);
    exit;
}

// Extract domain
$parsed_url = parse_url($url);
$domain = isset($parsed_url['host']) ? str_replace('www.', '', $parsed_url['host']) : '';

// Function to fetch HTML content
function fetch_html($url) {
    // Shared hosting usually supports cURL.
    if (function_exists('curl_version')) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_MAXREDIRS, 5);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'); // Pretend to be a real browser
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $html = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($http_code >= 200 && $http_code < 400 && $html) {
            return $html;
        }
    }
    
    // Fallback if cURL fails or doesn't exist
    $options = [
        "http" => [
            "header" => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36\r\n",
            "timeout" => 10
        ]
    ];
    $context = stream_context_create($options);
    $html = @file_get_contents($url, false, $context);
    
    return $html;
}

$html = fetch_html($url);

if (!$html) {
    echo json_encode([
        'success' => false, 
        'message' => 'Gagal memuat pratinjau tautan. Server menolak atau website tidak dapat dijangkau.',
        'data' => [
            'url' => $url,
            'domain' => $domain
        ]
    ]);
    exit;
}

// Parse DOM to get Open Graph Tags
libxml_use_internal_errors(true);
$doc = new DOMDocument();
@$doc->loadHTML($html);
libxml_clear_errors();

$tags = $doc->getElementsByTagName('meta');

$metadata = [
    'title' => '',
    'description' => '',
    'image' => '',
    'domain' => $domain,
    'url' => $url
];

// Fallback to title tag if no og:title
$titleTags = $doc->getElementsByTagName('title');
if ($titleTags->length > 0) {
    $metadata['title'] = $titleTags->item(0)->nodeValue;
}

foreach ($tags as $tag) {
    $property = $tag->getAttribute('property');
    $name = $tag->getAttribute('name');
    $content = $tag->getAttribute('content');

    // Title
    if ($property === 'og:title' || $property === 'twitter:title') {
        $metadata['title'] = $content;
    }

    // Description
    if ($property === 'og:description' || $property === 'twitter:description' || $name === 'description') {
        $metadata['description'] = $content;
    }

    // Image
    if ($property === 'og:image' || $property === 'twitter:image' || $property === 'og:image:url') {
        // Only use image if we haven't found one yet or override
        if (empty($metadata['image'])) {
            $metadata['image'] = $content;
        }
    }
}

// Normalize relative image URLs
if (!empty($metadata['image']) && !filter_var($metadata['image'], FILTER_VALIDATE_URL)) {
    if (strpos($metadata['image'], '//') === 0) {
        $metadata['image'] = (isset($parsed_url['scheme']) ? $parsed_url['scheme'] : 'https') . ':' . $metadata['image'];
    } elseif (strpos($metadata['image'], '/') === 0) {
        $metadata['image'] = (isset($parsed_url['scheme']) ? $parsed_url['scheme'] : 'https') . '://' . (isset($parsed_url['host']) ? $parsed_url['host'] : '') . $metadata['image'];
    } else {
        // relative to current path is harder, just stick to domain base
        $metadata['image'] = (isset($parsed_url['scheme']) ? $parsed_url['scheme'] : 'https') . '://' . (isset($parsed_url['host']) ? $parsed_url['host'] : '') . '/' . $metadata['image'];
    }
}

echo json_encode([
    'success' => true,
    'message' => 'Metadata ditemukan',
    'data' => $metadata
]);
