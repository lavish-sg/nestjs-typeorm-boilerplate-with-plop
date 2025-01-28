# NestJS TypeORM Boilerplate

This boilerplate project sets up a new NestJS application with TypeORM integration. It includes features to create dynamic CRUD operations and folder structures using entities.

## Features

- NestJS framework
- TypeORM integration
- Dynamic CRUD generation
- Organized folder structure
- Docker support

## Prerequisites

- Node.js (>= 18.18.0)
- npm
- Docker (optional, for containerized development)

## Getting Started

### Installation

1. **Clone the repository**:
    ```sh
    git clone <repository-url>
    cd <repository-directory>
    ```

2. **Install dependencies**:
    ```sh
    npm install
    ```

3. **Set up environment variables**:
    Copy the example environment file and update it with your configuration.
    ```sh
    cp .env.example .env
    ```

### Running the Application

1. **Start the application**:
    ```sh
    npm run start:dev
    ```

2. **Build the application**:
    ```sh
    npm run build
    ```

3. **Run tests**:
    ```sh
    npm run test
    ```

### Docker

1. **Build the Docker image**:
    ```sh
    docker-compose build
    ```

2. **Run the Docker container**:
    ```sh
    docker-compose up
    ```



## Dynamic CRUD and Folder Structure

This boilerplate includes a feature to dynamically generate CRUD operations and folder structures using entities. To create a new module with CRUD operations:

1. **Generate a new module**:
    ```sh
    npm run plop
    ```

2. Follow the prompts to create a new module with the desired entity name.
