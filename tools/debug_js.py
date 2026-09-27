import sys

def check_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    stack = []
    i = 0
    n = len(content)
    line = 1
    col = 1
    
    while i < n:
        c = content[i]
        if c == '\n':
            line += 1
            col = 1
            i += 1
            continue
        
        # Single line comment
        if c == '/' and i + 1 < n and content[i+1] == '/':
            i += 2
            col += 2
            while i < n and content[i] != '\n':
                i += 1
                col += 1
            continue
            
        # Multiline comment
        if c == '/' and i + 1 < n and content[i+1] == '*':
            i += 2
            col += 2
            while i + 1 < n and not (content[i] == '*' and content[i+1] == '/'):
                if content[i] == '\n':
                    line += 1
                    col = 1
                else:
                    col += 1
                i += 1
            i += 2
            col += 2
            continue
            
        # String literals (handling escaped quotes and backticks)
        if c in '"\'`':
            quote = c
            start_line, start_col = line, col
            i += 1
            col += 1
            while i < n:
                if content[i] == '\\':
                    i += 2
                    col += 2
                    continue
                if content[i] == quote:
                    i += 1
                    col += 1
                    break
                # JS template literal interpolation ${ ... }
                if quote == '`' and content[i] == '$' and i + 1 < n and content[i+1] == '{':
                    stack.append(('${', line, col))
                    i += 2
                    col += 2
                    break # exit string mode to parse JS expressions inside ${}
                if content[i] == '\n':
                    line += 1
                    col = 1
                else:
                    col += 1
                i += 1
            continue
            
        if c in '({[':
            stack.append((c, line, col))
        elif c == '}' and stack and stack[-1][0] == '${':
            stack.pop()
            # resume backtick string parsing by jumping back into backtick loop
            # simple way: we will continue loop and if next char is backtick it closes, or we re-enter string mode.
            i += 1
            col += 1
            while i < n:
                if content[i] == '\\':
                    i += 2
                    col += 2
                    continue
                if content[i] == '`':
                    i += 1
                    col += 1
                    break
                if content[i] == '$' and i + 1 < n and content[i+1] == '{':
                    stack.append(('${', line, col))
                    i += 2
                    col += 2
                    break
                if content[i] == '\n':
                    line += 1
                    col = 1
                else:
                    col += 1
                i += 1
            continue
        elif c in ')}]':
            if not stack:
                print(f"[{filepath}] Unexpected closing {c} at L{line}:C{col}")
                return
            top, l, cl = stack.pop()
            expected = {'(': ')', '{': '}', '[': ']'}[top]
            if c != expected:
                print(f"[{filepath}] Mismatched {top} (L{l}:C{cl}) with {c} (L{line}:C{col})")
                return
        i += 1
        col += 1
        
    if stack:
        print(f"[{filepath}] Unclosed items count: {len(stack)}")
        for item in stack[-10:]:
            print("  Unclosed:", item)

check_file('../js/data-analysis.js')
