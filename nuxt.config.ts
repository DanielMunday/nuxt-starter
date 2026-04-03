export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  runtimeConfig: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
  },
  nitro: {
    experimental: {
      wasm: false,
    },
  },
  app: {
    head: {
      title: "Arquitectura IA — Oficina Inteligente",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "Sistema de agentes IA para oficina de arquitectura y urbanismo",
        },
      ],
      link: [
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
        },
      ],
    },
  },
});
