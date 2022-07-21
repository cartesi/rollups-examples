<?php

require 'Router.php';
require 'App.php';

use Router\Router;

$router = new Router();

$app = new App();

$router->post('/advance', function () use ($app) {
    http_response_code(202);

    $payload = json_decode(
        file_get_contents('php://input'),
        true,
        512,
        JSON_THROW_ON_ERROR
    );

    $data = null;

    if (isset($payload['payload'])) {
        $data = json_decode(
            hex2bin(
                ltrim($payload['payload'], '0x')
            ),
            true,
            512,
            JSON_THROW_ON_ERROR
        );
    }

    $app->handleAdvance($data);
});

$router->get('/inspect', function () use ($app) {
    $app->handleInspect($_GET);
});

$router->run();

