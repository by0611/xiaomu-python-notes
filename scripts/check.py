"""檢查本站經開發者檢視的固定格式教材與短範例。"""
import ast
import contextlib
import io
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CATEGORIES = {'語法基礎', '資料結構', '除錯練習'}
REQUIRED = {'slug', 'title', 'category', 'minutes', 'summary', 'tags', 'objectives',
            'concepts', 'code', 'output', 'mistake', 'quiz'}
ALLOWED_BUILTINS = {'print': print, 'len': len, 'sum': sum, 'int': int, 'str': str,
                    'float': float, 'type': type, 'range': range, 'ValueError': ValueError}


def check():
    lessons = json.loads((ROOT / 'content/lessons.json').read_text(encoding='utf-8'))
    assert isinstance(lessons, list) and lessons, '教材不可空白'
    slugs = set()
    for lesson in lessons:
        assert REQUIRED == set(lesson), f"欄位不符：{lesson.get('slug')}"
        slug = lesson['slug']
        assert re.fullmatch(r'[a-z][a-z0-9]*(?:-[a-z0-9]+)*', slug), f'slug 格式不符：{slug}'
        assert slug not in slugs, f'重複 slug：{slug}'
        slugs.add(slug)
        assert lesson['category'] in CATEGORIES, f'未知分類：{slug}'
        assert isinstance(lesson['minutes'], int) and 1 <= lesson['minutes'] <= 30
        for key in ['title', 'summary', 'code', 'output']:
            assert isinstance(lesson[key], str) and lesson[key].strip(), f'{key} 不可空白：{slug}'
        for key, minimum, maximum in [('tags', 2, 4), ('objectives', 2, 3), ('concepts', 2, 4)]:
            assert isinstance(lesson[key], list) and minimum <= len(lesson[key]) <= maximum
            assert all(isinstance(value, str) and value.strip() for value in lesson[key])
        assert set(lesson['mistake']) == {'title', 'text'}
        assert all(isinstance(value, str) and value.strip() for value in lesson['mistake'].values())
        quiz = lesson['quiz']
        assert set(quiz) == {'question', 'choices', 'answer', 'explanation'}
        assert len(quiz['choices']) == 3 and len(set(quiz['choices'])) == 3
        assert all(isinstance(value, str) and value.strip() for value in quiz['choices'])
        assert type(quiz['answer']) is int and 0 <= quiz['answer'] < 3
        assert all(isinstance(quiz[key], str) and quiz[key].strip() for key in ['question', 'explanation'])
        tree = ast.parse(lesson['code'])
        function_names = {item.name for item in ast.walk(tree) if isinstance(item, ast.FunctionDef)}
        for item in ast.walk(tree):
            assert not isinstance(item, (ast.Import, ast.ImportFrom, ast.With, ast.While, ast.AsyncFunctionDef)), f'範例使用不允許的操作：{slug}'
            if isinstance(item, ast.Attribute):
                assert item.attr in {'__name__', 'get'}, f'範例屬性不在教材範圍：{slug}'
            if isinstance(item, ast.Call) and isinstance(item.func, ast.Name):
                assert item.func.id in ALLOWED_BUILTINS or item.func.id in function_names, f'範例呼叫不在教材範圍：{slug}'
        captured = io.StringIO()
        with contextlib.redirect_stdout(captured):
            exec(compile(tree, f'lesson:{slug}', 'exec'), {'__builtins__': ALLOWED_BUILTINS})
        assert captured.getvalue() == lesson['output'], f'輸出不符：{slug}'
    for page in ['index.html', 'lesson.html', 'about.html']:
        source = (ROOT / page).read_text(encoding='utf-8')
        assert 'lang="zh-Hant"' in source and 'name="viewport"' in source
        for ref in re.findall(r'(?:href|src)="([^"]+)"', source):
            if ref.startswith(('#', 'https://', 'http://')):
                continue
            local_path = ref.split('?')[0].split('#')[0]
            assert (ROOT / local_path).is_file(), f'遺失資源：{page} -> {ref}'
    print(f'通過：{len(lessons)} 篇教材的欄位、唯一網址、練習題與實際程式輸出；三個頁面資源連結。')


if __name__ == '__main__':
    check()
