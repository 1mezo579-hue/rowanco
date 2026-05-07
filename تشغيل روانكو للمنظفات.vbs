Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c internal_start.bat", 0, False
Set WshShell = Nothing
