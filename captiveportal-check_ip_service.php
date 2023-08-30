<?php

// Hedef URL
$TENANT_URL  = 'https://sb.poyrazteknoloji.com/';


$SERVICE_URI = 'api/v1/check-ip';

$url = $TENANT_URL . $SERVICE_URI;

// Gönderilecek veriler
$postData = array(
    'API_KEY' => 'G5MIJP5T6LdyGz_r-vkE_CLVRPr8g-MCec75J-4WdD0',
);

// cURL oturumunu başlatma
$ch = curl_init();

// cURL seçeneklerini ayarlama
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // SSL sertifikasını doğrulama (geçici çözüm, güvenlik açısından önerilmez)

$response = curl_exec($ch);

curl_close($ch);

echo $response;