for file in entity_summaries/*; do
  if [ -n "$file" ]; then
    base=$(basename "$file")
    new=$(echo "$base" | tr -d -c '[:alnum:]')
    mv "$file" "entity_summaries/$new"
  fi
done
