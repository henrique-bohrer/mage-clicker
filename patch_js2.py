with open('script.js', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if "document.getElementById('main-screen').classList.add('hidden');" in line:
        pass
    else:
        new_lines.append(line)

with open('script.js', 'w') as f:
    f.writelines(new_lines)
