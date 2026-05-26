.PHONY: up down restart logs ps shell web-shell shell-db migrate revision test lint format clean

up:
	docker compose up -d --build

down:
	docker compose down

restart:
	docker compose restart api

logs:
	docker compose logs -f api

ps:
	docker compose ps

shell:
	docker compose exec api bash

web-shell:
	docker compose exec web sh

shell-db:
	docker compose exec db psql -U $${DB_USER:-queueless} -d $${DB_NAME:-queueless}

migrate:
	docker compose exec api alembic upgrade head

revision:
	@if [ -z "$(msg)" ]; then echo "Usage: make revision msg=\"description\""; exit 1; fi
	docker compose exec api alembic revision --autogenerate -m "$(msg)"

test:
	docker compose exec api pytest -v

lint:
	docker compose exec api ruff check app
	docker compose exec api mypy app

format:
	docker compose exec api ruff format app
	docker compose exec api ruff check --fix app

test-email:
	@if [ -z "$(TO)" ]; then echo "Usage: make test-email TO=you@example.com"; exit 1; fi
	docker compose exec api python -m scripts.send_test_email $(TO)

clean:
	docker compose down -v
