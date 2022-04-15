<?php

use Medoo\Medoo;

class UserController
{
    private Medoo $db;

    public function __construct(Medoo $db)
    {
        $this->db = $db;
    }

    public function get(string $path, ?array $payload): ?array
    {
        /**
         * TODO
         */

        return null;
    }

    public function post(string $path, ?array $payload): ?array
    {
        if (empty($payload['name']) || empty($payload['email'])) {
            return null;
        }

        $this->db->insert('users', [
            'name' => $payload['name'],
            'email' => $payload['email'],
        ]);

        $user = $this->db->select('users', '*', [
            'id' => $this->db->id(),
        ]);

        return $user[0] ?? null;
    }

    public function put(string $path, ?array $payload): ?array
    {
        /**
         * TODO
         */

        return null;
    }

    public function patch(string $path, ?array $payload): ?array
    {
        /**
         * TODO
         */

        return null;
    }

    public function delete(string $path, ?array $payload): ?array
    {
        /**
         * TODO
         */

        return null;
    }
}
