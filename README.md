# JFK Files 2025 LLM Analysis

This repository contains a comprehensive LLM-powered analysis of the 2025 JFK files that were released by the CIA under the Trump administration. The files include a variety of documents, memos, and reports that provide insights into the events surrounding the assassination of President John F. Kennedy. 

## Table of Contents

- [JFK Files 2025 LLM Analysis](#jfk-files-2025-llm-analysis)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Project Structure](#project-structure)
  - [Analysis Methodology](#analysis-methodology)
  - [Schema and Data Structure](#schema-and-data-structure)
  - [Entity Summaries](#entity-summaries)
  - [Scripts Overview](#scripts-overview)
  - [Usage](#usage)
  - [Contributing](#contributing)
  - [License](#license)

## Introduction

The JFK files have been a subject of public interest and speculation for decades. In 2025, a new set of documents was released, shedding light on various aspects of the investigation and the events leading up to the assassination. This repository aims to make these documents more accessible by providing AI-powered analysis and structured data extraction from these historical records.

## Project Structure


- `json/2025/`: JSON output files containing structured analysis results of individual documents
- `json/entity_summaries/`: JSON files containing entity-based analysis and summaries across all documents
- `md/2025/`: Markdown versions of the documents
- `md/2025_jfk_llm_txt/`: Processed text files in markdown format for llm
- `scripts/`: Utility scripts for data processing
- `schema.json`: JSON schema definition for structured data extraction
- `schema_entity.json`: JSON schema definition for entity-based data analysis

## Analysis Methodology

This project uses Google's Gemini 2.0 LLM to analyze declassified JFK assassination documents. Each document is processed to extract key information including:

- Document title and type
- Security classification
- Dates and agencies involved
- Key persons and locations mentioned
- Comprehensive document summaries
- Security assessment of sensitive information

The analysis is structured according to a predefined schema to ensure consistent data extraction across all documents.

## Schema and Data Structure

The project uses a detailed JSON schema (found in `scripts/schema.json`) to structure the extracted information from each document. Key fields include:

- `title`: Document title or subject line
- `document_type`: Type of document (Memo, Dispatch, Cable, Report, etc.)
- `classification`: Category the document belongs to (Oswald, Commission, Soviet, etc.)
- `security_level`: Original security classification (SECRET, CONFIDENTIAL, UNCLASSIFIED)
- `date`: Document creation date in YYYY-MM-DD format
- `origin_agency`: Agency that originated the document
- `sender` and `recipient`: Author and intended recipient
- `persons_mentioned`: Key individuals referenced
- `locations_mentioned`: Geographic locations referenced
- `tags`: Additional searchable terms
- `summary`: Brief 1-2 sentence summary
- `summary_one_paragraph`: Detailed paragraph covering who, what, when, where, why, and how
- `security`: Assessment of sensitive content
- `conspiracy`: Optional field for details clarifying JFK assassination understanding
- `allies`: Optional field for information on US allies treatment

## Entity Summaries

The `json/entity_summaries/` directory contains AI-generated summaries of key entities (people, organizations, locations, concepts) mentioned across multiple documents. Each entity summary provides:

- `entity_name`: Name of the person, organization, location, or concept
- `entity_type`: Classification of the entity (person, sender, recipient, or tag)
- `document_count`: Number of documents mentioning this entity
- `summary`: Comprehensive summary of the entity's role and significance across documents
- `key_connections`: Related entities or connections
- `significance`: Analysis of why this entity matters in the context of the JFK files
- `document_ids`: List of documents where this entity appears

These entity summaries enable researchers to quickly understand key players, organizations, and concepts without needing to read all individual documents.

## Scripts Overview

The `scripts/` directory contains various utilities for processing and analyzing the JFK files:

- `download_archives.py` and `download_2025.py`: Tools for acquiring the source documents
- `pdf-2-md.py`: Converts PDF documents to markdown format for easier processing
- `find_dupes.py`: Identifies duplicate documents to ensure data integrity
- `process_jfk_files.sh`: Main processing pipeline for handling the documents
- `generate_json_summary.py`: Generates structured JSON summaries of documents using Gemini AI
- `analysis.py`: Creates entity-based summaries by extracting people, organizations, and concepts across documents
- `remove_1992_files.py`: Filters out previously released documents to focus on new information

## Usage

To view the analyzed documents, you can browse the JSON files in the `json/2025` directory. For entity-based analysis, explore the entity summaries in the `json/entity_summaries` directory.

If you want to run the analysis on additional documents:
1. Ensure you have the necessary API keys set up in your environment
2. Place new documents in the appropriate directory
3. Run the processing pipeline: `./scripts/process_jfk_files.sh`

## Contributing

Contributions are welcome! If you have additional documents or insights related to the JFK files, please feel free to submit a pull request. You can also help improve the analysis methodology or schema definition.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.