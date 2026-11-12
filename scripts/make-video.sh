#!/usr/bin/env bash
# Build the demo video from the Playwright recording.
set -euo pipefail

FF=$(python -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")
FONT="C:/Windows/Fonts/segoeui.ttf"
RAW=$(ls -t video/raw/*.webm 2>/dev/null | head -1)
[ -n "$RAW" ] || { echo "no recording in video/raw"; exit 1; }
mkdir -p video

STYLE="fontfile=${FONT}:fontsize=34:fontcolor=white:borderw=2:bordercolor=black@0.7:box=1:boxcolor=black@0.45:boxborderw=16:x=(w-text_w)/2:y=h-150"

caps=(
  "1.2|7.8|Every developer has a graveyard of abandoned projects."
  "9.2|14.2|Necropolis builds it from your public GitHub."
  "14.2|18.8|Each tombstone is a repository. The older it is the deeper it lies."
  "19.4|28.2|An autopsy of what killed it and how long it has been gone."
  "28.6|33.6|Revival odds and three steps to raise them."
  "33.6|37.8|Or bury it properly with a downloadable obituary."
  "43.6|48.8|Necropolis. Walk yours."
)

V="scale=1920:1080,fade=t=in:st=0:d=0.6"
for c in "${caps[@]}"; do
  IFS='|' read -r a b text <<< "$c"
  V="${V},drawtext=${STYLE}:text='${text}':enable='between(t,${a},${b})'"
done
V="${V},fade=t=out:st=48.9:d=0.9"

"$FF" -y -i "$RAW" \
  -f lavfi -i "aevalsrc=0.035*sin(2*PI*110*t)+0.02*sin(2*PI*164.81*t)+0.010*(random(0)*2-1):s=44100:d=50" \
  -filter_complex "[0:v]${V}[v];[1:a]lowpass=f=700,volume=0.7[a]" \
  -map "[v]" -map "[a]" -t 50 \
  -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p \
  -c:a aac -b:a 96k -movflags +faststart \
  video/necropolis-demo.mp4

echo "video/necropolis-demo.mp4 written"
