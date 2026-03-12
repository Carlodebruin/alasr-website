<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$channelId = $_GET['channel_id'] ?? 'UCdv01sZQCL34l0n6HBQTBlQ';
$rssUrl = 'https://www.youtube.com/feeds/videos.xml?channel_id=' . urlencode($channelId);

// Full browser headers - community confirmed fix for YouTube server-side 404
$headers = [
    'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language: en-US,en;q=0.9',
    'Accept-Encoding: gzip, deflate, br',
    'Connection: keep-alive',
    'Referer: https://www.youtube.com/',
    'Cache-Control: no-cache',
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $rssUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_ENCODING, ''); // Handle gzip/deflate automatically
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$xmlContent = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200 || !$xmlContent) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to fetch YouTube feed. HTTP Code: ' . $httpCode]);
    exit;
}

// Parse the XML feed
try {
    $xml = @simplexml_load_string($xmlContent, 'SimpleXMLElement', LIBXML_NOCDATA);
    if ($xml === false) {
        throw new Exception("Could not parse XML");
    }

    $items = [];
    foreach ($xml->entry as $entry) {
        $ytNs   = $entry->children('http://www.youtube.com/xml/schemas/2015');
        $mediaNs = $entry->children('http://search.yahoo.com/mrss/');

        $videoId = (string)$ytNs->videoId;
        if (!$videoId) {
            // Fallback: extract from urn:youtube:VIDEO_ID
            $parts   = explode(':', (string)$entry->id);
            $videoId = end($parts);
        }

        $thumbnail = isset($mediaNs->group->thumbnail)
            ? (string)$mediaNs->group->thumbnail->attributes()->url
            : "https://i.ytimg.com/vi/{$videoId}/mqdefault.jpg";

        $items[] = [
            'id'        => $videoId,
            'title'     => (string)$entry->title,
            'thumbnail' => $thumbnail,
            'link'      => (string)$entry->link->attributes()->href,
            'published' => (string)$entry->published,
        ];
    }

    echo json_encode(['status' => 'ok', 'items' => array_slice($items, 0, 10)]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Parse error: ' . $e->getMessage()]);
}
