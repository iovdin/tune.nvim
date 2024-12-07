 {
  "description": "Predict the file's extension based on provided hex bytes",
  "parameters": {
    "type": "object",
    "properties": {
      "hex": {
        "type": "string",
        "description": "Hexadecimal string representing the first few bytes of the file"
      }
    },
    "required": ["hex"]
  }
}