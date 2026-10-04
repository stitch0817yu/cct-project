// DeepSeek vision integration — recognize a menu photo into four categories
// (appetizer/main/dessert/drink) with bilingual dish names and allergen tags.
window.DeepSeek = (function () {
  const ALLERGEN_IDS = ['gluten', 'dairy', 'egg', 'nuts', 'shellfish', 'fish', 'soy', 'sesame', 'peanut'];

  function readError(e) {
    if (e && e.message) return e.message;
    return String(e);
  }

  async function recognizeMenu(imageDataUrl) {
    if (!CONFIG.DEEPSEEK_API_KEY) throw new Error('未設定 DeepSeek API 金鑰 — 按右上角 🔑 設定。No DeepSeek API key set.');
    const payload = {
      model: CONFIG.DEEPSEEK_MODEL,
      messages: [
        { role: 'system', content: '你是一個餐廳餐牌辨識助手，只輸出 JSON，不輸出其他文字。' },
        { role: 'user', content: [
          { type: 'text', text: buildPrompt() },
          { type: 'image_url', image_url: { url: imageDataUrl } },
        ] },
      ],
      response_format: { type: 'json_object' },
      temperature: 0,
      max_tokens: 2500,
    };

    const res = await fetch(CONFIG.DEEPSEEK_BASE + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + CONFIG.DEEPSEEK_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let msg = 'DeepSeek 錯誤 HTTP ' + res.status;
      try {
        const j = await res.json();
        if (j && j.error && j.error.message) msg = j.error.message;
      } catch (err) { /* ignore */ }
      throw new Error(msg);
    }

    const data = await res.json();
    const text = data && data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content
      : '';
    if (!text) throw new Error('DeepSeek 沒有回傳內容。The model returned no content.');
    return parse(text);
  }

  function buildPrompt() {
    return [
      '請辨識這張餐廳餐牌照片，抽出所有菜式與飲品。',
      '把每一項歸入以下四類之一，用英文 id 表示：appetizer（前菜）、main（主食）、dessert（甜品）、drink（飲料）。',
      '為每項提供中英文名稱（zh、en），並標出可能含有的致敏原。',
      '致敏原只能從下列英文 id 中選擇（可多個，無則空陣列）：' + ALLERGEN_IDS.join(', ') + '。',
      '四個類別都要出現；若某類別沒有任何項目，dishes 設為空陣列。',
      '只輸出一個 JSON 物件，不要 Markdown 或其他文字，格式如下：',
      '{"categories":[{"id":"appetizer","dishes":[{"zh":"","en":"","allergens":[]}]},{"id":"main","dishes":[]},{"id":"dessert","dishes":[]},{"id":"drink","dishes":[]}]}',
    ].join('\n');
  }

  function parse(text) {
    const cleaned = String(text || '')
      .replace(/```json/gi, '').replace(/```/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    const candidate = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
    let json;
    try {
      json = JSON.parse(candidate);
    } catch (e) {
      throw new Error('DeepSeek 回傳無法解析的內容。The model returned unparseable content.');
    }
    return normalize(json);
  }

  function normalize(json) {
    const byId = {};
    const raw = (json && json.categories) || [];
    raw.forEach(function (c) {
      if (c && c.id) byId[String(c.id).toLowerCase()] = c;
    });
    return D.LOTTERY_CATEGORIES.map(function (cat) {
      const src = byId[cat.id] || {};
      const dishes = (Array.isArray(src.dishes) ? src.dishes : []).map(function (d) {
        if (!d) return null;
        const zh = d.zh ? String(d.zh).trim() : '';
        const en = d.en ? String(d.en).trim() : '';
        if (!zh && !en) return null;
        return { zh: zh, en: en, allergens: normalizeAllergens(d.allergens) };
      }).filter(Boolean);
      return { id: cat.id, zh: cat.zh, en: cat.en, emoji: cat.emoji, dishes: dishes };
    });
  }

  function normalizeAllergens(list) {
    if (!Array.isArray(list)) return [];
    const map = {
      gluten: 'gluten', wheat: 'gluten', '小麥': 'gluten', '麩質': 'gluten',
      dairy: 'dairy', milk: 'dairy', '奶類': 'dairy', '牛奶': 'dairy', '奶': 'dairy',
      egg: 'egg', eggs: 'egg', '蛋': 'egg', '雞蛋': 'egg',
      nuts: 'nuts', nut: 'nuts', '堅果': 'nuts', '果仁': 'nuts',
      shellfish: 'shellfish', '甲殼類': 'shellfish', '蝦': 'shellfish', '蟹': 'shellfish',
      fish: 'fish', '魚': 'fish',
      soy: 'soy', soya: 'soy', soybean: 'soy', '大豆': 'soy', '豆': 'soy',
      sesame: 'sesame', '芝麻': 'sesame',
      peanut: 'peanut', peanuts: 'peanut', '花生': 'peanut',
    };
    const out = [];
    list.forEach(function (x) {
      const key = String(x).toLowerCase().trim();
      const id = map[key];
      if (id && out.indexOf(id) === -1) out.push(id);
    });
    return out;
  }

  return { recognizeMenu: recognizeMenu, readError: readError };
})();
