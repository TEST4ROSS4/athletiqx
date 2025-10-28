<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | This file is used to configure CORS settings for your Laravel application.
    | These settings determine how your API responds to cross-origin requests.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'], // Accept all HTTP methods (GET, POST, PUT, DELETE, etc.)

    'allowed_origins' => ['*'], // Allow all origins (you can restrict to your Expo dev URL if needed)

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'], // Accept all headers (including Authorization, Content-Type)

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false, // Set to true if you're using cookies or sessions across domains

];