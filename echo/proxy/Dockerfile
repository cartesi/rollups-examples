FROM php:8.1.0-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    docker.io

RUN docker-php-ext-install bcmath

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

CMD composer install --no-interaction --no-scripts --prefer-dist && php -S 0.0.0.0:8000 -t public

WORKDIR /var/www

EXPOSE 8000
