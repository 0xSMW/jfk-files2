import os
import concurrent.futures
import time
from google import genai
from google.genai import types
from random import uniform
from google.api_core.exceptions import InvalidArgument, GoogleAPIError
import traceback

# --- Configuration ---
# Max file size (50MB as requested for Gemini 2.0 Flash - verify official limits)
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024
# Source PDF directory
PDF_DIR = "/Users/stephenwalker/Code/ecosystem/jfk-files/.documents/2025"
# Target output directory for Markdown files
OUTPUT_DIR = "/Users/stephenwalker/Code/ecosystem/jfk-files/md/2025"
# Log file path
LOG_FILE_PATH = 'pdf_conversion_process.log'
# API call settings
RETRIES = 3
INITIAL_DELAY = 2 # Increased initial delay for backoff
RATE_LIMIT_DELAY = 6 # Seconds between requests per worker (60s / 10 req/min = 6s/req)
GEMINI_MODEL = "gemini-2.0-flash" # 
MAX_OUTPUT_TOKENS = 8192
TEMPERATURE = 0.5
TOP_P = 0.95
TOP_K = 40
# Concurrency settings
# Adjust based on API limits (2000 req/min for Gemini 2.0 Flash) and typical processing time.
# Start conservatively. 200 workers * (API call time + appropriate delay) should be monitored.
MAX_WORKERS = 200
# --- End Configuration ---

def log_message(message_type, filename, reason=""):
    """Logs messages (INFO, ERROR, SKIP) to the log file with a timestamp."""
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"{timestamp} - [{message_type}] - File: {filename}"
    if reason:
        log_entry += f" - Reason: {reason}"
    log_entry += "\n"

    try:
        # Ensure log directory exists (if LOG_FILE_PATH includes a dir)
        log_dir = os.path.dirname(LOG_FILE_PATH)
        if log_dir and not os.path.exists(log_dir):
            os.makedirs(log_dir, exist_ok=True)

        with open(LOG_FILE_PATH, 'a', encoding='utf-8') as f:
            f.write(log_entry)
    except Exception as e:
        # Fallback print if logging fails
        print(f"CRITICAL: Failed to write to log file {LOG_FILE_PATH}: {e}")
        print(f"Original log message: {log_entry.strip()}")

def cleanup_uploaded_file(client, uploaded_file_name, source_filename):
    """Attempts to delete the uploaded file from Gemini."""
    if not client or not uploaded_file_name:
        return
    try:
        print(f"Cleaning up uploaded file {uploaded_file_name} for {source_filename}...")
        client.files.delete(name=uploaded_file_name)
        print(f"Successfully deleted {uploaded_file_name}.")
        log_message("INFO", source_filename, f"Cleaned up uploaded file: {uploaded_file_name}")
    except Exception as delete_err:
        # Log deletion errors but don't treat as critical failure of conversion
        print(f"Warning: Failed to delete uploaded file {uploaded_file_name} for {source_filename}: {delete_err}")
        log_message("ERROR", source_filename, f"File deletion failed for {uploaded_file_name}: {delete_err}")


def convert_pdf_to_markdown(pdf_path):
    """
    Converts a single PDF file to Markdown using the Gemini API.
    Handles pre-checking size, retries for transient errors, logging, and cleanup.
    Returns a status string: "success", "skipped_converted", "skipped_large",
                             "failed_retries", "failed_fs_error", "failed_api_setup",
                             "failed_api_error", "failed_unexpected".
    """
    base_filename = os.path.basename(pdf_path)
    filename_no_ext = os.path.splitext(base_filename)[0]
    output_path = os.path.join(OUTPUT_DIR, f'{filename_no_ext}.md')

    # 1. Skip if already converted
    if os.path.exists(output_path):
        print(f"Skipping {base_filename} - already converted.")
        # No log needed here unless desired
        return "skipped_converted"

    # 2. Pre-check file size
    try:
        file_size = os.path.getsize(pdf_path)
        if file_size > MAX_FILE_SIZE_BYTES:
            size_mb = file_size / (1024*1024)
            limit_mb = MAX_FILE_SIZE_BYTES / (1024*1024)
            reason = f"File size ({size_mb:.2f} MB) exceeds limit ({limit_mb:.2f} MB)"
            print(f"Skipping {base_filename} - {reason}.")
            log_message("SKIP", base_filename, reason)
            return "skipped_large"
    except OSError as e:
        reason = f"File system error checking size: {e}"
        print(f"Error processing {base_filename}: {reason}. Skipping.")
        log_message("ERROR", base_filename, reason)
        return "failed_fs_error"

    # 3. API Interaction with Retries
    client = None
    uploaded_file_resource = None # Keep track of the file resource object
    uploaded_file_name = None # Keep track of the file name for cleanup

    try:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set.")
        # Consider adding client options if needed, e.g., client_options={"api_endpoint": "generativelanguage.googleapis.com"}
        client = genai.Client(api_key=api_key)
    except Exception as e:
        reason = f"Failed to initialize Gemini client: {e}"
        print(f"Error processing {base_filename}: {reason}. Skipping.")
        log_message("ERROR", base_filename, reason)
        return "failed_api_setup"

    last_exception = None

    for attempt in range(RETRIES):
        should_retry = False
        api_call_successful = False
        try:
            # Ensure output directory exists (safer inside loop if run concurrently)
            os.makedirs(os.path.dirname(output_path), exist_ok=True)

            # Upload the PDF file (only if not already uploaded in a previous attempt)
            if not uploaded_file_resource:
                print(f"Attempt {attempt + 1}/{RETRIES} for {base_filename}: Uploading...")
                # Note: Upload itself might have size limits or timeouts
                uploaded_file_resource = client.files.upload(
                    path=pdf_path,
                    display_name=base_filename # Optional: helps identify in UI
                )
                uploaded_file_name = uploaded_file_resource.name # Store the name for cleanup
                print(f"Attempt {attempt + 1}/{RETRIES} for {base_filename}: Uploaded as {uploaded_file_name}")
                log_message("INFO", base_filename, f"Uploaded file resource: {uploaded_file_name}")


            # Prepare API request content
            # Use the file resource name obtained from the upload
            contents = [
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_uri(
                            file_uri=uploaded_file_resource.uri,
                            mime_type=uploaded_file_resource.mime_type,
                        ),
                        # Updated prompt for clarity and specificity
                        types.Part.from_text(text="Convert the entire content of this PDF document into a single Markdown (.md) file. Preserve all original text accurately. Maintain the document's structure (headings, paragraphs, lists, tables if possible) using standard Markdown syntax. Do not add any commentary, preamble, summaries, or explanations outside of the converted Markdown content itself. Respond ONLY with the raw Markdown text."),
                    ],
                ),
            ]

            generation_config = types.GenerationConfig(
                temperature=TEMPERATURE,
                top_p=TOP_P,
                top_k=TOP_K,
                max_output_tokens=MAX_OUTPUT_TOKENS,
                response_mime_type="text/plain", # Requesting plain text Markdown
            )

            # Generate content (using non-streaming)
            print(f"Attempt {attempt + 1}/{RETRIES} for {base_filename}: Generating content...")
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=contents,
                generation_config=generation_config,
                # request_options={'timeout': 600} # Optional: Increase timeout for potentially long conversions
            )

            # --- Process Response ---
            # Check for safety ratings or finish reasons indicating blockage or other issues
            if not response.candidates:
                 prompt_feedback = response.prompt_feedback if hasattr(response, 'prompt_feedback') else 'N/A'
                 reason = f"No candidates in response. Prompt Feedback: {prompt_feedback}"
                 print(f"Attempt {attempt + 1}/{RETRIES} for {base_filename}: {reason}")
                 last_exception = GoogleAPIError(reason) # Use a more specific error type if possible
                 # Decide if this specific reason is retryable
                 # Blocked prompts (SAFETY) are usually not retryable
                 if hasattr(response, 'prompt_feedback') and response.prompt_feedback.block_reason == 'SAFETY':
                     should_retry = False
                     log_message("ERROR", base_filename, f"Failed due to safety block: {prompt_feedback}")
                 else:
                     should_retry = True # Retry other "no candidate" issues

            elif not response.candidates[0].content.parts:
                 finish_reason = response.candidates[0].finish_reason if hasattr(response.candidates[0], 'finish_reason') else 'UNKNOWN'
                 safety_ratings = response.candidates[0].safety_ratings if hasattr(response.candidates[0], 'safety_ratings') else []
                 reason = f"Empty content parts in response. Finish Reason: {finish_reason}, Safety Ratings: {safety_ratings}"
                 print(f"Attempt {attempt + 1}/{RETRIES} for {base_filename}: {reason}")
                 last_exception = GoogleAPIError(reason)
                 # Decide if retryable (e.g., FINISH_REASON_STOP is normal, MAX_TOKENS might not be retryable without changes, SAFETY not retryable)
                 if finish_reason == 'SAFETY':
                     should_retry = False
                     log_message("ERROR", base_filename, f"Failed due to safety rating: {safety_ratings}")
                 elif finish_reason == 'MAX_TOKENS':
                     should_retry = False # Retrying won't help if output is truncated
                     log_message("ERROR", base_filename, "Failed due to exceeding max output tokens.")
                 else:
                     should_retry = True # Retry other finish reasons like RECITATION, OTHER

            else:
                # Successfully got content parts
                full_response = "".join(part.text for part in response.candidates[0].content.parts if hasattr(part, 'text'))

                if full_response and full_response.strip():
                    with open(output_path, 'w', encoding='utf-8') as f:
                        f.write(full_response)
                    print(f"Successfully converted {base_filename}")
                    log_message("SUCCESS", base_filename, f"Converted and saved to {output_path}")
                    api_call_successful = True
                    # Break retry loop on success
                    break
                else:
                    # Handle case where API returned parts but they were empty/non-text
                    reason = "API returned response structure but no text content."
                    print(f"Attempt {attempt + 1}/{RETRIES} for {base_filename}: {reason}")
                    last_exception = GoogleAPIError(reason)
                    should_retry = True # Retry this, might be transient

        # --- Exception Handling for API Call ---
        except InvalidArgument as ie:
            # Size errors are pre-checked. This catches other arg errors (e.g., bad API key format, unsupported file type *if* upload succeeded but generation failed).
            reason = f"InvalidArgument: {ie}"
            print(f"Attempt {attempt + 1}/{RETRIES} for {base_filename} failed. {reason}")
            last_exception = ie
            # Invalid arguments are often not transient, but retry once just in case.
            # If it persists, it likely needs code/config changes.
            should_retry = (attempt == 0) # Only retry InvalidArgument once
            if not should_retry:
                 log_message("ERROR", base_filename, f"Failed due to InvalidArgument (non-retryable): {ie}")

        except GoogleAPIError as api_err:
            # Catch more specific Google API errors (rate limits, server errors, etc.)
            reason = f"GoogleAPIError: {api_err}"
            print(f"Attempt {attempt + 1}/{RETRIES} for {base_filename} failed. {reason}")
            last_exception = api_err
            # Check if the error is likely transient (e.g., 500, 503, 429 rate limit)
            # Note: google.api_core.exceptions might have specific types like ResourceExhausted
            if hasattr(api_err, 'code') and api_err.code in [429, 500, 503]:
                 should_retry = True
                 print(f"Error code {api_err.code} suggests retry is possible.")
            else:
                 should_retry = False # Don't retry other API errors by default
                 log_message("ERROR", base_filename, f"Failed due to non-retryable API error: {api_err}")

        except Exception as e:
            # Catch other potential errors (network timeouts, unexpected issues)
            reason = f"Generic Exception: {e}\n{traceback.format_exc()}"
            print(f"Attempt {attempt + 1}/{RETRIES} for {base_filename} failed. {reason}")
            last_exception = e
            should_retry = True # Assume general errors might be transient

        # --- Retry Logic ---
        if api_call_successful:
            break # Exit loop on success

        if should_retry and attempt < RETRIES - 1:
            delay = INITIAL_DELAY * (2 ** attempt)
            jitter = uniform(0, 0.1 * delay)
            sleep_time = delay + jitter
            print(f"Retrying {base_filename} in {sleep_time:.2f} seconds...")
            log_message("INFO", base_filename, f"Attempt {attempt + 1} failed. Retrying in {sleep_time:.2f}s. Last error: {last_exception}")
            time.sleep(sleep_time)
            # Continue to the next attempt
        elif attempt == RETRIES - 1:
            # Final attempt failed or a non-retryable error occurred on the last attempt
            reason = f"Failed after {RETRIES} attempts. Last error: {last_exception}"
            print(f"Failed to process {base_filename}. {reason}")
            log_message("ERROR", base_filename, reason)
            # Let the loop finish naturally to reach cleanup logic below
            # Return "failed_retries" after cleanup
        elif not should_retry:
             # Non-retryable error occurred before final attempt
             print(f"Non-retryable error encountered for {base_filename}. Stopping attempts.")
             # Logging happened in the except block where should_retry was set to False
             # Break the loop to proceed to cleanup and return "failed_api_error"
             break

    # --- Code AFTER the loop finishes (naturally or via break) ---

    # Determine final status based on loop outcome
    if api_call_successful:
        final_status = "success"
    elif not should_retry: # Loop broken due to non-retryable error
        final_status = "failed_api_error"
    elif attempt == RETRIES - 1: # Loop finished all retries without success
        final_status = "failed_retries"
    else: # Should not happen with current logic, but set a default
        final_status = "failed_unexpected"
        if not last_exception: last_exception = "Loop finished unexpectedly without success or known failure."
        log_message("ERROR", base_filename, f"Unexpected loop exit. Last error: {last_exception}")


    # Ensure cleanup happens regardless of success, failure, or exceptions within the loop
    if uploaded_file_name: # Only cleanup if an upload was attempted/completed
         cleanup_uploaded_file(client, uploaded_file_name, base_filename)

    # Apply rate limit delay AFTER processing a file (success or final failure)
    # This helps maintain the overall average rate across workers.
    print(f"Rate limit pause after processing {base_filename} (Status: {final_status})...")
    time.sleep(RATE_LIMIT_DELAY)

    return final_status # Return the determined status


def main():
    """
    Main function to find PDF files and process them using a thread pool.
    Provides a summary of the conversion results.
    """
    # Initialize log file
    try:
        # Create output dir if it doesn't exist
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        # Write header to log file
        with open(LOG_FILE_PATH, 'w', encoding='utf-8') as f:
            f.write(f"--- PDF Conversion Log - {time.strftime('%Y-%m-%d %H:%M:%S')} ---\n")
            f.write(f"Source Directory: {PDF_DIR}\n")
            f.write(f"Output Directory: {OUTPUT_DIR}\n")
            f.write(f"Max File Size: {MAX_FILE_SIZE_BYTES / (1024*1024):.2f} MB\n")
            f.write(f"Model: {GEMINI_MODEL}\n")
            f.write(f"Max Workers: {MAX_WORKERS}\n")
            f.write(f"Retries per file: {RETRIES}\n")
            f.write(f"Rate Limit Delay per file: {RATE_LIMIT_DELAY}s\n")
            f.write("="*50 + "\n")
        print(f"Logging initialized at: {LOG_FILE_PATH}")
    except Exception as e:
        print(f"CRITICAL: Failed to initialize log file {LOG_FILE_PATH}: {e}")
        return # Cannot proceed without logging

    # Find PDF files
    pdf_files = []
    try:
        if not os.path.isdir(PDF_DIR):
             raise FileNotFoundError(f"Source directory not found: {PDF_DIR}")
        pdf_files = [
            os.path.join(PDF_DIR, f)
            for f in os.listdir(PDF_DIR)
            if f.lower().endswith('.pdf') and os.path.isfile(os.path.join(PDF_DIR, f))
        ]
        total_files = len(pdf_files)
        print(f"Found {total_files} PDF files to process in {PDF_DIR}.")
        log_message("INFO", "Initialization", f"Found {total_files} PDF files.")
    except Exception as e:
        print(f"Error listing PDF files in {PDF_DIR}: {e}")
        log_message("ERROR", "Initialization", f"Error listing PDF files: {e}")
        return

    if not pdf_files:
        print("No PDF files found to convert.")
        log_message("INFO", "Initialization", "No PDF files found.")
        return

    # Use a dictionary to track status counts
    status_counts = {
        "success": 0,
        "skipped_converted": 0,
        "skipped_large": 0,
        "failed_retries": 0,
        "failed_fs_error": 0,
        "failed_api_setup": 0,
        "failed_api_error": 0,
        "failed_unexpected": 0
    }
    processed_counter = 0

    print(f"Starting processing with {MAX_WORKERS} workers...")
    log_message("INFO", "Processing", f"Starting ThreadPoolExecutor with {MAX_WORKERS} workers.")

    # Process files using ThreadPoolExecutor
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        # Submit all tasks
        future_to_pdf = {executor.submit(convert_pdf_to_markdown, pdf): pdf for pdf in pdf_files}

        # Process results as they complete
        for future in concurrent.futures.as_completed(future_to_pdf):
            pdf_path = future_to_pdf[future]
            base_filename = os.path.basename(pdf_path)
            processed_counter += 1
            try:
                result_status = future.result()
                if result_status in status_counts:
                    status_counts[result_status] += 1
                else:
                    status_counts["failed_unexpected"] += 1 # Catch unexpected return values
                    log_message("ERROR", base_filename, f"Received unexpected status from worker: {result_status}")
            except Exception as exc:
                # Catch exceptions raised *by the worker function itself* if not handled internally
                print(f'{base_filename} generated an exception: {exc}')
                log_message("ERROR", base_filename, f"Worker function raised unhandled exception: {exc}\n{traceback.format_exc()}")
                status_counts["failed_unexpected"] += 1

            # Simple progress indicator
            print(f"Progress: {processed_counter}/{total_files} files processed. Last status: {result_status} for {base_filename}")


    # Final Summary
    print("\n--- Processing Summary ---")
    print(f"Total files found: {total_files}")
    print(f"Successfully converted: {status_counts['success']}")
    print(f"Skipped (already converted): {status_counts['skipped_converted']}")
    print(f"Skipped (file too large): {status_counts['skipped_large']}")
    print(f"Failed (after retries): {status_counts['failed_retries']}")
    print(f"Failed (API error/block/non-retryable): {status_counts['failed_api_error']}")
    print(f"Failed (file system error): {status_counts['failed_fs_error']}")
    print(f"Failed (API client setup): {status_counts['failed_api_setup']}")
    if status_counts["failed_unexpected"] > 0:
        print(f"Failed (unexpected reason/worker error): {status_counts['failed_unexpected']}")

    total_processed_or_skipped = sum(status_counts.values())
    print(f"Total accounted for: {total_processed_or_skipped}")
    if total_processed_or_skipped != total_files:
         mismatch_reason = f"Mismatch between total files ({total_files}) and accounted for ({total_processed_or_skipped}). Check logs."
         print(f"WARNING: {mismatch_reason}")
         log_message("WARNING", "Summary", mismatch_reason)

    print(f"\nCheck '{LOG_FILE_PATH}' for detailed logs.")
    log_message("INFO", "Completion", f"Processing finished. Final counts: {status_counts}")


if __name__ == "__main__":
    main()