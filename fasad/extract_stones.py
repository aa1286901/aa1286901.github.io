#!/usr/bin/env python3
"""Извлекает камни из kamenyug.html и генерирует materials.json"""

import json
import re
from pathlib import Path

def parse_stones(html_path):
    """Парсит HTML и извлекает все камни."""
    html = Path(html_path).read_text(encoding='utf-8')
    
    # Ищем все карточки камней с изображениями
    # Формат: <figure><a><img src="..."/></a></figure><div class="..."><div class="..."><a>Название</a></div></div>
    card_pattern = r'<figure class="elementor-image-box-img"><a[^>]*><img[^>]+src="(https://[^"]+)"[^>]*></a></figure><div class="elementor-image-box-content"><div class="elementor-image-box-title"><a[^>]*>(.*?)</a></div></div>'
    cards = re.findall(card_pattern, html, re.DOTALL)
    
    # Определяем категории по заголовкам секций
    section_patterns = [
        (r'<h3[^>]*>Месторождение Дагестанского камня</h3>', 'stone'),
        (r'<h3[^>]*>Месторождение Иранского камня</h3>', 'stone'),
        (r'<h3[^>]*>Месторождение Гранита</h3>', 'granite'),
        (r'<h3[^>]*>Месторождение Сланец</h3>', 'slate'),
    ]
    
    section_positions = {}
    for pattern, cat in section_patterns:
        match = re.search(pattern, html)
        if match:
            section_positions[match.start()] = cat
    
    sorted_sections = sorted(section_positions.keys())
    
    def get_category_for_pos(pos):
        """Определяет категорию по позиции в документе."""
        best_cat = 'stone'
        best_pos = -1
        for sec_pos in sorted_sections:
            if sec_pos <= pos:
                best_pos = sec_pos
                best_cat = section_positions[sec_pos]
        return best_cat
    
    stones = []
    seen_names = set()
    
    for image_url, name_raw in cards:
        # Убираем HTML-теги
        name = re.sub(r'<[^>]+>', '', name_raw).strip()
        # Убираем переносы строк и лишние пробелы
        name = ' '.join(name.split())
        
        if not name or len(name) < 3:
            continue
        
        # Пропускаем дубликаты
        if name in seen_names:
            continue
        seen_names.add(name)
        
        # Определяем категорию по позиции
        card_pos = html.find(image_url)
        category = get_category_for_pos(card_pos)
        
        # Генерируем ID
        stone_id = generate_id(name)
        
        # Получаем описание
        description = get_description(name, category)
        
        stones.append({
            'id': stone_id,
            'name': name,
            'category': category,
            'type': category,
            'image': image_url,
            'description': description,
            'active': True
        })
    
    return stones

def generate_id(name):
    """Генерирует ID из названия."""
    # Удаляем специальные символы
    id_str = re.sub(r'[^\w\s-]', '', name.lower())
    # Заменяем пробелы на нижние подчёркивания
    id_str = re.sub(r'[\s]+', '_', id_str)
    # Удаляем лишние символы
    id_str = re.sub(r'[^a-zа-яё0-9_]', '', id_str)
    return id_str[:30]

def get_description(name, category):
    """Возвращает описание на основе названия и категории."""
    name_lower = name.lower()
    
    descriptions = {
        'stone': {
            'белый': 'Светлый известняк с чистым белым оттенком. Идеален для элегантной облицовки фасадов.',
            'желт': 'Жёлтый известняк тёплого оттенка. Создаёт уютный и природный облик здания.',
            'сер': 'Серый известняк с благородным оттенком. Отличается высокой прочностью.',
            'розо': 'Розовый известняк с нежным оттенком. Придаёт фасаду изысканный вид.',
            'кремов': 'Кремовый камень с тёплым оттенком. Универсальный материал для облицовки.',
            'чёрн': 'Тёмный камень глубокого чёрного оттенка. Идеален для цоколей.',
            'мраморирован': 'Мраморированный известняк с уникальным рисунком. Премиальный материал для фасадов.',
            'с галькой': 'Известняк с включением гальки. Создаёт уникальную фактуру поверхности.',
            'с сердцевиной': 'Доломит с сердцевиной. Отличается повышенной прочностью и декоративностью.',
            'сколот': 'Сколотый доломит с фактурной поверхностью. Природная текстура для цоколей.',
            'колот': 'Колотый доломит с естественной текстурой. Прочный материал для фасадов.',
            'с экраном': 'Доломит с экраном. Двухслойный камень для надёжной облицовки.',
            'гухар': 'Иранский известняк Гохаре. Премиальный камень с богатой историей.',
            'ичирах': 'Японский известняк Ничирах. Высококачественный камень с равномерной текстурой.',
            'тенгин': 'Тенгинский известняк. Один из самых прочных видов дагестанского камня.',
            'инкерман': 'Инкерманский известняк. Плотный камень светлого оттенка.',
            'юрск': 'Юрский известняк. Древний камень с уникальной текстурой.',
            'морск': 'Морской известняк. Камень с отложениями морских организмов.',
            'огнин': 'Огнинский известняк. Камень с тёплыми оттенками.',
            'чирин': 'Чиринский известняк. Светлый камень с мелким зерном.',
            'ака': 'Акушинский камень. Один из самых популярных видов дагестанского камня.',
            'каралап': 'Каралапский камень. Известняк с характерной крапинкой.',
            'алтин': 'Алтинский песчаник. Жёлтый камень с тёплым оттенком.',
            'гелен': 'Геленбатановский ракушечник. Жёлтый камень с пористой структурой.',
            'каяк': 'Каякентский ракушечник. Серый камень с видимыми раковинами.',
            'дербен': 'Дербентский ракушечник. Классический дагестанский камень.',
            'джанг': 'Джангинский ракушечник. Светлый камень с пористой структурой.',
            'зук': 'Зулемахинский доломит. Прочный камень для цоколей и фасадов.',
            'мекег': 'Мекегинский доломит. Высококачественный камень с плотной структурой.',
            'генал': 'Геналдонский доломит. Камень с уникальной текстурой.',
        },
        'granite': {
            'южн': 'Южно-Султаевский гранит. Прочный камень серого оттенка для фасадов.',
            'габбр': 'Габбро-диабаз. Тёмный гранит с блестящей поверхностью. Идеален для цоколей.',
            'лабродар': 'Лабрадорит Петрозаводской. Гранит с эффектом лабрадоресценции.',
            'восточн': 'Восточно-Варламовский гранит. Прочный камень для наружной облицовки.',
            'балт': 'Балтийский гранит. Светлый гранит с мелким зерном.',
            'мансур': 'Мансуровский гранит. Крупнозернистый камень с ровной текстурой.',
        },
        'slate': {
            'чёрн': 'Чёрный сланец. Натуральный камень с слоистой структурой для стильных фасадов.',
        }
    }
    
    # Ищем совпадение в описаниях
    for key, desc in descriptions.get(category, {}).items():
        if key in name_lower:
            return desc
    
    # Стандартные описания по категории
    defaults = {
        'stone': 'Натуральный дагестанский камень. Высококачественный материал для облицовки фасадов и цоколей.',
        'granite': 'Натуральный гранит. Один из самых прочных камней для наружной облицовки.',
        'slate': 'Натуральный сланец. Слоистый камень с уникальной текстурой для фасадов.',
    }
    
    return defaults.get(category, 'Натуральный камень высокого качества для облицовки фасадов.')

def main():
    html_path = Path('kamenyug.html')
    
    if not html_path.exists():
        print('Файл kamenyug.html не найден!')
        return
    
    print('Извлечение камней из HTML...')
    stones = parse_stones(html_path)
    
    print(f'Найдено {len(stones)} камней')
    
    # Загружаем существующий materials.json
    materials_path = Path('data/materials.json')
    existing = []
    if materials_path.exists():
        existing = json.loads(materials_path.read_text(encoding='utf-8'))
        print(f'Существует {len(existing)} материалов')
    
    # Добавляем новые камни, не дублируя существующие по имени
    existing_names = {m['name'].lower() for m in existing}
    new_stones = [s for s in stones if s['name'].lower() not in existing_names]
    
    print(f'Новых камней: {len(new_stones)}')
    
    # Объединяем
    all_materials = existing + new_stones
    
    # Сохраняем
    materials_path.write_text(
        json.dumps(all_materials, ensure_ascii=False, indent=2),
        encoding='utf-8'
    )
    
    print(f'\nСохранено {len(all_materials)} материалов в data/materials.json')
    
    # Выводим список новых камней
    print('\nНовые камни:')
    for s in new_stones:
        print(f'  - {s["name"]} ({s["category"]})')

if __name__ == '__main__':
    main()
