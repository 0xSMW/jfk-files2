import os
import hashlib
from datetime import datetime
from tqdm import tqdm

# Helper function to convert bytes to human-readable size
def human_readable_size(size):
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size < 1024:
            return f"{size:.1f}{unit}"
        size /= 1024

# Helper function to calculate MD5 hash of a file
def calculate_md5(file_path):
    hash_md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

# Define directory and output file
documents_dir = "./documents"
output_file = "duplicate_files.md"

# Write header to output file
with open(output_file, "w") as f:
    f.write("# Duplicate Files Report\n")
    f.write(f"Generated on: {datetime.now()}\n\n")
    f.write("| File Hash | File Size | Duplicate Files |\n")
    f.write("|-----------|-----------|----------------|\n")

# Collect all file paths, excluding hidden paths and .DS_Store
file_paths = []
for root, dirs, files in os.walk(documents_dir):
    # Skip hidden directories
    dirs[:] = [d for d in dirs if not d.startswith('.')]
    for file in files:
        # Skip hidden files and .DS_Store
        if not file.startswith('.') and file != ".DS_Store":
            file_paths.append(os.path.join(root, file))

print(f"Found {len(file_paths)} files to process.")

# Process files and group by hash with progress updates
hash_to_data = {}
for file_path in tqdm(file_paths, desc="Processing files"):
    hash_value = calculate_md5(file_path)
    size = human_readable_size(os.path.getsize(file_path))
    if hash_value not in hash_to_data:
        hash_to_data[hash_value] = (size, [file_path])
    else:
        hash_to_data[hash_value][1].append(file_path)

# Write duplicate entries to output file
with open(output_file, "a") as f:
    for hash_value in sorted(hash_to_data):
        size, files = hash_to_data[hash_value]
        if len(files) > 1:  # Only include entries with duplicates
            sorted_files = sorted(files)
            files_str = "<br>".join(sorted_files)
            f.write(f"| {hash_value} | {size} | {files_str} |\n")

print(f"Duplicate file analysis complete. Results saved to {output_file}")