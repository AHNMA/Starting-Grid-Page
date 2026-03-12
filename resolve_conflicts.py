import re

def resolve_file(filename):
    with open(filename, 'r') as f:
        content = f.read()

    # We want to KEEP the HEAD version (our changes) because the user reverted our PR in main,
    # but now wants the feature back (and we just added the slug feature on top of it).
    # Since we are HEAD, we keep the HEAD block.

    pattern = r'<<<<<<< HEAD\n(.*?)\n=======\n.*?\n>>>>>>> origin/main'
    resolved_content = re.sub(pattern, r'\1', content, flags=re.DOTALL)

    with open(filename, 'w') as f:
        f.write(resolved_content)

resolve_file('public/api.php')
resolve_file('src/pages/Admin.tsx')
resolve_file('src/pages/Home.tsx')
