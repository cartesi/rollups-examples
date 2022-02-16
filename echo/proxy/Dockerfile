FROM php:8.1.0-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

CMD composer install --no-interaction --no-scripts --prefer-dist

WORKDIR /var/www
