<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reproductor de vídeo</title>
  <link rel="stylesheet" type="text/css" href="style.css">
</head>
<body>
  <?php
    $video = $_GET['video'];
    if ($video == 1) {
      $src = "video2.mp4";
    } else if ($video == 2) {
      $src = "video.mp4";
    } else if ($video == 3) {
      $src = "video3.mp4";
    }
  ?>

  <video controls>
    <source src="<?php echo $src; ?>" type="video/mp4">
    Tu navegador no soporta HTML5 video.
  </video>
</body>
</html>
