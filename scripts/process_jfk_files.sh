#!/bin/bash

# Script to process JFK files using an Apple Shortcut in parallel
# This script iterates through all files in the jfk_text folder
# and runs the "JFK Files" shortcut on each file concurrently

# Set the directory containing the JFK files
JFK_DIR="./jfk_text"

# Maximum number of parallel processes to run
# Adjust this number based on your system's capabilities
MAX_PARALLEL=60

# Check if the directory exists
if [ ! -d "$JFK_DIR" ]; then
    echo "Error: Directory $JFK_DIR does not exist."
    exit 1
fi

# Count total files for progress reporting
total_files=$(ls "$JFK_DIR" | wc -l | tr -d ' ')
current=0
active_jobs=0

echo "Starting to process $total_files files from $JFK_DIR (max $MAX_PARALLEL parallel jobs)"
echo "----------------------------------------------------"

# Function to process a single file
process_file() {
    local file_path="$1"
    local filename=$(basename "$file_path")
    
    # Run the Apple Shortcut with the file as input
    shortcuts run "JFK Files" -i "$file_path" > /dev/null 2>&1
    
    # Signal completion for job tracking
    echo "Completed: $filename"
}

# Process each file
for file in "$JFK_DIR"/*; do
    if [ -f "$file" ]; then
        # Get the absolute path of the file
        file_path=$(realpath "$file")
        
        # Extract just the filename for display
        filename=$(basename "$file")
        
        # Increment counter
        ((current++))
        percentage=$((current * 100 / total_files))
        
        echo "[$percentage%] Starting: $filename"
        
        # Start process in background
        process_file "$file_path" &
        
        # Increment active jobs counter
        ((active_jobs++))
        
        # If we've reached max parallel jobs, wait for one to finish
        if [ $active_jobs -ge $MAX_PARALLEL ]; then
            wait -n  # Wait for any child process to exit
            ((active_jobs--))
        fi
    fi
done

# Wait for all remaining background jobs to complete
echo "Waiting for remaining jobs to complete..."
wait

echo "----------------------------------------------------"
echo "Completed processing $total_files files." 