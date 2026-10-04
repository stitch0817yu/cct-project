# 食乜好？What to Eat? 🍜

把「揀餐廳」變成遊戲，減低選擇壓力。A gamified restaurant-picker that removes the stress of choosing, powered by **Google Places API**.

三種玩法 / Three modes:

| 模式 Mode | 玩法 Play |
| --- | --- |
| 🎰 老虎機 Slot | 完全無頭緒時拉桿，抽出「國菜 → 菜式 → 餐廳」並一鍵導航 |
| 🥚 扭蛋 Gachapon | 揀定菜系後扭出扭蛋，抽出三間高分餐廳、餐牌及通知餐廳功能 |
| 🎟️ 彩票 Lottery | 影低餐牌（DeepSeek AI 分類）或手動按分類輸入菜式，再拖曳刮開銀色彩票揭曉餐單 |

## 執行 Running

這是一個純靜態網頁（vanilla HTML/CSS/JS），無需安裝任何依賴。**必須以 HTTP 伺服器開啟**（Google Places 需要 HTTP origin，`file://` 無法使用）。

```bash
# 任選其一 / any one:
python -m http.server 8000
# 或 npx serve .
```

然後開啟 http://localhost:8000 ，並允許瀏覽器的定位權限。

## API 金鑰設定 API key setup

金鑰不再儲存在程式碼內。第一次開啟頁面時，會彈出「🔑 API 金鑰」視窗，請輸入：

1. **Google Places API 金鑰**（必填）——需已啟用 **Places API (New)**，並設定 **HTTP 參照來源（referrer）限制**，允許你伺服器的來源（例如 `http://localhost:8000/*`）。
2. **DeepSeek API 金鑰**（可選）——只有彩票「影餐牌」的相片辨識需要。

金鑰只會儲存在你瀏覽器的 `localStorage`，不會上載。之後可隨時按右上角「🔑 金鑰」更改。亦可經網址參數預先帶入：`?google_place_key=…&deepseek_key=…`（載入後會自動從網址移除並存入本機）。

> 若你的 Google 金鑰只啟用了舊版 Places API，`js/api.js` 已內建自動 fallback 到舊版端點，通常可直接運作。

## 檔案結構 Files

```
index.html           單頁外殼 / single-page shell
assets/slot-machine.svg  老虎機插圖 / slot machine illustration
assets/gachapon-machine.svg  扭蛋機插圖 / gachapon machine illustration
css/styles.css       樣式、動畫、響應式 / theme, animations, responsive
js/config.js         設定與預設值 / config & defaults
js/keys.js           API 金鑰輸入與 localStorage / API key entry & storage
js/data.js           菜系／菜式／致敏原資料庫 / cuisine, dish & allergen data
js/api.js            Google Places 包裝器 / Places API wrapper (new + legacy)
js/deepseek.js       餐牌辨識 / DeepSeek menu recognition (vision)
js/ui.js             共用 UI、位置控制、餐廳卡片 / shared UI & helpers
js/mode-slot.js      老虎機 / slot machine
js/mode-gacha.js     扭蛋 / gachapon
js/mode-lottery.js   彩票 / lottery
js/app.js            入口與路由 / entry & wiring
```

## 注意事項 Notes

- 餐廳搜尋、評分、距離、營業狀態、相片、電話來自 Google Places；**扭蛋（Gachapon）的餐牌為內建範本**（Google 不提供餐牌資料），**彩票（Lottery）的餐牌與致敏原由 DeepSeek 從餐牌相片辨識，亦可手動按前菜／主食／甜品／飲料逐項輸入**。
- 「通知餐廳」會根據所選致敏原／位置／活動組成一則訊息，可複製或致電（若 Google 提供電話）。
- 西餐（Western）在 Google 無精確分類，會以文字搜尋近似；結果為盡力匹配。
- 地理位置於 `file://` 或非 localhost 的非 HTTPS 環境下可能無法取得，此時會改用預設位置（香港），可點右上角位置按鈕手動設定。
