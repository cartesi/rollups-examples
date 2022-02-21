<?php

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Web3\ValueObjects\Transaction;
use Web3\Web3;

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


$web3 = new Web3('http://hardhat:8545');

$closure = function (Request $request) use ($web3): JsonResponse {
    $hexJsonData = bin2hex(
        json_encode([
            'path' => '/' . ltrim($request->getRequestUri(), '/'),
            'method' => strtoupper($request->getMethod()),
            'payload' => $request->all(),
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

    return response()->json([
        'command_result' => $data,
        'transaction' => $web3->eth()->getTransactionByHash($data['tx']),
        'transaction_receipt' => $web3->eth()->getTransactionReceipt($data['tx']),
    ]);
};

$pattern = '/{any:.*}';

$app->router->get($pattern, $closure);
$app->router->post($pattern, $closure);
$app->router->put($pattern, $closure);
$app->router->patch($pattern, $closure);
$app->router->delete($pattern, $closure);

$app->run();
