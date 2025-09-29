// src/lib/translate.ts
export async function translateText(text: string, targetLang: string) {
  const res = await fetch("https://libretranslate.de/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      q: text,
      source: "auto",
      target: targetLang,
      format: "text"
    })
  });

  if (!res.ok) {
    throw new Error("Translation failed");
  }

  return res.json();
}
