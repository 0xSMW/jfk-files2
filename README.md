# JFK Files 2025 LLM Analysis

This repository contains a comprehensive LLM-powered analysis of the 2025 JFK files that were released by the CIA under the Trump administration. The files include a variety of documents, memos, and reports that provide insights into the events surrounding the assassination of President John F. Kennedy. The original source files can be found in the `.stash` directory.

## Table of Contents

- [JFK Files 2025 LLM Analysis](#jfk-files-2025-llm-analysis)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Project Structure](#project-structure)
  - [Analysis Methodology](#analysis-methodology)
  - [Files Included](#files-included)
  - [Usage](#usage)
  - [Contributing](#contributing)
  - [License](#license)

## Introduction

The JFK files have been a subject of public interest and speculation for decades. In 2025, a new set of documents was released, shedding light on various aspects of the investigation and the events leading up to the assassination. This repository aims to make these documents more accessible by providing AI-powered analysis and structured data extraction from these historical records.

## Project Structure

- `jfk_documents/`: Original document files
- `jfk_text_new/`: Extracted text from documents
- `jfk_llm_txt/`: Processed text files for LLM analysis
- `jfk_json/`: JSON output files containing structured analysis results
- `2023/` and `2025/`: Organized files by release year
- `summary_jfk/`: Summary documents and analysis results
- `scripts/`: Utility scripts for data processing
- `summarize.py`: Main script for LLM analysis using Gemini API
- `schema.json`: JSON schema definition for structured data extraction

## Analysis Methodology

This project uses Google's Gemini 2.0 LLM to analyze declassified JFK assassination documents. Each document is processed to extract key information including:

- Document title and type
- Security classification
- Dates and agencies involved
- Key persons and locations mentioned
- Comprehensive document summaries
- Security assessment of sensitive information

The analysis is structured according to a predefined schema to ensure consistent data extraction across all documents.

## Files Included

The repository includes analysis of numerous declassified documents related to the JFK assassination investigation:
// ... existing code ...
- Document 3: [Title of Document 3](link-to-document-3)

## Usage

To view the analyzed documents, you can browse the JSON files in the `jfk_json` directory. For a more human-readable format, explore the summary documents in the `summary_jfk` directory.

If you want to run the analysis on additional documents:
1. Ensure you have the necessary API keys set up in your environment
2. Place new documents in the appropriate directory
3. Run the analysis script: `python summarize.py`

## Contributing

Contributions are welcome! If you have additional documents or insights related to the JFK files, please feel free to submit a pull request. You can also help improve the analysis methodology or schema definition.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.