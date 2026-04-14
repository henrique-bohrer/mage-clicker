import re

with open('script.js', 'r') as f:
    content = f.read()

content = content.replace(
    "diamantes -= caixa.custo;\n        playSound('rebirth');",
    "diamantes -= caixa.custo;\n        atualizarUI();\n        salvarJogo();\n        playSound('rebirth');"
)

with open('script.js', 'w') as f:
    f.write(content)
