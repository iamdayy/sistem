<?php

use Illuminate\Support\Facades\Route;

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | This configuration controls which origins may access the API from a
    | browser. The frontend (Next.js) runs on http://localhost:3000 while
    | the API runs on http://127.0.0.1:8000, so cross-origin requests must
    | be explicitly permitted.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'broadcasting/auth'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        '*'
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['Authorization', 'Content-Type'],

    'max_age' => 0,

    'supports_credentials' => true,

];
