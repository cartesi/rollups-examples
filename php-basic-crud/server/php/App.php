<?php

require 'Service.php';
require 'Medoo.php';
require 'curl/cURL.php';

use anlutro\cURL\cURL;
use Medoo\Medoo;

class App
{
    private Medoo $db;
    private cURL $cURL;

    public function __construct()
    {
        $this->setupDb();
        $this->cURL = new cURL();
    }

    public function handleAdvance(?array $data): void
    {
        [
            'path' => $path,
            'method' => $method,
            'payload' => $payload,
        ] = $data;

        $result = (new Service($path, $method, $payload))->handle($this->db);

        if (! empty($result)) {
            $this->sendNotice($result);
        }
    }

    public function handleInspect(array $query): void
    {
        return; // TODO
    }

    private function sendNotice(array $result): void
    {
        $this->cURL->jsonPost('http://127.0.0.1:5004/notice', [
            'payload' => '0x' . bin2hex(json_encode($result, JSON_THROW_ON_ERROR)),
        ]);
    }

    private function setupDb()
    {
        $this->db = new Medoo([
            'type' => 'sqlite',
            'database' => '../database.db',
            'error' => PDO::ERRMODE_EXCEPTION,
        ]);

        $this->db->create('users', [
            'id' => [
                'INTEGER',
                'NOT NULL',
                'PRIMARY KEY',
                'AUTOINCREMENT',
            ],
            'name' => [
                'VARCHAR(255)',
                'NOT NULL'
            ],
            'email' => [
                'VARCHAR(255)',
                'NOT NULL'
            ],
        ]);

        $this->db->create('tasks', [
            'id' => [
                'INTEGER',
                'NOT NULL',
                'PRIMARY KEY',
                'AUTOINCREMENT',
            ],
            'title' => [
                'VARCHAR(255)',
                'NOT NULL'
            ],
            'description' => [
                'TEXT',
            ],
        ]);
    }

    public function __destruct()
    {
        $this->cURL->jsonPost('http://127.0.0.1:5004/finish', [
            'status' => 'accept',
        ]);
    }
}
