with open('script.js', 'r') as f:
    content = f.read()

content = content.replace("document.getElementById('main-screen').classList.add('hidden');", "")
content = content.replace("document.getElementById('adventure-screen').classList.remove('hidden');", "document.getElementById('adventure-screen').classList.remove('hidden');")

with open('script.js', 'w') as f:
    f.write(content)
