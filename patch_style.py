with open('style.css', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if line.startswith('.hidden {') or line.startswith('.hidden{'):
        skip = True
        continue
    if skip and '}' in line:
        skip = False
        continue
    if not skip:
        new_lines.append(line)

new_lines.append('\n.hidden {\n    display: none !important;\n}\n')

new_lines.append('''\n#adventure-screen {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
    z-index: 100;
}

#battle-container {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 50;
}\n''')

with open('style.css', 'w') as f:
    f.writelines(new_lines)
