@echo off
echo Starting SheRide Safe Server...
echo Access the App at: http://localhost:8000/index.html
echo Access Admin Portal at: http://localhost:8000/admin.html
echo Access Police Emergency Dispatch at: http://localhost:8000/police.html
python -m http.server 8000
pause
