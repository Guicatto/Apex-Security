import os
import sys

# Os testes importam "services.*", que vive em backend/ (estrutura definida na R1,
# com tests/ na raiz do projeto). Inserir backend/ no sys.path resolve o import
# sem alterar a estrutura de pastas.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))
