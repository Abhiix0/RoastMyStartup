# ==============================================================================
# RoastMyStartup — Developer Makefile
# ==============================================================================
SHELL := cmd.exe

# Variables
BACKEND_DIR = backend
PYTHON      = uv run python
UV          = uv
PORT        = 8000

.PHONY: help install dev test lint format check clean db-check db-stats reset-env

# Default target — shows help
help:
	@echo ""
	@echo "  RoastMyStartup — Developer Commands"
	@echo ""
	@echo "  Setup"
	@echo "    make install        Install all Python dependencies via uv"
	@echo "    make reset-env      Delete .venv and reinstall from scratch"
	@echo ""
	@echo "  Development"
	@echo "    make dev            Start FastAPI backend in reload mode"
	@echo "    make frontend       Start Vite frontend dev server"
	@echo ""
	@echo "  Code Quality"
	@echo "    make lint           Run ruff linter (check only)"
	@echo "    make format         Run ruff formatter (auto-fix)"
	@echo "    make check          Run lint + format check (CI mode)"
	@echo ""
	@echo "  Testing"
	@echo "    make test           Run all tests"
	@echo "    make test-gemini    Run Gemini API smoke tests"
	@echo "    make test-supabase  Run Supabase integration tests"
	@echo ""
	@echo "  Database"
	@echo "    make db-check       Verify Supabase connection"
	@echo "    make db-stats       Print roast statistics from DB"
	@echo ""

# ── Setup ──────────────────────────────────────────────────────────────────────

install:
	@echo "→ Installing dependencies..."
	cd $(BACKEND_DIR) && $(UV) sync
	@echo "✓ Dependencies installed"

reset-env:
	@echo "→ Resetting virtual environment..."
	cd $(BACKEND_DIR) && if exist .venv rmdir /s /q .venv
	cd $(BACKEND_DIR) && $(UV) sync
	@echo "✓ Environment reset"

# ── Development ────────────────────────────────────────────────────────────────

dev:
	@echo "→ Starting backend on port $(PORT)..."
	cd $(BACKEND_DIR) && $(UV) run uvicorn app.main:app --reload --port $(PORT)

frontend:
	@echo "→ Starting frontend dev server..."
	npm run dev

# ── Code Quality ───────────────────────────────────────────────────────────────

lint:
	cd $(BACKEND_DIR) && $(UV) run ruff check .

format:
	cd $(BACKEND_DIR) && $(UV) run ruff format .
	cd $(BACKEND_DIR) && $(UV) run ruff check --fix .

check:
	@echo "→ Running lint + format check (no auto-fix)..."
	cd $(BACKEND_DIR) && $(UV) run ruff check .
	cd $(BACKEND_DIR) && $(UV) run ruff format --check .
	@echo "✓ Code quality checks passed"

# ── Testing ────────────────────────────────────────────────────────────────────

test:
	cd $(BACKEND_DIR) && $(UV) run pytest tests/ -v

test-gemini:
	cd $(BACKEND_DIR) && $(UV) run python tests/test_gemini.py

test-supabase:
	cd $(BACKEND_DIR) && $(UV) run python tests/test_supabase_integration.py

test-api:
	cd $(BACKEND_DIR) && $(UV) run pytest tests/test_api.py -v

# ── Database ───────────────────────────────────────────────────────────────────

db-check:
	@echo "→ Checking Supabase connection..."
	cd $(BACKEND_DIR) && $(UV) run python -c \
		"from app.services.db_service import db_service; \
		result = db_service.health_check(); \
		print('✓ Connected' if result else '✗ Connection failed')"

db-stats:
	@echo "→ Fetching roast statistics..."
	cd $(BACKEND_DIR) && $(UV) run python -c \
		"import json; from app.services.db_service import db_service; \
		stats = db_service.get_roast_stats(); \
		print(json.dumps(stats, indent=2) if stats else 'No stats available')"

# ── Utilities ──────────────────────────────────────────────────────────────────

clean:
	@echo "→ Cleaning Python cache files..."
	for /r . %%d in (__pycache__) do @if exist "%%d" rmdir /s /q "%%d" 2>nul
	for /r . %%f in (*.pyc) do @del /q "%%f" 2>nul
	@echo "✓ Cleaned Python cache files"