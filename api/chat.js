export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { message, contexto } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Mensaje requerido' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key no configurada' });
    }

    const systemPrompt = `Eres MediBot, un asistente experto de MediVault, una plataforma de salud cloud.
Respondes en español de forma clara, concisa y profesional.
Usas los datos del contexto para responder con información real del sistema.
Si te preguntan algo que no tiene relación con la plataforma, responde amablemente que solo puedes ayudar con temas de MediVault.

DATOS ACTUALES DEL SISTEMA:
${contexto || 'No hay datos disponibles'}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [
            {
              parts: [{ text: message }]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return res.status(502).json({ error: 'Error al contactar el asistente' });
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No pude procesar tu solicitud.';

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
