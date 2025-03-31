#!/bin/bash
# Remove non-.json files in the entity_summaries folder
for file in entity_summaries/*; do
  if [[ "$file" != *.json ]]; then
    rm "$file"
  fi
done

# Rename .json files: replace spaces with underscores and remove special characters/punctuation before .json
for file in entity_summaries/*.json; do
  base=$(basename "$file" .json)
  newbase=$(echo "$base" | sed -e 's/ /_/g' -e 's/[^A-Za-z0-9_]//g')
  new="${newbase}.json"
  if [ "$base.json" != "$new" ]; then
    mv "$file" "entity_summaries/$new"
  fi
done