// Built-in cuisine / dish / allergen data.
// Google Places does not return menus, so menus and allergens are templates here.
window.D = (function () {
  const ALLERGENS = [
    { id: 'gluten', zh: '麩質', en: 'Gluten' },
    { id: 'dairy', zh: '奶類', en: 'Dairy' },
    { id: 'egg', zh: '蛋', en: 'Egg' },
    { id: 'nuts', zh: '堅果', en: 'Nuts' },
    { id: 'shellfish', zh: '甲殼類', en: 'Shellfish' },
    { id: 'fish', zh: '魚', en: 'Fish' },
    { id: 'soy', zh: '大豆', en: 'Soy' },
    { id: 'sesame', zh: '芝麻', en: 'Sesame' },
    { id: 'peanut', zh: '花生', en: 'Peanut' },
  ];

  // Fixed lottery ticket buckets — a menu photo is sorted into these four.
  const LOTTERY_CATEGORIES = [
    { id: 'appetizer', zh: '前菜', en: 'Appetizer', emoji: '🥗' },
    { id: 'main', zh: '主食', en: 'Main', emoji: '🍚' },
    { id: 'dessert', zh: '甜品', en: 'Dessert', emoji: '🍰' },
    { id: 'drink', zh: '飲料', en: 'Drink', emoji: '🥤' },
  ];

  const d = (zh, en, allergens) => ({ zh: zh, en: en, allergens: allergens || [] });

  const CUISINES = [
    {
      id: 'chinese', zh: '中菜', en: 'Chinese', emoji: '🥢',
      keyword: 'Chinese restaurant', placesTypes: ['chinese_restaurant'],
      dishCategories: [
        { id: 'congee', zh: '粥', en: 'Congee', dishes: [d('皮蛋瘦肉粥', 'Pork & century-egg congee', ['egg', 'soy']), d('魚片粥', 'Fish congee', ['fish']), d('艇仔粥', 'Sampan congee', ['shellfish', 'peanut'])] },
        { id: 'noodles', zh: '粉麵', en: 'Noodles', dishes: [d('雲吞麵', 'Wonton noodles', ['gluten', 'egg', 'shellfish']), d('乾炒牛河', 'Beef ho-fun', ['gluten', 'soy']), d('叉燒湯麵', 'Char-siu soup noodles', ['gluten', 'egg'])] },
        { id: 'rice', zh: '飯', en: 'Rice', dishes: [d('揚州炒飯', 'Yangzhou fried rice', ['egg', 'soy']), d('煲仔飯', 'Claypot rice', ['soy']), d('豉油雞飯', 'Soy chicken rice', ['soy'])] },
      ],
      slotDishes: [
        d('皮蛋瘦肉粥', 'Pork & century-egg congee', ['egg', 'soy']),
        d('魚片粥', 'Fish congee', ['fish']),
        d('艇仔粥', 'Sampan congee', ['shellfish', 'peanut']),
        d('雲吞麵', 'Wonton noodles', ['gluten', 'egg', 'shellfish']),
        d('乾炒牛河', 'Beef ho-fun', ['gluten', 'soy']),
        d('叉燒湯麵', 'Char-siu soup noodles', ['gluten', 'egg']),
        d('揚州炒飯', 'Yangzhou fried rice', ['egg', 'soy']),
        d('煲仔飯', 'Claypot rice', ['soy']),
        d('豉油雞飯', 'Soy chicken rice', ['soy']),
        d('叉燒包', 'Char siu bun', ['gluten']),
        d('蝦餃', 'Shrimp dumpling', ['shellfish', 'gluten']),
      ],
    },
    {
      id: 'thai', zh: '泰菜', en: 'Thai', emoji: '🌶️',
      keyword: 'Thai restaurant', placesTypes: ['thai_restaurant'],
      dishCategories: [
        { id: 'congee', zh: '粥', en: 'Congee', dishes: [d('泰式魚肉粥', 'Thai fish congee', ['fish']), d('鮮蝦粥', 'Prawn congee', ['shellfish'])] },
        { id: 'noodles', zh: '粉麵', en: 'Noodles', dishes: [d('冬陰功湯粉', 'Tom yum noodles', ['shellfish', 'fish']), d('泰式炒金邊粉', 'Pad thai', ['gluten', 'egg', 'peanut']), d('泰式船河', 'Boat noodles', ['gluten', 'soy'])] },
        { id: 'rice', zh: '飯', en: 'Rice', dishes: [d('菠蘿炒飯', 'Pineapple fried rice', ['egg', 'soy', 'nuts']), d('泰式海南雞飯', 'Hainanese chicken rice', ['soy', 'gluten']), d('綠咖喱雞飯', 'Green curry chicken rice', ['dairy', 'fish'])] },
      ],
      slotDishes: [
        d('泰式魚肉粥', 'Thai fish congee', ['fish']),
        d('鮮蝦粥', 'Prawn congee', ['shellfish']),
        d('冬陰功湯粉', 'Tom yum noodles', ['shellfish', 'fish']),
        d('泰式炒金邊粉', 'Pad thai', ['gluten', 'egg', 'peanut']),
        d('泰式船河', 'Boat noodles', ['gluten', 'soy']),
        d('菠蘿炒飯', 'Pineapple fried rice', ['egg', 'soy', 'nuts']),
        d('泰式海南雞飯', 'Hainanese chicken rice', ['soy', 'gluten']),
        d('綠咖喱雞飯', 'Green curry chicken rice', ['dairy', 'fish']),
        d('冬陰功湯', 'Tom yum soup', ['shellfish', 'fish']),
        d('芒果糯米飯', 'Mango sticky rice', ['dairy']),
      ],
    },
    {
      id: 'western', zh: '西餐', en: 'Western', emoji: '🍔',
      keyword: 'Western restaurant', placesTypes: [],
      dishCategories: [
        { id: 'noodles', zh: '麵類', en: 'Noodles', dishes: [d('忌廉蘑菇意粉', 'Creamy mushroom pasta', ['gluten', 'dairy']), d('芝士通心粉', 'Mac & cheese', ['gluten', 'dairy'])] },
        { id: 'potato', zh: '薯類', en: 'Potato', dishes: [d('炸薯條', 'French fries', []), d('焗薯蓉', 'Mashed potato', ['dairy']), d('薯仔沙律', 'Potato salad', ['egg'])] },
        { id: 'bread', zh: '麵包', en: 'Bread', dishes: [d('漢堡包', 'Burger', ['gluten', 'egg']), d('三文治', 'Sandwich', ['gluten', 'egg', 'dairy']), d('蒜蓉包', 'Garlic bread', ['gluten', 'dairy'])] },
        { id: 'rice', zh: '飯類', en: 'Rice', dishes: [d('忌廉雞皇飯', 'Creamy chicken rice', ['dairy', 'gluten']), d('西班牙海鮮飯', 'Seafood paella', ['shellfish', 'fish'])] },
      ],
      slotDishes: [
        d('忌廉蘑菇意粉', 'Creamy mushroom pasta', ['gluten', 'dairy']),
        d('芝士通心粉', 'Mac & cheese', ['gluten', 'dairy']),
        d('炸薯條', 'French fries', []),
        d('焗薯蓉', 'Mashed potato', ['dairy']),
        d('薯仔沙律', 'Potato salad', ['egg']),
        d('漢堡包', 'Burger', ['gluten', 'egg']),
        d('三文治', 'Sandwich', ['gluten', 'egg', 'dairy']),
        d('蒜蓉包', 'Garlic bread', ['gluten', 'dairy']),
        d('忌廉雞皇飯', 'Creamy chicken rice', ['dairy', 'gluten']),
        d('西班牙海鮮飯', 'Seafood paella', ['shellfish', 'fish']),
        d('香煎牛扒', 'Grilled steak', []),
        d('烤雞', 'Roast chicken', []),
      ],
    },
    {
      id: 'japanese', zh: '日菜', en: 'Japanese', emoji: '🍣',
      keyword: 'Japanese restaurant', placesTypes: ['japanese_restaurant'],
      dishCategories: [
        { id: 'rice', zh: '飯', en: 'Rice', dishes: [d('壽司拼盤', 'Sushi platter', ['fish', 'soy']), d('鰻魚飯', 'Eel rice', ['fish', 'soy']), d('咖喱吉列豬扒飯', 'Katsu curry rice', ['gluten', 'egg'])] },
        { id: 'noodles', zh: '麵', en: 'Noodles', dishes: [d('豚骨拉麵', 'Tonkotsu ramen', ['gluten', 'egg']), d('蕎麥麵', 'Soba', ['gluten']), d('烏冬', 'Udon', ['gluten', 'soy'])] },
        { id: 'congee', zh: '粥', en: 'Congee', dishes: [d('鮭魚茶漬飯', 'Salmon ochazuke', ['fish', 'soy']), d('明太子粥', 'Mentaiko congee', ['fish', 'soy'])] },
      ],
      slotDishes: [
        d('壽司拼盤', 'Sushi platter', ['fish', 'soy']),
        d('鰻魚飯', 'Eel rice', ['fish', 'soy']),
        d('咖喱吉列豬扒飯', 'Katsu curry rice', ['gluten', 'egg']),
        d('豚骨拉麵', 'Tonkotsu ramen', ['gluten', 'egg']),
        d('蕎麥麵', 'Soba', ['gluten']),
        d('烏冬', 'Udon', ['gluten', 'soy']),
        d('鮭魚茶漬飯', 'Salmon ochazuke', ['fish', 'soy']),
        d('明太子粥', 'Mentaiko congee', ['fish', 'soy']),
        d('天婦羅', 'Tempura', ['gluten', 'shellfish']),
        d('日式煎餃', 'Gyoza', ['gluten', 'soy']),
      ],
    },
    {
      id: 'korean', zh: '韓菜', en: 'Korean', emoji: '🍖',
      keyword: 'Korean restaurant', placesTypes: ['korean_restaurant'],
      dishCategories: [
        { id: 'rice', zh: '飯', en: 'Rice', dishes: [d('石鍋拌飯', 'Bibimbap', ['egg', 'soy', 'sesame']), d('泡菜炒飯', 'Kimchi fried rice', ['egg', 'soy']), d('韓式炸雞飯', 'Korean fried chicken rice', ['gluten', 'egg', 'soy'])] },
        { id: 'noodles', zh: '麵', en: 'Noodles', dishes: [d('韓式冷麵', 'Naengmyeon', ['gluten', 'egg', 'soy']), d('炸醬麵', 'Jajangmyeon', ['gluten', 'soy']), d('部隊鍋麵', 'Budae-jjigae noodles', ['gluten', 'soy'])] },
        { id: 'congee', zh: '粥', en: 'Congee', dishes: [d('韓式南瓜粥', 'Pumpkin congee', []), d('鮑魚粥', 'Abalone congee', ['shellfish'])] },
      ],
      slotDishes: [
        d('石鍋拌飯', 'Bibimbap', ['egg', 'soy', 'sesame']),
        d('泡菜炒飯', 'Kimchi fried rice', ['egg', 'soy']),
        d('韓式炸雞飯', 'Korean fried chicken rice', ['gluten', 'egg', 'soy']),
        d('韓式冷麵', 'Naengmyeon', ['gluten', 'egg', 'soy']),
        d('炸醬麵', 'Jajangmyeon', ['gluten', 'soy']),
        d('部隊鍋麵', 'Budae-jjigae noodles', ['gluten', 'soy']),
        d('韓式南瓜粥', 'Pumpkin congee', []),
        d('鮑魚粥', 'Abalone congee', ['shellfish']),
        d('韓式燒肉', 'Korean BBQ', ['soy']),
        d('泡菜煎餅', 'Kimchi pancake', ['gluten']),
      ],
    },
    {
      id: 'italian', zh: '意大利菜', en: 'Italian', emoji: '🍝',
      keyword: 'Italian restaurant', placesTypes: ['italian_restaurant'],
      dishCategories: [
        { id: 'pasta', zh: '意粉', en: 'Pasta', dishes: [d('卡邦尼意粉', 'Carbonara', ['gluten', 'egg', 'dairy']), d('番茄肉醬意粉', 'Bolognese', ['gluten']), d('蒜香欖油意粉', 'Aglio e olio', ['gluten'])] },
        { id: 'pizza', zh: '薄餅', en: 'Pizza', dishes: [d('瑪格麗特薄餅', 'Margherita pizza', ['gluten', 'dairy']), d('夏威夷薄餅', 'Hawaiian pizza', ['gluten', 'dairy'])] },
        { id: 'risotto', zh: '燴飯', en: 'Risotto', dishes: [d('野菌燴飯', 'Mushroom risotto', ['dairy']), d('海鮮燴飯', 'Seafood risotto', ['shellfish', 'dairy'])] },
      ],
      slotDishes: [
        d('卡邦尼意粉', 'Carbonara', ['gluten', 'egg', 'dairy']),
        d('番茄肉醬意粉', 'Bolognese', ['gluten']),
        d('蒜香欖油意粉', 'Aglio e olio', ['gluten']),
        d('瑪格麗特薄餅', 'Margherita pizza', ['gluten', 'dairy']),
        d('夏威夷薄餅', 'Hawaiian pizza', ['gluten', 'dairy']),
        d('野菌燴飯', 'Mushroom risotto', ['dairy']),
        d('海鮮燴飯', 'Seafood risotto', ['shellfish', 'dairy']),
        d('千層麵', 'Lasagna', ['gluten', 'dairy']),
      ],
    },
    {
      id: 'french', zh: '法國菜', en: 'French', emoji: '🥖',
      keyword: 'French restaurant', placesTypes: ['french_restaurant'],
      dishCategories: [
        { id: 'bread', zh: '麵包', en: 'Bread', dishes: [d('牛角包', 'Croissant', ['gluten', 'dairy', 'egg']), d('法式長包', 'Baguette', ['gluten']), d('法式多士', 'French toast', ['gluten', 'dairy', 'egg'])] },
        { id: 'potato', zh: '薯仔', en: 'Potato', dishes: [d('法式焗薯', 'Gratin potatoes', ['dairy']), d('薯蓉', 'Mashed potato', ['dairy']), d('香草烤薯', 'Herb roasted potato', [])] },
      ],
      slotDishes: [
        d('牛角包', 'Croissant', ['gluten', 'dairy', 'egg']),
        d('法式長包', 'Baguette', ['gluten']),
        d('法式多士', 'French toast', ['gluten', 'dairy', 'egg']),
        d('法式焗薯', 'Gratin potatoes', ['dairy']),
        d('薯蓉', 'Mashed potato', ['dairy']),
        d('香草烤薯', 'Herb roasted potato', []),
        d('法式蝸牛', 'Escargot', ['dairy']),
        d('油封鴨', 'Duck confit', []),
      ],
    },
  ];

  // (legacy, unused) Built-in lottery menus — the lottery now uses DeepSeek menu recognition.
  const LOTTERY = {
    chinese: {
      cold: [d('涼拌青瓜', 'Smashed cucumber', ['sesame']), d('口水雞', 'Saliva chicken', ['peanut', 'sesame', 'soy']), d('皮蛋豆腐', 'Century-egg tofu', ['soy', 'egg'])],
      veg: [d('蒜蓉炒菜心', 'Garlic choy-sum', ['soy']), d('上湯浸時蔬', 'Vegetables in broth', ['soy']), d('乾煸四季豆', 'Dry-fried green beans', ['soy', 'peanut'])],
      dessert: [d('紅豆沙', 'Red bean soup', []), d('楊枝甘露', 'Mango pomelo sago', ['dairy', 'nuts']), d('蛋撻', 'Egg tart', ['gluten', 'egg', 'dairy'])],
      drink: [d('凍檸茶', 'Iced lemon tea', []), d('豆漿', 'Soy milk', ['soy']), d('珍珠奶茶', 'Bubble tea', ['dairy'])],
    },
    thai: {
      cold: [d('青木瓜沙律', 'Green papaya salad', ['peanut', 'fish', 'shellfish']), d('泰式涼拌粉絲', 'Yum woon sen', ['fish', 'soy'])],
      veg: [d('泰式炒通菜', 'Stir-fried water spinach', ['fish', 'soy']), d('椰香咖喱雜菜', 'Veg green curry', ['dairy', 'soy'])],
      dessert: [d('芒果糯米飯', 'Mango sticky rice', ['dairy']), d('椰汁西米糕', 'Coconut sago pudding', ['dairy'])],
      drink: [d('泰式奶茶', 'Thai milk tea', ['dairy']), d('青檸梳打', 'Lime soda', [])],
    },
    western: {
      cold: [d('凱撒沙律', 'Caesar salad', ['egg', 'dairy', 'gluten', 'fish']), d('火腿芝士拼盤', 'Ham & cheese platter', ['dairy'])],
      veg: [d('香烤雜菜', 'Roasted vegetables', []), d('忌廉菠菜', 'Creamed spinach', ['dairy'])],
      dessert: [d('芝士蛋糕', 'Cheesecake', ['dairy', 'gluten', 'egg']), d('朱古力布朗尼', 'Chocolate brownie', ['dairy', 'gluten', 'egg', 'nuts'])],
      drink: [d('鮮榨橙汁', 'Fresh orange juice', []), d('咖啡', 'Coffee', ['dairy'])],
    },
    japanese: {
      cold: [d('枝豆', 'Edamame', ['soy']), d('玉子燒', 'Tamagoyaki', ['egg', 'soy']), d('蟹籽沙律', 'Crab roe salad', ['shellfish', 'egg'])],
      veg: [d('日式燉雜菜', 'Nimono vegetables', ['soy']), d('芝麻菠菜', 'Sesame spinach', ['sesame', 'soy'])],
      dessert: [d('抹茶大福', 'Matcha mochi', ['gluten', 'soy']), d('日式芝士蛋糕', 'Japanese cheesecake', ['dairy', 'gluten', 'egg'])],
      drink: [d('玄米茶', 'Genmaicha', []), d('抹茶拿鐵', 'Matcha latte', ['dairy'])],
    },
    korean: {
      cold: [d('韓式泡菜', 'Kimchi', ['fish', 'shellfish']), d('涼拌豆芽', 'Bean sprout salad', ['soy', 'sesame'])],
      veg: [d('韓式炒雜菜', 'Japchae', ['soy', 'sesame', 'gluten']), d('海帶湯', 'Seaweed soup', ['soy'])],
      dessert: [d('韓式蜜糖脆餅', 'Hotteok', ['gluten']), d('紅豆刨冰', 'Patbingsu', ['dairy'])],
      drink: [d('韓式柚子茶', 'Yuja tea', []), d('米酒', 'Makgeolli', [])],
    },
    italian: {
      cold: [d('番茄水牛芝士沙律', 'Caprese', ['dairy']), d('香蒜欖油蝦', 'Garlic shrimp', ['shellfish'])],
      veg: [d('烤時蔬', 'Grilled vegetables', []), d('意式雜菜湯', 'Minestrone', ['gluten'])],
      dessert: [d('提拉米蘇', 'Tiramisu', ['dairy', 'gluten', 'egg']), d('意式奶凍', 'Panna cotta', ['dairy'])],
      drink: [d('意式濃縮咖啡', 'Espresso', []), d('氣泡水', 'Sparkling water', [])],
    },
    french: {
      cold: [d('法式洋葱湯', 'French onion soup', ['gluten', 'dairy']), d('煙三文魚沙律', 'Smoked salmon salad', ['fish'])],
      veg: [d('焗雜菜', 'Gratin vegetables', ['dairy']), d('忌廉蘑菇', 'Creamed mushrooms', ['dairy'])],
      dessert: [d('焦糖布甸', 'Crème brûlée', ['egg', 'dairy']), d('馬卡龍', 'Macaron', ['nuts', 'egg'])],
      drink: [d('法式咖啡', 'Café', ['dairy']), d('紅酒', 'Red wine', [])],
    },
  };

  function randomOf(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function allergenByIds(ids) { return ids.map(function (id) { return ALLERGENS.find(function (a) { return a.id === id; }); }).filter(Boolean); }
  function lotteryMenu(cuisine) {
    const x = LOTTERY[cuisine.id] || { cold: [], veg: [], dessert: [], drink: [] };
    const mains = cuisine.dishCategories.reduce(function (acc, c) { return acc.concat(c.dishes); }, []);
    return [
      { id: 'cold', zh: '涼菜', en: 'Cold', dishes: x.cold },
      { id: 'veg', zh: '蔬菜', en: 'Veg', dishes: x.veg },
      { id: 'main', zh: '主食', en: 'Main', dishes: mains },
      { id: 'dessert', zh: '甜品', en: 'Dessert', dishes: x.dessert },
      { id: 'drink', zh: '飲料', en: 'Drink', dishes: x.drink },
    ];
  }

  return { ALLERGENS: ALLERGENS, CUISINES: CUISINES, LOTTERY_CATEGORIES: LOTTERY_CATEGORIES, randomOf: randomOf, allergenByIds: allergenByIds };
})();
