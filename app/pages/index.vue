<template>
  <main>
    <p v-if="disponibilidade === 'available'">
      Gemini Nano disponível
    </p>
    <p v-else-if="disponibilidade === 'downloadable'">
      Gemini Nano precisa ser baixado
    </p>
    <p v-else-if="disponibilidade === 'downloading'">
      Gemini Nano está sendo baixado
    </p>
    <p v-else-if="disponibilidade === 'unavailable'">
      Gemini Nano não está disponível neste navegador
    </p>
    <div v-if="disponibilidade === 'available'" class="disponivel">
      <input
        v-model="texto"
        type="text"
        placeholder="Digite um texto"
        @keyup.enter="enviar"
      />
      <button type="button" :disabled="carregando" @click="enviar">Enviar</button>
      <p v-if="carregando">Carregando...</p>
      <p v-else-if="resposta">{{ resposta }}</p>
    </div>
    <button
      v-else-if="disponibilidade === 'downloadable'"
      type="button"
      :disabled="baixando"
      @click="baixar"
    >
      {{ baixando ? `Baixando... ${progresso}%` : "Baixar Gemini Nano" }}
    </button>
  </main>
</template>

<script setup lang="ts">
import { promptInicial } from "~/prompts/promptInicial";
import { baixarModelo, perguntar, verificarDisponibilidade, type LanguageModelAvailability } from "~/services/languageModel";

const texto = ref("");
const resposta = ref("");
const carregando = ref(false);
const baixando = ref(false);
const progresso = ref(0);
const disponibilidade = ref<LanguageModelAvailability | null>(null);

onMounted(async () => {
  disponibilidade.value = await verificarDisponibilidade();
  console.log(disponibilidade.value);
});

async function baixar() {
  baixando.value = true;
  progresso.value = 0;
  try {
    disponibilidade.value = await baixarModelo(promptInicial, (valor) => {
      progresso.value = valor;
    });
  } finally {
    baixando.value = false;
  }
}

async function enviar() {
  const textoDoInput = texto.value;
  carregando.value = true;
  resposta.value = "";
  try {
    const response = await perguntar(textoDoInput, promptInicial);
    try {
      resposta.value = exibir(response);
    } catch {
      resposta.value = response;
    }
  } finally {
    carregando.value = false;
  }
}
</script>

<style scoped>
main,
.disponivel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

main {
  min-height: 100vh;
  justify-content: center;
}

input,
button {
  font: inherit;
  font-size: 1rem;
}

input {
  width: min(32rem, 90vw);
  padding: 0.75rem 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}

button {
  padding: 0.75rem 1.25rem;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
}

p {
  width: min(32rem, 90vw);
  margin: 0;
  white-space: pre-wrap;
}
</style>
