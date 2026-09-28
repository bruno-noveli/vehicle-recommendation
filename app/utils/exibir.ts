export function exibir(textoResposta: string) {
  const semCerca = textoResposta
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
  const inicio = semCerca.indexOf("{")
  const fim = semCerca.lastIndexOf("}")
  const json = semCerca.slice(inicio, fim + 1).replace(/,\s*([}\]])/g, "$1")
  const dados = JSON.parse(json)
  const linhas: string[] = ["recomendacoes", ""]

  for (const item of dados.recomendacoes ?? []) {
    linhas.push(`marca: ${item.marca}`)
    linhas.push(`modelo: ${item.modelo}`)
    linhas.push(`motivo: ${item.motivo}`)
    linhas.push(`vantagens: ${(item.vantagens ?? []).join(", ")}`)
    linhas.push(`desvantagens: ${(item.desvantagens ?? []).join(", ")}`)
    linhas.push("")
  }

  linhas.push("filtros")
  for (const [chave, valor] of Object.entries(dados.filtros ?? {})) {
    linhas.push(`${chave}: ${valor}`)
  }

  return linhas.join("\n")
}
