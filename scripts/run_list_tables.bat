@echo off
set PYTHONPATH=%cd%\backend
".venv\Scripts\python.exe" "%~dp0list_tables.py"
