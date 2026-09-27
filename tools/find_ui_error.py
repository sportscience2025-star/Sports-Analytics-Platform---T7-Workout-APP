with open('js/ui.js', 'r', encoding='utf-8') as f:
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
    if c == '/' and i + 1 < n and content[i+1] == '/':
        i += 2
        col += 2
        while i < n and content[i] != '\n':
            i += 1
            col += 1
        continue
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
    if c in '"\'`':
        quote = c
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
            if content[i] == '\n':
                line += 1
                col = 1
            else:
                col += 1
            i += 1
        continue
    if c in '({[':
        stack.append((c, line, col))
    elif c in ')}]':
        if not stack:
            print(f"Unexpected closing {c} at L{line}:C{col}")
            break
        top, l, cl = stack.pop()
        expected = {'(': ')', '{': '}', '[': ']'}[top]
        if c != expected:
            print(f"Mismatched {top} (from L{l}:C{cl}) with {c} at L{line}:C{col}")
            print("Current stack top items:", stack[-5:])
            break
    i += 1
    col += 1
