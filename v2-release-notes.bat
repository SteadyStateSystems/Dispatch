@echo off
setlocal

echo ===== Dispatch V2 Release Notes (Recent Commits) =====
git -C C:\Users\asshole\Desktop\Project-Management log --oneline --decorate -n 15

echo ===== End =====
