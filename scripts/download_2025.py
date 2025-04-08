
import os
import requests
from urllib.parse import urljoin
from concurrent.futures import ThreadPoolExecutor
import re

def download_file(url, folder):
    try:
        filename = url.split('/')[-1]
        filepath = os.path.join(folder, filename)
        
        if os.path.exists(filepath):
            print(f"File {filename} already exists, skipping...")
            return
            
        response = requests.get(url)
        response.raise_for_status()
        
        with open(filepath, 'wb') as f:
            f.write(response.content)
        print(f"Downloaded {filename}")
    except Exception as e:
        print(f"Error downloading {url}: {e}")

def main():
    # Create downloads folder
    download_folder = "/Users/stephenwalker/Code/ecosystem/jfk-files/.documents/2025"
    if not os.path.exists(download_folder):
        os.makedirs(download_folder)

    # Base URL for the files
    base_url = "https://www.archives.gov"
    
    # Extract file paths using regex
    pattern = r'href="(/files/research/jfk/releases/2025/0318/.*?\.pdf)"'
    
    with open('links_2025.txt', 'r') as f:
        content = f.read()
        
    file_paths = re.findall(pattern, content)
    
    # Convert relative paths to full URLs
    urls = [urljoin(base_url, path) for path in file_paths]
    
    print(f"Found {len(urls)} files to download")
    
    # Download files using thread pool
    with ThreadPoolExecutor(max_workers=5) as executor:
        executor.map(lambda url: download_file(url, download_folder), urls)

if __name__ == "__main__":
    main()
