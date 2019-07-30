' lnk.vbs (c) 2018 Pedro Costa
' This code is licensed under GPL-3.0 license (see LICENSE for details)
option explicit

dim strFilepath, strLinkName, strLinkArgs, strLinkDes, strLinkCwd, strLinkIco, strLinkWin, strLinkHtk
strFilepath = Wscript.Arguments(0)
strLinkName = Wscript.Arguments(1)
strLinkArgs = Wscript.Arguments(2)
strLinkDes = Wscript.Arguments(3)
strLinkCwd = Wscript.Arguments(4)
strLinkIco = Wscript.Arguments(5)
strLinkWin = Wscript.Arguments(6)
strLinkHtk = Wscript.Arguments(7)

sub FileToLnk()
  dim objShell, strDesktopPath, objLink
  set objShell = CreateObject("WScript.Shell")
  strDesktopPath = objShell.SpecialFolders("Desktop")
  set objLink = objShell.CreateShortcut(strDesktopPath + "\" + strLinkName + ".lnk")
  objLink.Arguments = strLinkArgs
  objLink.Description = strLinkDes
  objLink.TargetPath = strFilepath
  objLink.WindowStyle = strLinkWin
  objLink.WorkingDirectory = strLinkCwd
  objLink.Hotkey = strLinkHtk
  objLink.Save
end sub

call FileToLnk()
