
import os
import base64
import concurrent.futures
import time
from google import genai
from google.genai import types
from PyPDF2 import PdfReader
from random import uniform

def convert_pdf_to_markdown(pdf_path, retries=3, initial_delay=1):
    try:
        # Extract filename without extension
        filename = os.path.splitext(os.path.basename(pdf_path))[0]
        output_path = os.path.join('/Users/stephenwalker/Code/ecosystem/jfk-files/md/2025', f'{filename}.md')

        # Skip if already converted
        if os.path.exists(output_path):
            print(f"Skipping {filename} - already converted")
            return

        client = genai.Client(
             api_key=os.environ.get("GEMINI_API_KEY"),
        )

        for attempt in range(retries):
            try:
                # Upload the PDF file
                uploaded_file = client.files.upload(file=pdf_path)

                model = "gemini-2.0-flash"
                contents = [
                    types.Content(
                        role="user",
                        parts=[
                            types.Part.from_uri(
                                file_uri=uploaded_file.uri,
                                mime_type=uploaded_file.mime_type,
                            ),
                            types.Part.from_text(text="convert this into markdown file, just respond with the markdown without code blocks or saying anything. BE CAREFUL TO INCLUDE ALL OF THE ORIGINAL TEXT FROM THE DOCUMENT AND STRUCTURE THE FORMATTING in the file to make it as close to the original layout as possible."),
                        ],
                    ),
                ]

                generate_content_config = types.GenerateContentConfig(
                    temperature=1,
                    top_p=0.95,
                    top_k=40,
                    max_output_tokens=8192,
                    response_mime_type="text/plain",
                )

                # Create jfk_text directory if it doesn't exist
                os.makedirs('jfk_text', exist_ok=True)

                # Process and collect the response
                full_response = ""
                for chunk in client.models.generate_content_stream(
                    model=model,
                    contents=contents,
                    config=generate_content_config,
                ):
                    full_response += chunk.text

                # Only write if response is not empty
                if full_response.strip():
                    with open(output_path, 'w', encoding='utf-8') as f:
                        f.write(full_response)
                    print(f"Converted {filename}")
                else:
                    print(f"Skipping {filename} - empty response")
                    raise Exception("Empty response from Gemini")
                return

            except Exception as e:
                if attempt < retries - 1:
                    delay = initial_delay * (2 ** attempt)  # Exponential backoff
                    jitter = uniform(0, 0.1 * delay)  # Add some randomness
                    time.sleep(delay + jitter)
                    print(f"Retrying {filename} after error: {e}")
                else:
                    print(f"Failed to process {filename} after {retries} attempts: {e}")
                    log_failed_file(filename)  # Log the failed file
                    return

            # Rate limiting: wait to ensure only 10 requests per minute
            time.sleep(6)  # 60 seconds / 10 requests = 6 seconds per request

    except Exception as e:
        print(f"Error processing {pdf_path}: {e}")
        log_failed_file(os.path.basename(pdf_path))  # Log the failed file
        import traceback
        traceback.print_exc()

def log_failed_file(filename):
    with open('not_processed.md', 'a', encoding='utf-8') as f:
        f.write(f"{filename}\n")

def main():
    # Get list of PDF files from the new path
    pdf_dir = "/Users/stephenwalker/Code/ecosystem/jfk-files/.documents/2025"
    pdf_files = [
        os.path.join(pdf_dir, f) 
        for f in os.listdir(pdf_dir) 
        if f.endswith('.pdf')
    ]

    total_files = len(pdf_files)
    print(f"Total files to convert: {total_files}")

    # Use thread pool with reduced workers
    with concurrent.futures.ThreadPoolExecutor(max_workers=25) as executor:
        for i, _ in enumerate(executor.map(convert_pdf_to_markdown, pdf_files), start=1):
            print(f"Progress: {i}/{total_files} files converted.")

if __name__ == "__main__":
    main()
