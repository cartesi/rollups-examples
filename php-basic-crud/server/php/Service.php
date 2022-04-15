<?php

require 'controllers/UserController.php';

use Medoo\Medoo;

class Service
{
    private string $path;
    private string $method;
    private ?array $payload;

    public function __construct(string $path, string $method, ?array $payload)
    {
        $this->path = strtolower(ltrim($path, '/'));
        $this->method = strtolower($method);
        $this->payload = $payload;
    }

    public function handle(Medoo $db): ?array
    {
        switch ($this->path) {
            case 'users';
                return (new UserController($db))->{$this->method}($this->path, $this->payload);
            default:
                return null;
        }
    }
}
