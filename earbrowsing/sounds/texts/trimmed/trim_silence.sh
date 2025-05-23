#!/bin/bash

# Customizable parameters (adjust these)
THRESHOLD_DB="-70dB"       # Lower = more sensitive (try -50dB to -63dB)
SILENCE_DURATION="0.01"     # Seconds of silence required for trimming (0.1-0.5)
DETECTION_METHOD="peak"    # Detection mode (peak or rms)
OUTPUT_DIR="trimmed"       # Output folder

# Create output directory
mkdir -p "$OUTPUT_DIR"

for file in *.mp3; do
    ffmpeg -y -i "$file" \
    -af "silenceremove=
        start_periods=1:
        start_threshold=$THRESHOLD_DB:
        start_silence=$SILENCE_DURATION:
        stop_periods=1:
        stop_threshold=$THRESHOLD_DB:
        stop_silence=$SILENCE_DURATION:
        detection=$DETECTION_METHOD" \
    "$OUTPUT_DIR/$file"
done
