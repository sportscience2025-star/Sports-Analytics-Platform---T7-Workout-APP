import glob

def find_get_exercises():
    for fname in glob.glob('js/*.js'):
        with open(fname, 'r', encoding='utf-8') as f:
            content = f.read()
        for i, line in enumerate(content.splitlines(), 1):
            if 'getExercises' in line:
                print(f"{fname}:{i} -> {line[:120]}")

if __name__ == '__main__':
    find_get_exercises()
