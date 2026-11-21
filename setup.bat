@echo off
rem ------------------------------------------------------------
rem OptiFreight AI - Environment Setup and Verification Script
rem ------------------------------------------------------------

set "PROJECT_ROOT=%~dp0"
cd /d "%PROJECT_ROOT%"

echo ========================================================
echo OptiFreight AI - Environment Setup
echo ========================================================

rem 1. Check directory structure
if not exist "backend" (
    echo [ERROR] backend directory not found. Please run this script from the project root.
    exit /b 1
)

rem 2. Verify Python installation
where python >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found in PATH. Please install Python 3.10+ and add to PATH.
    exit /b 1
)

rem 3. Check Python version
python -c "import sys; sys.exit(0 if sys.version_info >= (3,10) else 1)"
if errorlevel 1 (
    echo [ERROR] Python version 3.10 or higher is required.
    exit /b 1
)

rem 4. Check or create virtual environment
if exist ".venv\Scripts\activate.bat" (
    echo [INFO] Existing virtual environment found in .venv.
    call "%PROJECT_ROOT%.venv\Scripts\activate.bat"
) else (
    echo [INFO] Creating virtual environment in .venv...
    python -m venv .venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment in .venv.
        exit /b 1
    )
    call "%PROJECT_ROOT%.venv\Scripts\activate.bat"
)
python -c "import sys; print('[INFO] Active Python Interpreter:', sys.executable)"

rem 5. Install / Verify dependencies
if not exist "requirements.txt" (
    echo [ERROR] requirements.txt not found at project root.
    exit /b 1
)

echo [INFO] Checking dependencies from requirements.txt...
python -m pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo [ERROR] Dependency installation/verification failed.
    exit /b 1
)

rem 6. Verify .env file
if not exist ".env" (
    if exist ".env.example" (
        echo [WARN] .env not found. Creating .env from .env.example...
        copy ".env.example" ".env" >nul
    ) else (
        echo [ERROR] .env file missing and .env.example not found.
        exit /b 1
    )
) else (
    echo [INFO] .env file verified.
)

rem 7. Database connectivity check
if exist "scripts\check_db.py" (
    python scripts\check_db.py
)

echo ========================================================
echo [SUCCESS] Environment setup and verification complete.
echo ========================================================
exit /b 0
