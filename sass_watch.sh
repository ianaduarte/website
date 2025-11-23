find . -name "*.scss" -print0 | while IFS= read -r -d $'\0' scss_file; do
    output_dir=$(dirname "$scss_file")
    base_name=$(basename "$scss_file" .scss)
    css_file="$output_dir/$base_name.css"
    
    "sass" --watch "$scss_file" "$css_file"
done