.PHONY: help install dev build start test lint migrate seed prisma-studio docker-up docker-down

help:
	@echo "Available commands:"
	@echo "  make install        - Install dependencies"
	@echo "  make dev            - Run in development mode"
	@echo "  make build          - Build for production"
	@echo "  make start          - Start production server"
	@echo "  make test           - Run tests"
	@echo "  make test-e2e       - Run e2e tests"
	@echo "  make lint           - Run linter"
	@echo "  make migrate        - Run database migrations"
	@echo "  make migrate-prod   - Run migrations in production"
	@echo "  make seed           - Seed database"
	@echo "  make prisma-studio  - Open Prisma Studio"
	@echo "  make docker-up      - Start Docker services"
	@echo "  make docker-down    - Stop Docker services"
	@echo "  make docker-logs    - View application logs"

install:
	npm install

dev:
	npm run start:dev

build:
	npm run build

start:
	npm run start:prod

test:
	npm run test

test-e2e:
	npm run test:e2e

lint:
	npm run lint

migrate:
	npx prisma migrate dev

migrate-prod:
	npx prisma migrate deploy

seed:
	npx ts-node prisma/seed.ts

prisma-studio:
	npx prisma studio

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

openapi:
	curl http://localhost:3000/api-json > openapi.json

