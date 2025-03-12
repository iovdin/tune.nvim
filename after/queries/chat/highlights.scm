; User roles
((role) @role.user
 (#any-of? @role.user "u:" "user:"))

; Assistant roles
((role) @role.assistant
 (#any-of? @role.assistant "a:" "assistant:"))

; System roles
((role) @role.system
 (#any-of? @role.system "s:" "system:"))

; Tool call roles
((role) @role.tool_call
 (#any-of? @role.tool_call "tc:" "tool_call:"))

; Tool result roles
((role) @role.tool_result
 (#any-of? @role.tool_result "tr:" "tool_result:"))

; Comment roles
;((role) @comment
; (#any-of? @comment "c:" "comment:"))

((chat_entry 
  (role) @role.comment
  (content) @role.comment_content)
 (#any-of? @role.comment "c:" "comment:")
 (#match? @role.comment_content "\s*\-\-\-.*"))

((chat_entry 
  (role) @role.comment
  (content) @comment)
 (#any-of? @role.comment "c:" "comment:"))

;(@role.comment) @comment

; Error roles
((role) @role.err
 (#any-of? @role.err "err:" "error:"))

; Variables
(variable) @chat.variable

; Regular text
(text) @text

