"""
JFK Files Analysis Script

This script processes JSON files containing information about JFK assassination documents.
It extracts entities (persons mentioned, senders, recipients, and tags) from the documents, 
groups documents by entity, and generates summaries for each entity using Google's Gemini AI.
The results are saved as JSON files in the format {entity}-{entity_type}.json.
"""

import os
import json
import glob
from collections import defaultdict
from google import genai
from google.genai import types
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm

# Initialize Google Gemini API client
client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))
model = "gemini-2.0-flash"

# Define absolute paths
INPUT_JSON_DIR = "/Users/stephenwalker/Code/ecosystem/jfk-files/json/2025/"
OUTPUT_ENTITY_SUMMARIES_DIR = "/Users/stephenwalker/Code/ecosystem/jfk-files/json/entity_summaries/"

def process_json_files():
    """
    Process all JSON files to extract entities (persons_mentioned, sender, recipient, tags),
    group documents by entity, and generate summaries for each entity using Gemini.
    The results are saved as JSON files named {entity}-{entity_type}.json.
    """
    # Dictionaries to store documents by entity
    persons_dict = defaultdict(list)
    senders_dict = defaultdict(list)
    recipients_dict = defaultdict(list)
    tags_dict = defaultdict(list)
    
    # Find all JSON files
    # json_files = glob.glob('json/2025/*.json') # Old relative path
    json_files = glob.glob(os.path.join(INPUT_JSON_DIR, '*.json')) # Use absolute path constant
    print(f"Found {len(json_files)} JSON files to process")
    
    # Process each JSON file
    for file_path in tqdm(json_files, desc="Processing JSON files"):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            file_id = os.path.basename(file_path).replace('.json', '')
            
            # Extract document summary
            doc_summary = {
                "id": file_id,
                "title": data.get("title", ""),
                "date": data.get("date", ""),
                "summary": data.get("summary", ""),
                "document_type": data.get("document_type", "")
            }
            
            # Process persons mentioned
            for person in data.get("persons_mentioned", []):
                if person and isinstance(person, str):
                    persons_dict[person].append(doc_summary)
            
            # Process sender
            sender = data.get("sender", "")
            if sender and isinstance(sender, str):
                senders_dict[sender].append(doc_summary)
            
            # Process recipient
            recipient = data.get("recipient", "")
            if recipient and isinstance(recipient, str):
                recipients_dict[recipient].append(doc_summary)
            
            # Process tags
            for tag in data.get("tags", []):
                if tag and isinstance(tag, str):
                    tags_dict[tag].append(doc_summary)
                    
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
    
    # Create output directory
    # os.makedirs('entity_summaries', exist_ok=True) # Old relative path
    os.makedirs(OUTPUT_ENTITY_SUMMARIES_DIR, exist_ok=True) # Use absolute path constant

    # Generate summaries for each entity type
    generate_entity_summaries(persons_dict, "person-mentioned")
    generate_entity_summaries(senders_dict, "sender")
    generate_entity_summaries(recipients_dict, "recipient")
    generate_entity_summaries(tags_dict, "tag")

def generate_entity_summaries(entity_dict, entity_type):
    """Generate summaries for each entity using Gemini API"""
    print(f"Generating summaries for {len(entity_dict)} {entity_type} entities")
    
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {}
        for entity, documents in entity_dict.items():
            # Construct the expected output filename
            # entity_filename = f"entity_summaries/{entity_type}-{entity.replace('/', '_')}.json" # Old relative path
            # Update sanitization to include replacing spaces with underscores
            sanitized_entity = entity.replace('/', '_').replace('\\', '_').replace(' ', '_') # Updated sanitization
            # Update filename format to {sanitized_entity}-{entity_type}.json
            entity_filename = os.path.join(OUTPUT_ENTITY_SUMMARIES_DIR, f"{sanitized_entity}-{entity_type}.json") # Use new format and absolute path constant

            # Check if the summary file already exists
            if os.path.exists(entity_filename):
                # print(f"Skipping {entity_type} '{entity}' - summary file already exists.") # Optional: uncomment to log skips
                continue # Skip this entity if the file exists

            if len(documents) >= 3:  # Only process entities mentioned in at least 3 documents
                future = executor.submit(
                    summarize_entity,
                    entity,
                    documents,
                    entity_type
                )
                futures[future] = entity
        
        for future in tqdm(as_completed(futures), total=len(futures), desc=f"Summarizing {entity_type}"):
            entity = futures[future]
            try:
                result = future.result()
                if result:
                    # Save the result to a file
                    # entity_filename = f"entity_summaries/{entity_type}-{entity.replace('/', '_')}.json" # Old relative path
                    # Update sanitization to include replacing spaces with underscores
                    sanitized_entity = entity.replace('/', '_').replace('\\', '_').replace(' ', '_') # Updated sanitization
                    # Update filename format to {sanitized_entity}-{entity_type}.json
                    entity_filename = os.path.join(OUTPUT_ENTITY_SUMMARIES_DIR, f"{sanitized_entity}-{entity_type}.json") # Use new format and absolute path constant
                    with open(entity_filename, 'w', encoding='utf-8') as f:
                        json.dump(result, f, indent=2, ensure_ascii=False)
            except Exception as e:
                print(f"Error summarizing {entity}: {e}")

def summarize_entity(entity, documents, entity_type):
    """Generate a summary for a specific entity using Gemini"""
    try:
        # Prepare prompt for Gemini
        prompt = f"""
        Entity: {entity}
        Entity Type: {entity_type}
        Number of Documents: {len(documents)}
        
        Documents mentioning this entity:
        {json.dumps(documents, indent=2)}
        
        Based on the documents above, provide a comprehensive summary about {entity}.
        Include key information such as:
        1. Who they are/what it is
        2. Their role or significance in the JFK assassination context
        3. Key connections to other people, organizations, or events
        4. Timeline of involvement if applicable
        5. Any notable patterns across documents
        
        Format your response as a JSON object with these fields:
        - entity_name: The name of the entity
        - entity_type: The type of entity ({entity_type})
        - document_count: Number of documents mentioning this entity
        - summary: A detailed summary paragraph
        - key_connections: Array of other entities this entity is connected to
        - significance: The significance of this entity in the JFK context
        """
        
        # Create a configuration object
        generate_content_config = types.GenerateContentConfig(
            temperature=0.2,
            top_p=0.95,
            top_k=40,
            max_output_tokens=4096,
            response_mime_type="application/json"
        )
        
        # Generate content with Gemini
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=generate_content_config
        )
        
        # Parse the response
        if response.text:
            try:
                result = json.loads(response.text)
                # Add document IDs to the result
                result["document_ids"] = [doc["id"] for doc in documents]
                return result
            except json.JSONDecodeError:
                print(f"Failed to parse JSON for {entity}")
                return None
        
        return None
    except Exception as e:
        print(f"Error in summarize_entity for {entity}: {e}")
        return None

if __name__ == "__main__":
    process_json_files()