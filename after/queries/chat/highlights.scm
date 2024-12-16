((role) @role.user
 (#eq? @role.user "u:"))

((role) @role.assistant
 (#eq? @role.assistant "a:"))

((role) @role.system
 (#eq? @role.system "s:"))

((role) @role.tool_call
 (#eq? @role.tool_call "tc:"))

((role) @role.tool_result
 (#eq? @role.tool_result "tr:"))

((role) @role.comment
 (#eq? @role.comment "c:"))

((role) @role.err
 (#eq? @role.err "err:"))
