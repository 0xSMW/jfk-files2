#!/bin/bash
# Remove non-.json files in the entity_summaries folder
for file in entity_summaries/*; do
  if [[ "$file" != *.json ]]; then
    rm "$file"
  fi
done

# Replace spaces with underscores in .json filenames
for file in entity_summaries/*.json; do
  base=$(basename "$file")
  new=$(echo "$base" | sed 's/ /_/g')
  if [ "$base" != "$new" ]; then
    mv "$file" "entity_summaries/$new"
  fi
done
