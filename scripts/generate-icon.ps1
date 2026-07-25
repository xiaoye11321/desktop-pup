Add-Type -AssemblyName System.Drawing

$size = 512
$bitmap = New-Object System.Drawing.Bitmap($size, $size)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.Clear([System.Drawing.Color]::Transparent)

function New-Brush([string]$color) {
  return New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml($color))
}

function New-Pen([string]$color, [float]$width) {
  $pen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml($color), $width)
  $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  return $pen
}

function New-RoundedRectangle([float]$x, [float]$y, [float]$width, [float]$height, [float]$radius) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $radius * 2
  $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
  $path.AddArc($x + $width - $diameter, $y, $diameter, $diameter, 270, 90)
  $path.AddArc($x + $width - $diameter, $y + $height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($x, $y + $height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

$background = New-Brush '#FFF4DF'
$fur = New-Brush '#F8C77E'
$ear = New-Brush '#BD7148'
$muzzle = New-Brush '#FFF2DB'
$dark = New-Brush '#3F2D28'
$tongue = New-Brush '#ED8B86'
$blush = New-Brush '#EA8B7B'
$outline = New-Pen '#3F2D28' 22
$mouthPen = New-Pen '#3F2D28' 13

$backgroundPath = New-RoundedRectangle 8 8 496 496 104
$graphics.FillPath($background, $backgroundPath)

$leftEar = New-Object System.Drawing.Drawing2D.GraphicsPath
$leftEar.AddBezier(131, 209, 89, 130, 117, 73, 169, 65)
$leftEar.AddBezier(169, 65, 213, 111, 211, 167, 190, 211)
$leftEar.CloseFigure()
$graphics.FillPath($ear, $leftEar)
$graphics.DrawPath($outline, $leftEar)

$rightEar = New-Object System.Drawing.Drawing2D.GraphicsPath
$rightEar.AddBezier(381, 209, 423, 130, 395, 73, 343, 65)
$rightEar.AddBezier(343, 65, 299, 111, 301, 167, 322, 211)
$rightEar.CloseFigure()
$graphics.FillPath($ear, $rightEar)
$graphics.DrawPath($outline, $rightEar)

$head = New-RoundedRectangle 104 91 304 356 126
$graphics.FillPath($fur, $head)
$graphics.DrawPath($outline, $head)

$graphics.FillEllipse($dark, 177, 233, 38, 50)
$graphics.FillEllipse($dark, 297, 233, 38, 50)
$graphics.FillEllipse($muzzle, 174, 286, 164, 128)
$graphics.FillEllipse($dark, 229, 297, 54, 40)
$graphics.DrawArc($mouthPen, 196, 315, 60, 70, 5, 95)
$graphics.DrawArc($mouthPen, 256, 315, 60, 70, 80, 95)

$tonguePath = New-Object System.Drawing.Drawing2D.GraphicsPath
$tonguePath.AddBezier(220, 372, 234, 421, 278, 429, 292, 372)
$tonguePath.AddBezier(292, 372, 269, 382, 243, 382, 220, 372)
$tonguePath.CloseFigure()
$graphics.FillPath($tongue, $tonguePath)
$graphics.DrawPath((New-Pen '#3F2D28' 10), $tonguePath)

$graphics.FillEllipse($blush, 132, 317, 52, 28)
$graphics.FillEllipse($blush, 328, 317, 52, 28)

$outputPath = Join-Path $PSScriptRoot '..\build\icon.png'
$bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$backgroundPath.Dispose()
$leftEar.Dispose()
$rightEar.Dispose()
$head.Dispose()
$tonguePath.Dispose()
$background.Dispose()
$fur.Dispose()
$ear.Dispose()
$muzzle.Dispose()
$dark.Dispose()
$tongue.Dispose()
$blush.Dispose()
$outline.Dispose()
$mouthPen.Dispose()
$graphics.Dispose()
$bitmap.Dispose()
