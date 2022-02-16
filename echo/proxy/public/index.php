<?php

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/*
|--------------------------------------------------------------------------
| Create The Application
|--------------------------------------------------------------------------
|
| First we need to get an application instance. This creates an instance
| of the application / container and bootstraps the application so it
| is ready to receive HTTP / Console requests from the environment.
|
*/

require_once __DIR__ . '/../vendor/autoload.php';

date_default_timezone_set(env('APP_TIMEZONE', 'UTC'));

$app = new Laravel\Lumen\Application(
    dirname(__DIR__)
);

$app->configure('app');


$closure = function (Request $request): JsonResponse {
    $hexJsonData = bin2hex(
        json_encode([
            'path' => '/' . ltrim($request->getRequestUri(), '/'),
            'method' => strtoupper($request->getMethod()),
            'payload' => $request->all(),
            'headers' => $request->header(),
        ], JSON_THROW_ON_ERROR)
    );

    $command = 'docker exec echo-hardhat-1 npx hardhat --network localhost echo:addInput --input "0x' . $hexJsonData . '"';

    $commandOutput = explode(' ', Str::after(shell_exec($command), 'to epoch '));

    $data = [
        'epoch' => (int)$commandOutput[0],
        'timestamp' => Str::before($commandOutput[2], ','),
        'signer' => Str::before($commandOutput[4], ','),
        'tx' => Str::before($commandOutput[6], ')'),
    ];

    return response()->json($data);
};

$pattern = '/{any:.*}';

$app->router->get($pattern, $closure);
$app->router->post($pattern, $closure);
$app->router->put($pattern, $closure);
$app->router->patch($pattern, $closure);
$app->router->delete($pattern, $closure);

$app->run();
