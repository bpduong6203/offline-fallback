# Lossless crops of the user-provided transparent PNG. No redraw or resampling.
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
public static class TeaOwnerCrop {
 public static void Save(string source, string destination, int x, int y, int width, int height) {
  using (var image = new Bitmap(source))
  using (var crop = image.Clone(new Rectangle(x,y,width,height),PixelFormat.Format32bppArgb)) {
   crop.Save(destination,ImageFormat.Png);
   using(var saved=new Bitmap(destination)) {
    int transparent=0;
    for(int cy=0;cy<height;cy++) for(int cx=0;cx<width;cx++) {
     var pixel=saved.GetPixel(cx,cy);
     if(pixel.ToArgb()!=image.GetPixel(x+cx,y+cy).ToArgb())throw new Exception("Crop changed source pixels");
     if(pixel.A==0)transparent++;
    }
    if(transparent==0)throw new Exception("Sprite has no transparency");
    Console.WriteLine(destination+" | "+width+"x"+height+" | source RGBA verified; "+transparent+" transparent pixels");
   }
  }
 }
}
'@
$teaAssetDirectory = Join-Path $PSScriptRoot '../assets/tea-shop'
$teaOwnerSource = Join-Path $teaAssetDirectory 'owners-source.png'
[TeaOwnerCrop]::Save($teaOwnerSource,(Join-Path $teaAssetDirectory 'owner-male.png'),248,16,356,1108)
[TeaOwnerCrop]::Save($teaOwnerSource,(Join-Path $teaAssetDirectory 'owner-female.png'),748,80,356,1044)
