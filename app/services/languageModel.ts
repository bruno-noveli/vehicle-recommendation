export type LanguageModelAvailability =
  | "available"
  | "downloadable"
  | "downloading"
  | "unavailable"

type LanguageModelApi = {
  availability: () => Promise<LanguageModelAvailability>
  create: (options?: {
    initialPrompts?: {
      role: "system" | "user" | "assistant"
      content: string
    }[]
    monitor?: (monitor: {
      addEventListener: (
        type: "downloadprogress",
        listener: (event: { loaded: number }) => void,
      ) => void
    }) => void
  }) => Promise<{
    prompt: (input: string) => Promise<string>
    destroy?: () => void
  }>
}

function obterLanguageModel() {
  return (globalThis as typeof globalThis & {
    LanguageModel?: LanguageModelApi
  }).LanguageModel
}

export async function verificarDisponibilidade(): Promise<LanguageModelAvailability> {
  const LanguageModel = obterLanguageModel()
  if (!LanguageModel) return "unavailable"
  return LanguageModel.availability()
}

export async function baixarModelo(
  promptSistema: string,
  aoProgredir: (progresso: number) => void,
): Promise<LanguageModelAvailability> {
  const LanguageModel = obterLanguageModel()
  if (!LanguageModel) return "unavailable"

  const session = await LanguageModel.create({
    initialPrompts: [
      {
        role: "system",
        content: promptSistema,
      },
    ],
    monitor(m) {
      m.addEventListener("downloadprogress", (event) => {
        aoProgredir(Math.round(event.loaded * 100))
      })
    },
  })

  const disponibilidade = await LanguageModel.availability()
  session.destroy?.()
  return disponibilidade
}

export async function perguntar(texto: string, promptSistema: string) {
  const LanguageModel = obterLanguageModel()
  if (!LanguageModel) throw new Error("LanguageModel indisponível")

  const session = await LanguageModel.create({
    initialPrompts: [
      {
        role: "system",
        content: promptSistema,
      },
    ],
  })
  return session.prompt(texto)
}
