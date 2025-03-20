import os

# Define the source directory (jfk_text folder)
source_dir = "jfk_text"

# Initialize counters
files_checked = 0
files_removed = 0

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
                    
                    # Check if the file contains the string "1992"
                    if "1992" in content:
                        # Remove the file from the source directory
                        os.remove(file_path)
                        files_removed += 1
                        print(f"Removed: {file}")
            except Exception as e:
                print(f"Error processing {file}: {e}")

print(f"\nScanned {files_checked} files")
print(f"Removed {files_removed} files containing '1992' from the '{source_dir}' directory") 