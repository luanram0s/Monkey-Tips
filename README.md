# 🐒 Monkey Tips Live – O Analista Automático

**Monkey Tips Live** é um sistema analítico modular que transforma dados esportivos em decisões estratégicas. Atuando como um cérebro operacional, ele coordena, sincroniza e supervisiona todos os módulos ativos do ecossistema, utilizando a IA do Google para gerar insights preditivos de alta precisão para partidas de futebol, basquete e vôlei.

---

## 🧩 Arquitetura e Módulos do Sistema

O sistema é construído sobre uma arquitetura modular, permitindo que cada componente opere de forma independente, mas sincronizada.

1.  **Collector Engine (Motor de Coleta)**
    -   **Função:** Coleta de dados esportivos (pré-jogo e ao vivo).
    -   **Detalhes:** Captura estatísticas em tempo real (simulado) e as envia para o banco de dados local para análise.

2.  **Analyzer Engine (Motor de Análise)**
    -   **Função:** Analisa os dados coletados para detectar padrões de desempenho.
    -   **Tecnologia:** Utiliza o modelo híbrido **DanielScore + Monkey Fusion Engine**, alimentado pela API Gemini, para calcular probabilidades e gerar insights de aposta.

3.  **Live Monitor (Monkey Live Engine)**
    -   **Função:** Detecta eventos em tempo real e envia alertas dinâmicos.
    -   **Status:** Opera com um sistema de cores para indicar o estado das análises: 🟢 Ativo, 🟡 Em processamento, 🔴 Inativo.

4.  **Dashboard (Painel do Analista)**
    -   **Função:** Interface principal para o usuário e painel de analistas.
    -   **Detalhes:** Exibe resultados, logs e status dos módulos, permitindo a interação com todas as ferramentas de IA.

5.  **Admin Panel (Painel Administrativo)**
    -   **Função:** Acesso protegido para controle total sobre os módulos e logs de build.
    -   **Detalhes:** Acompanha sincronizações com a nuvem (simulado) e permite o gerenciamento dos scripts de análise.

---

## ✨ Funcionalidades Principais

-   **Análise de Partida (Deep Dive):** Gera relatórios completos pré-jogo com probabilidades, análise tática e dicas de mercado.
-   **Motor de Basquete Ao Vivo:** Simula uma análise técnica completa para jogos de basquete em tempo real.
-   **Análise de Múltiplas:** Avalia bilhetes com múltiplas seleções e sugere combinações otimizadas para maximizar o valor.
-   **Analisador de Bilhete por Imagem:** Extrai dados de uma imagem de bilhete de aposta e calcula a probabilidade de acerto.
-   **Analista de Voz (Live):** Permite conversação em tempo real com a IA para obter insights rápidos por voz.
-   **Sincronização Vercel:** Simula o monitoramento de builds e deployments, utilizando a IA para gerar relatórios de status.

---

## 🚀 Como Começar

Para acessar o painel de controle, utilize as seguintes credenciais:

-   **Usuário:** `admin`
-   **Senha:** `mtips@2025`

Dentro do sistema, navegue pelas abas para explorar a **Central de Inteligência**, o painel **Monkey Tips AI**, o **Roadmap** do projeto e o **Painel Administrativo**.

---

## 🛠️ Stack de Tecnologia

-   **Frontend:** React, TypeScript, Tailwind CSS
-   **Inteligência Artificial:** Google Gemini API (`gemini-2.5-pro`, `gemini-2.5-flash`)
-   **Build Tool:** Vite
