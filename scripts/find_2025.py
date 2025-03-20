import os
import shutil

# Define the source directory (jfk_text folder)
source_dir = "jfk_text"

# Define the destination directory (2025 folder at the top of the project)
dest_dir = "2025"

# Create the destination directory if it doesn't exist
if not os.path.exists(dest_dir):
    os.makedirs(dest_dir)
    print(f"Created directory: {dest_dir}")

# Initialize counters
files_checked = 0
files_copied = 0

# Walk through all files in the source directory
for root, dirs, files in os.walk(source_dir):
    for file in files:
        # Check if the file is a .md file
        if file.endswith(".md"):
            files_checked += 1
            file_path = os.path.join(root, file)
            
            # Open and read the file
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                    # Check if the file contains the string "2025"
                    if "2025" in content:
                        # Copy the file to the destination directory
                        shutil.copy2(file_path, os.path.join(dest_dir, file))
                        files_copied += 1
                        print(f"Copied: {file}")
            except Exception as e:
                print(f"Error processing {file}: {e}")

print(f"\nScanned {files_checked} files")
print(f"Found and copied {files_copied} files containing '2025' to the '{dest_dir}' directory") 