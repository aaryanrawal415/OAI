@echo off
rem ------------------------------------------------------------
rem OptiFreight AI - Application Launcher Script
rem ------------------------------------------------------------

set "PROJECT_ROOT=%~dp0"
cd /d "%PROJECT_ROOT%"

echo ========================================================
echo Launching OptiFreight AI Backend Service
echo ========================================================

rem Ensure setup / dependencies are verified
call setup.bat
if errorlevel 1 (
    echo [ERROR] Setup check failed. Cannot launch backend.
    exit /b 1
)

rem Activate virtual environment if present
if exist ".venv\Scripts\activate.bat" (
    call "%PROJECT_ROOT%.venv\Scripts\activate.bat"
)

rem Add backend directory to PYTHONPATH
set "PYTHONPATH=%PROJECT_ROOT%backend;%PYTHONPATH%"

echo [INFO] Starting FastAPI / Uvicorn server on http://localhost:8000 ...
python -m uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000 --reload
if errorlevel 1 (
    echo [ERROR] Backend service stopped unexpectedly.
    exit /b 1
)

exit /b 0
