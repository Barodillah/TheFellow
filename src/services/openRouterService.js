const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const MODEL = 'google/gemini-3.7-flash';

const fetchOpenRouter = async (systemPrompt, userPrompt, expectJson = false) => {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key is missing. Please check your .env file.');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL,
      response_format: expectJson ? { type: "json_object" } : undefined,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error?.message || 'Failed to fetch from OpenRouter');
  }

  const data = await response.json();
  let content = data.choices[0].message.content;
  
  // If expecting JSON and openrouter model doesn't strictly adhere to response_format,
  // we attempt to parse it out of markdown blocks
  if (expectJson) {
    try {
      if (content.includes('```json')) {
        content = content.split('```json')[1].split('```')[0].trim();
      } else if (content.includes('```')) {
        content = content.split('```')[1].split('```')[0].trim();
      }
      return JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse JSON from AI response:', content);
      throw new Error('AI returned invalid JSON format.');
    }
  }

  return content;
};

export const clarifyProblem = async (problem, context, chatHistory = []) => {
  const systemPrompt = `Anda adalah konsultan pakar Lean Six Sigma. Tugas Anda membedah masalah agar terdefinisi SANGAT JELAS tanpa ambiguitas mencakup elemen (What, Where, When, Who, How Much).

ATURAN PENTING:
1. Baca 'Kendala Utama', 'Konteks', dan 'Riwayat Chat' dengan SANGAT TELITI.
2. JANGAN PERNAH menanyakan pertanyaan yang MAKNA ATAU INTINYA SAMA dengan pertanyaan yang sudah diajukan oleh AI di 'Riwayat Chat', atau informasi yang sudah dijawab oleh user. Gunakan logika deduksi!
3. Jika masalah masih kurang detail, hasilkan MINIMAL 2 dan MAKSIMAL 4 pertanyaan baru.
4. Setiap pertanyaan harus spesifik, tajam, menggali aspek yang BERBEDA (unik), dan berfokus untuk melengkapi data kuantitatif atau spesifik yang masih kosong (misal: jika 'How Much' sudah ada, cari tahu 'Where' atau 'When').
5. Jika seluruh elemen masalah (5W1H) sudah sangat detail, spesifik, dan jelas berdasarkan seluruh informasi yang diberikan, nyatakan isClear: true.

Jawab HANYA dengan JSON object dengan skema berikut:
{
  "isClear": boolean,
  "questions": [
    { "id": "q1", "label": "Pertanyaan (maks 15 kata)", "type": "text|textarea|multiselect", "options": ["opt1", "opt2"] }
  ]
}
Catatan: "options" hanya diisi jika type adalah multiselect.`;

  let userPrompt = `Kendala Utama: "${problem}"\nKonteks: "${context}"\n`;
  if (chatHistory.length > 0) {
    userPrompt += "Riwayat Chat (Klarifikasi Sebelumnya):\n";
    chatHistory.forEach(msg => {
      if (msg.sender === 'ai') {
        userPrompt += `[AI]: ${msg.content}\n`;
        if (msg.form) {
          msg.form.forEach(q => {
            userPrompt += ` - (Pertanyaan yang ditanyakan AI): ${q.label}\n`;
          });
        }
      } else {
        userPrompt += `[USER (Jawaban)]: ${msg.content}\n`;
      }
    });
  }

  return await fetchOpenRouter(systemPrompt, userPrompt, true);
};

export const suggestWhyAnswer = async (problem, currentWhyIndex, pathContext) => {
  const systemPrompt = `Anda fasilitator Root Cause Analysis (5 Whys). Berikan 3 saran singkat dan logis tentang MENGAPA masalah ini terjadi, berdasarkan alur analisis spesifik.
Jawab HANYA dengan JSON array of strings:
["saran 1", "saran 2", "saran 3"]`;

  let userPrompt = `Kendala Awal: "${problem}"\n`;
  if (pathContext && pathContext.length > 0) {
    userPrompt += "Alur Analisis (Path) menuju cabang ini:\n";
    pathContext.forEach((w, i) => {
      userPrompt += `Why ${i+1}: ${w.question} -> ${w.answer}\n`;
    });
  }
  
  const lastAnswer = pathContext && pathContext.length > 0 ? pathContext[pathContext.length-1].answer : problem;
  userPrompt += `\nBerdasarkan alur spesifik di atas, berikan 3 saran lanjutan untuk pertanyaan: "Mengapa '${lastAnswer}' terjadi?"`;

  return await fetchOpenRouter(systemPrompt, userPrompt, true);
};

export const analyzeRootCause = async (problem, whyTreeNodes) => {
  const systemPrompt = `Anda konsultan Lean Six Sigma. Buat kesimpulan Root Cause berdasarkan analisis pohon 5 Whys (Logic Tree) bercabang dari user.`;
  let userPrompt = `Kendala Utama: ${problem}\nPohon Analisis (5 Whys):\n`;
  
  whyTreeNodes.forEach(node => {
    userPrompt += `Level ${node.level} - ${node.question}:\n`;
    if (node.answers && node.answers.length > 0) {
      node.answers.forEach(ans => {
        userPrompt += `   -> ${ans}\n`;
      });
    } else {
      userPrompt += `   -> (Belum dijawab)\n`;
    }
  });

  userPrompt += `\nBuatkan kesimpulan menyeluruh (2-3 paragraf) tentang akar masalah utamanya, merangkum semua cabang analisis di atas.`;

  return await fetchOpenRouter(systemPrompt, userPrompt, false);
};

export const suggestPlan = async (problem, rootCause) => {
  const systemPrompt = `Anda ahli Lean Six Sigma. Berdasarkan akar masalah, sarankan Parameter Kunci (metrics) dan Rencana Aksi (Action Plan).
Jawab HANYA dengan JSON object dengan skema berikut:
{
  "parameters": [
    { "name": "nama parameter (ex: Defect Rate)", "target": "target (ex: < 2%)" }
  ],
  "actionPlans": [
    { "goal": "tindakan SMART", "pic": "Role PIC (ex: Manager Produksi)", "deadlineDays": 7 }
  ]
}`;

  const userPrompt = `Kendala: ${problem}\nAkar Masalah: ${rootCause}\nBerikan 3 saran parameter kunci dan 3 saran rencana aksi.`;

  return await fetchOpenRouter(systemPrompt, userPrompt, true);
};

export const generateFinalEvaluation = async (problem, rootCause, actionEvaluations) => {
  const systemPrompt = `Anda ahli Lean Six Sigma. Tugas Anda adalah mengevaluasi hasil eksekusi PDCA berdasarkan Akar Masalah dan Evaluasi Rencana Aksi dari user.
Kategorikan setiap tindakan menjadi:
1. "retain" (Dipertahankan) untuk tindakan yang berhasil dan patut distandardisasi.
2. "update" (Diperbarui) untuk tindakan yang butuh penyesuaian di siklus berikutnya.
3. "discard" (Dibuang) untuk tindakan yang gagal atau tidak relevan.
Berikan juga ringkasan (summary) evaluasi siklus secara keseluruhan.

Jawab HANYA dengan JSON object dengan skema berikut:
{
  "summary": "String ringkasan evaluasi (max 2 paragraf)",
  "retain": ["tindakan 1", "tindakan 2"],
  "update": ["tindakan 3", "tindakan 4"],
  "discard": ["tindakan 5"]
}`;

  let userPrompt = `Kendala Utama: ${problem}\nAkar Masalah: ${rootCause}\n\nHasil Eksekusi dan Evaluasi Aksi:\n`;
  actionEvaluations.forEach((act, i) => {
    userPrompt += `${i+1}. Aksi: ${act.goal}\n   Status: ${act.status}\n   Evaluasi User: ${act.evaluation}\n`;
  });
  
  return await fetchOpenRouter(systemPrompt, userPrompt, true);
};

export const generateQuizQuestions = async (context, count = 5) => {
  const systemPrompt = `Anda adalah ahli pembuat soal pilihan ganda (multiple choice) untuk menguji pemahaman Standard Operating Procedure, materi training, atau budaya kerja.
Tugas Anda: Buatkan tepat ${count} pertanyaan berdasarkan materi yang diberikan.
Tiap pertanyaan wajib memiliki minimal 3, idealnya 4 opsi jawaban.
Setiap opsi harus diberi skor (misalnya 10 untuk jawaban paling tepat, 5 untuk kurang tepat, 0 untuk salah).
Berikan hasil HANYA dalam JSON array dengan struktur berikut:
[
  {
    "q": "Teks pertanyaan",
    "options": [
      { "text": "Opsi jawaban 1", "score": 10, "label": "A" },
      { "text": "Opsi jawaban 2", "score": 0, "label": "B" }
    ]
  }
]`;

  const userPrompt = `Buatkan ${count} pertanyaan dari materi berikut:\n\n${context}`;

  return await fetchOpenRouter(systemPrompt, userPrompt, true);
};
