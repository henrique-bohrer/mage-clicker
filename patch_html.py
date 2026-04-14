with open('index.html', 'r') as f:
    content = f.read()

content = content.replace('<div id="adventure-screen" class="screen hidden">', '<div id="adventure-screen" class="hidden">')

# Add battle container to adventure screen
if 'id="battle-container"' not in content:
    content = content.replace('      <div id="game-screen" class="screen hidden">', '      <div id="game-screen" class="screen hidden">\n      <div id="adventure-screen" class="hidden">\n        <div id="battle-container"></div>\n      </div>')

with open('index.html', 'w') as f:
    f.write(content)
