// Сервер сайта «Без барьеров» + ИИ-помощник на Claude.
//
// Запуск (PowerShell):
//   npm install
//   $env:ANTHROPIC_API_KEY = "ваш-ключ"     ← без ключа бот работает в офлайн-режиме
//   npm start                                → откройте http://localhost:8080
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 8080;
const MODEL = "claude-opus-5-5";
const LANGS = { ru: "русском", ky: "кыргызском", en: "английском" };
const PUBLIC = ["index.html", "css", "js", "photos"]; // отдаём только эти файлы и папки
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml", ".ico": "image/x-icon",
};

/* ---------- Данные карты берём из того же js/data.js, что и сайт ---------- */
async function loadData() {
  const code = await fs.readFile(path.join(ROOT, "js", "data.js"), "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(code, sandbox);
  return sandbox.window;
}

// {ru, ky, en} → текст на нужном языке (или русский, если перевода нет)
const pick = (v, lang) => (v && typeof v === "object" && !Array.isArray(v) ? (v[lang] ?? v.ru) : v);

function buildSystemPrompt(w, lang) {
  const L = (v) => pick(v, lang);
  const places = w.LOCATIONS.map((l) => {
    const [lat, lng] = w.BB_latlng(l);
    return {
      название: L(l.title),
      категория: L(w.CATEGORIES[l.category].label),
      адрес: L(l.address),
      статус: L(w.STATUS[l.status].label),
      что_мешает: L(l.issues) || [],
      что_хорошо: L(l.good) || [],
      барьер_для: l.affects.map((g) => L(w.GROUPS[g].label)),
      совет: L(l.tip) || null,
      координаты: [Number(lat.toFixed(5)), Number(lng.toFixed(5))],
      отзывы: (l.comments || []).map((c) => `${c.name}: ${c.text}`),
    };
  });

  return `Ты — ИИ-помощник сайта «Без барьеров»: это карта доступности района «${L(w.CITY.district)}» (${L(w.CITY.name)}). Волонтёры обошли остановки, парки, государственные здания и общественные места и отметили барьеры для людей на колясках, пожилых людей и родителей с детскими колясками.

Твоя задача — подсказать человеку, куда он может пойти удобно, какие места лучше обойти, и предложить доступную альтернативу рядом.

Как отвечать:
- Отвечай на ${LANGS[lang]} языке — человек выбрал его на сайте. Если он пишет на другом языке, отвечай на языке его сообщения.
- Опирайся только на данные карты ниже. Если места нет в данных, скажи, что его ещё не проверили, и предложи оставить отзыв на карте. Не придумывай места, адреса и факты.
- Называй места точно так, как в поле «название» (вместе с кавычками): по этим названиям сайт показывает кнопки «на карту».
- Учитывай, кто идёт: поле «барьер_для» показывает, кому место неудобно. Если для этой группы барьера нет, место ей подходит. Если неясно, кто идёт, дай общий совет и коротко спроси.
- Расстояния оценивай по координатам примерно и говори «около N метров».
- Отвечай коротко: 2–6 предложений или короткий список. Пиши простыми словами — среди пользователей много пожилых людей. Без заголовков и таблиц; **жирным** выделяй только названия мест.
- Как оставить отзыв: нажать на метку на карте → внизу карточки форма отзывов жителей.

Данные карты (JSON):
${JSON.stringify(places)}`;
}

const DATA = await loadData();
const SYSTEMS = Object.fromEntries(Object.keys(LANGS).map((l) => [l, buildSystemPrompt(DATA, l)]));

/* ---------- Claude: проверяем ключ при запуске ---------- */
let client = null;
let aiOn = false;
try {
  client = new Anthropic(); // берёт ANTHROPIC_API_KEY из окружения
  await client.models.retrieve(MODEL);
  aiOn = true;
} catch (err) {
  aiOn = false;
  if (process.env.ANTHROPIC_API_KEY) console.error("Не удалось подключиться к Claude:", err.message);
}

function cleanMessages(raw) {
  if (!Array.isArray(raw)) return null;
  const msgs = raw
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  while (msgs.length && msgs[0].role !== "user") msgs.shift();
  return msgs.length && msgs[msgs.length - 1].role === "user" ? msgs : null;
}

const REFUSAL = {
  ru: "Извините, с этим я помочь не могу. Спросите меня о местах на карте 🙂",
  ky: "Кечириңиз, буга жардам бере албайм. Картадагы жерлер тууралуу сураңыз 🙂",
  en: "Sorry, I can’t help with that. Ask me about places on the map 🙂",
};

async function askClaude(messages, lang) {
  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default", // если модель откажет, запрос сам перейдёт на запасную модель
    output_config: { effort: "low" }, // чат: быстрые короткие ответы
    system: [{ type: "text", text: SYSTEMS[lang], cache_control: { type: "ephemeral" } }],
    messages,
  });
  if (response.stop_reason === "refusal") return REFUSAL[lang];
  const text = response.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
  return text || REFUSAL[lang];
}

/* ---------- HTTP ---------- */
function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(typeof body === "string" ? body : JSON.stringify(body));
}

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 64_000) throw new Error("body_too_large");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

async function handleChat(req, res) {
  if (!aiOn) return send(res, 503, { error: "no_api_key" });
  const body = await readJson(req);
  const messages = cleanMessages(body.messages);
  if (!messages) return send(res, 400, { error: "bad_messages" });
  const lang = LANGS[body.lang] ? body.lang : "ru";
  try {
    return send(res, 200, { reply: await askClaude(messages, lang) });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      aiOn = false;
      console.error("Ключ API не подошёл:", err.message);
      return send(res, 503, { error: "auth" });
    }
    if (err instanceof Anthropic.RateLimitError) return send(res, 429, { error: "rate_limited" });
    if (err instanceof Anthropic.APIError) {
      console.error(`Claude API ${err.status}:`, err.message);
      return send(res, 502, { error: "api_error" });
    }
    throw err;
  }
}

async function handleStatic(url, res) {
  const rel = decodeURIComponent(url.pathname).replace(/^\/+/, "") || "index.html";
  const file = path.resolve(ROOT, rel);
  const type = TYPES[path.extname(file).toLowerCase()];
  if (!PUBLIC.includes(rel.split("/")[0]) || !file.startsWith(ROOT + path.sep) || !type) {
    return send(res, 404, "Not found", "text/plain; charset=utf-8");
  }
  const data = await fs.readFile(file);
  res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-cache" }); // всегда свежие файлы
  res.end(data);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  try {
    if (url.pathname === "/api/health") return send(res, 200, { ai: aiOn, model: aiOn ? MODEL : null });
    if (url.pathname === "/api/chat" && req.method === "POST") return await handleChat(req, res);
    return await handleStatic(url, res);
  } catch (err) {
    if (err.code === "ENOENT" || err.code === "EISDIR") return send(res, 404, "Not found", "text/plain; charset=utf-8");
    console.error(err);
    if (!res.headersSent) send(res, 500, { error: "server_error" });
  }
});

server.listen(PORT, () => {
  console.log(`«Без барьеров» запущен: http://localhost:${PORT}`);
  console.log(aiOn ? `ИИ-помощник: Claude (${MODEL})` : "ИИ-помощник: офлайн-режим (нет ключа ANTHROPIC_API_KEY)");
});
