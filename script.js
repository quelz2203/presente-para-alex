"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const welcome = document.getElementById("welcome");
    const voiceScene = document.getElementById("voice-scene");
    const artScene = document.getElementById("art-scene");

    const introText = document.getElementById("intro-text");
    const continueButton = document.getElementById("continue-button");
    const retryButton = document.getElementById("audio-retry");
    const revealButton = document.getElementById("reveal-button");
    const restartButton = document.getElementById("restart-button");

    const audio = document.getElementById("wanderer-audio");
    const messageMusic = document.getElementById("message-music");
    const artMusic = document.getElementById("art-music");
    const subtitle = document.getElementById("subtitle");

    const musicToggle = document.getElementById("music-toggle");
    const musicToggleIcon = document.getElementById("music-toggle-icon");
    const vinylDisc = document.getElementById("vinyl-disc");

    const musicTitle = document.getElementById("music-title");
    const musicArtist = document.getElementById("music-artist");

    const gallery = document.getElementById("art-gallery");
    const slides = Array.from(document.querySelectorAll(".gallery-slide"));
    const galleryDots = Array.from(document.querySelectorAll(".gallery-dot"));
    const galleryPrev = document.getElementById("gallery-prev");
    const galleryNext = document.getElementById("gallery-next");
    const galleryCounter = document.getElementById("gallery-counter");
    const downloadArt = document.getElementById("download-art");
    const imageViewer = document.getElementById("image-viewer");
    const imageViewerBackdrop = document.getElementById("image-viewer-backdrop");
    const imageViewerBack = document.getElementById("image-viewer-back");
    const imageViewerImage = document.getElementById("image-viewer-image");
    const imageViewerCaption = document.getElementById("image-viewer-caption");

    const openLettersButton = document.getElementById("open-letters");
    const letterOverlay = document.getElementById("letter-overlay");
    const letterBackdrop = document.getElementById("letter-backdrop");
    const closeLettersButton = document.getElementById("close-letters");
    const letterText = document.getElementById("letter-text");
    const letterModalTitle = document.getElementById("letter-modal-title");
    const letterTabs = Array.from(document.querySelectorAll(".letter-tab"));
    const nextLetterButton = document.getElementById("next-letter");
    const letterPaper = document.getElementById("letter-content");

    const originalMessage =
        "Fico feliz que tenha caído aqui, uma pessoa tem algo a lhe dizer...";

    const subtitles = [
        {
            time: 0,
            text: "Dê-me sua mão. Heh, não precisa ficar nervoso. Só vou levar você a um lugar com uma bela vista."
        },
        {
            time: 9,
            text: "E então? A paisagem daqui deve ser de tirar o fôlego. Não precisa agradecer — vejo pouco sentido nisso."
        }
    ];

    // Textos das cartas: mantidos conforme enviados.
    const letters = [
        {
            title: "Carta 1",
            text: `Primeiramente, eu sou muito ansiosa e não ia conseguir segurar essa parte do presente por mais tempo principalmente porque fiquei angustiada sobre a Mei e sobre ter interpretado (eu acho) parte do design um pouco errado, então já quero pedir desculpas pela minha interpretação literal sobre as referências que você mandou pelo meu papagaio. E quero dizer que essas artes são interpretações minhas, talvez o cabelo e olho possam estar certos e aí dá pra dar a desculpa que ela trocou de roupa, olha que maravilha! mas enfim, vou explicar um pouquinho.

Imaginei o cabelo da forma que você desenhou no papel, com algumas ondas e leve volume, porque me lembra o jing yuan e porque as jubas são muito características em felinos, que foi a referência que você deu lá no comecinho, pelo que eu lembro.

Os olhos tentei manter a ideia de serem parecidos com os olhos do xiao, tanto a maquiagem vermelha quanto as cores e o render. Agora a roupa eu trouxe aquela ideia mais tradicional que você passou, e escolhi as cores neutras puxadas pro quente porque também me lembram o jing yuan, adicionei um pouco do preto/cinza escuro porque dá um destaque maior e imponência, principalmente ali na faixa, achei que tinha ficado legal. Aí depois que você comentou dos tons frios na roupa eu fiquei angustiada porque já tinha feito a arte e outra surpresa que ainda tá pra ficar pronta, então quis logo mostrar e me explicar e afins.

Qualquer coisa a gente trata ela como uma barbie que tem mil roupas diferentes.

E talvez cores frias na roupa tragam uma melhor caracterização sobre a visão e história dela com relação a temperatura corporal, eu que tinha esquecido disso e fui meio burrinha, enfim. Perdão.

Pelo menos temos o branco, isso dá pra salvar KKKKKKKKKKKKKK

A arte levou alguns dias pra ficar pronta, espero que pelo menos dê pra aproveitar um pouquinho:)`
        },
        {
            title: "Carta 2",
            text: `Não tenho muitas palavras pra dizer, me expressei criando o site e desenhando então faltou palavras. Ainda faltam algumas coisas que quero só ver quanto tempo vou aguentar sem falar nada, aguardemos.`
        }
    ];

    const FADE_DURATION = 900;

    messageMusic.volume = 0.22;
    artMusic.volume = 0.55;
    musicTitle.textContent = "Lover Girl";
    musicArtist.textContent = "Laufey";

    let typingTimer = null;
    let subtitleIndex = -1;
    let subtitleTransitionTimer = null;
    let subtitleGeneration = 0;
    let audioSession = 0;
    let currentSlide = 0;
    let currentLetter = 0;
    let previousFocus = null;
    let touchStartX = null;

    function animateScene(scene) {
        // Anima textos, imagens, controles e blocos visuais toda vez que a cena aparece.
        const candidates = Array.from(scene.querySelectorAll(
            "h1, h2, h3, p, .eyebrow, .ornament, button, a, img, figure, figcaption, " +
            ".art-music-player, .message-track, .cinematic-subtitle, .gallery, .gallery-bottom, " +
            ".letter-area, .art-action-buttons, .small-note"
        ));

        candidates.forEach((element, index) => {
            if (element.closest("[hidden]") || element.classList.contains("gallery-slide") && !element.classList.contains("is-active")) return;
            if (element.animate) {
                element.animate(
                    [
                        { opacity: 0, transform: "translate3d(0, 22px, 0) scale(.985)", filter: "blur(5px)" },
                        { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)", filter: "blur(0)" }
                    ],
                    {
                        duration: 720,
                        delay: Math.min(index * 65, 850),
                        easing: "cubic-bezier(.16, 1, .3, 1)",
                        fill: "both"
                    }
                );
            }
        });
    }

    function showScene(targetScene) {
        [welcome, voiceScene, artScene].forEach((scene) => {
            scene.hidden = scene !== targetScene;
        });

        window.scrollTo({ top: 0, behavior: "auto" });
        // Aguarda a cena sair de display:none antes de disparar as animações.
        requestAnimationFrame(() => animateScene(targetScene));
    }

    function typeMessage(message, speed = 40) {
        if (typingTimer !== null) {
            clearInterval(typingTimer);
        }

        introText.textContent = "";
        continueButton.disabled = true;
        let index = 0;

        typingTimer = setInterval(() => {
            introText.textContent += message.charAt(index);
            index++;

            if (index >= message.length) {
                clearInterval(typingTimer);
                typingTimer = null;
                continueButton.disabled = false;
            }
        }, speed);
    }

    function cancelSubtitleTransition() {
        clearTimeout(subtitleTransitionTimer);
        subtitleTransitionTimer = null;
        subtitleGeneration++;
    }

    function resetVoiceScene() {
        cancelSubtitleTransition();
        subtitleIndex = -1;
        subtitle.textContent = "";
        subtitle.classList.remove("subtitle-visible");
        retryButton.hidden = true;
        revealButton.hidden = true;
    }

    function showSubtitle(index) {
        if (index < 0 || index >= subtitles.length || index === subtitleIndex) return;

        subtitleIndex = index;
        cancelSubtitleTransition();
        const generation = subtitleGeneration;
        subtitle.classList.remove("subtitle-visible");

        subtitleTransitionTimer = setTimeout(() => {
            if (generation !== subtitleGeneration) return;
            subtitle.textContent = subtitles[index].text;

            requestAnimationFrame(() => requestAnimationFrame(() => {
                if (generation === subtitleGeneration) {
                    subtitle.classList.add("subtitle-visible");
                }
            }));
        }, FADE_DURATION);
    }

    function updateSubtitle() {
        if (audio.paused || audio.ended) return;

        let index = -1;
        for (let i = 0; i < subtitles.length; i++) {
            if (audio.currentTime >= subtitles[i].time) index = i;
            else break;
        }
        if (index !== -1) showSubtitle(index);
    }

    function stopAudio(element) {
        element.pause();
        try { element.currentTime = 0; } catch (error) { /* áudio ainda não carregado */ }
    }

    function updateMusicPlayer() {
        const isPlaying = !artMusic.paused;
        musicToggleIcon.textContent = isPlaying ? "Ⅱ" : "▶";
        musicToggle.setAttribute("aria-label", isPlaying ? "Pausar música" : "Tocar música");
        vinylDisc.classList.toggle("vinyl-playing", isPlaying);
    }

    async function startAudio() {
        const session = ++audioSession;
        resetVoiceScene();
        retryButton.hidden = true;
        revealButton.hidden = true;
        stopAudio(messageMusic);
        stopAudio(audio);

        try {
            await audio.play();
            if (session !== audioSession) {
                audio.pause();
                return;
            }

            messageMusic.play().catch((error) => {
                console.warn("A música de fundo não pôde iniciar:", error);
            });
            retryButton.hidden = true;
        } catch (error) {
            if (session === audioSession) retryButton.hidden = false;
        }
    }

    continueButton.addEventListener("click", async () => {
        audioSession++;
        stopAudio(audio);
        stopAudio(messageMusic);
        stopAudio(artMusic);
        updateMusicPlayer();
        resetVoiceScene();
        showScene(voiceScene);
        await startAudio();
    });

    retryButton.addEventListener("click", async () => {
        await startAudio();
    });

    audio.addEventListener("playing", () => { retryButton.hidden = true; });
    audio.addEventListener("timeupdate", updateSubtitle);

    audio.addEventListener("ended", () => {
        stopAudio(messageMusic);
        cancelSubtitleTransition();
        subtitle.classList.remove("subtitle-visible");

        subtitleTransitionTimer = setTimeout(() => {
            subtitle.textContent = "";
            revealButton.hidden = false;
        }, FADE_DURATION);
    });

    audio.addEventListener("error", () => {
        if (!voiceScene.hidden && !audio.ended) retryButton.hidden = false;
    });

    revealButton.addEventListener("click", async () => {
        audioSession++;
        stopAudio(audio);
        stopAudio(messageMusic);
        resetVoiceScene();
        showScene(artScene);

        try {
            await artMusic.play();
        } catch (error) {
            console.warn("A música da ilustração não pôde iniciar:", error);
        }
        updateMusicPlayer();
    });

    musicToggle.addEventListener("click", async () => {
        if (artMusic.paused) {
            try { await artMusic.play(); }
            catch (error) { console.warn("Não foi possível reproduzir a música:", error); }
        } else {
            artMusic.pause();
        }
        updateMusicPlayer();
    });

    artMusic.addEventListener("play", updateMusicPlayer);
    artMusic.addEventListener("pause", updateMusicPlayer);
    artMusic.addEventListener("ended", updateMusicPlayer);

    // Galeria com transição, setas, indicadores e gesto de deslizar.
    function showSlide(index, direction = 1) {
        if (!slides.length) return;

        const nextIndex = (index + slides.length) % slides.length;
        if (nextIndex === currentSlide && slides[currentSlide].classList.contains("is-active")) return;

        const oldSlide = slides[currentSlide];
        oldSlide.classList.remove("is-active", "slide-out-left", "slide-out-right");
        oldSlide.classList.add(direction >= 0 ? "slide-out-left" : "slide-out-right");
        oldSlide.setAttribute("aria-hidden", "true");

        currentSlide = nextIndex;
        const newSlide = slides[currentSlide];
        newSlide.classList.remove("slide-out-left", "slide-out-right");
        newSlide.setAttribute("aria-hidden", "false");

        // Reinicia a transição ao trocar entre slides.
        newSlide.classList.remove("is-active");
        void newSlide.offsetWidth;
        newSlide.classList.add("is-active");

        galleryDots.forEach((dot, dotIndex) => {
            const active = dotIndex === currentSlide;
            dot.classList.toggle("is-active", active);
            dot.setAttribute("aria-pressed", String(active));
        });

        galleryCounter.textContent = `${currentSlide + 1} / ${slides.length}`;

        const image = newSlide.querySelector(".gallery-image");
        downloadArt.href = image.getAttribute("src");
        downloadArt.download = image.dataset.downloadName || "Presente-para-Alex";
        downloadArt.textContent = "Baixar imagem ↓";
    }

    galleryPrev.addEventListener("click", () => showSlide(currentSlide - 1, -1));
    galleryNext.addEventListener("click", () => showSlide(currentSlide + 1, 1));
    galleryDots.forEach((dot) => {
        dot.addEventListener("click", () => {
            const index = Number(dot.dataset.index);
            showSlide(index, index >= currentSlide ? 1 : -1);
        });
    });

    gallery.addEventListener("touchstart", (event) => {
        if (event.touches.length === 1) touchStartX = event.touches[0].clientX;
    }, { passive: true });

    gallery.addEventListener("touchend", (event) => {
        if (touchStartX === null || event.changedTouches.length !== 1) return;
        const deltaX = event.changedTouches[0].clientX - touchStartX;
        if (Math.abs(deltaX) > 45) showSlide(currentSlide + (deltaX < 0 ? 1 : -1), deltaX < 0 ? 1 : -1);
        touchStartX = null;
    }, { passive: true });

    // DOWNLOAD REAL: busca a imagem, transforma em Blob e força o salvamento.
    // Isso evita que o navegador simplesmente navegue até a imagem e a abra em tela cheia.
    downloadArt.addEventListener("click", async (event) => {
        event.preventDefault();

        const activeImage = slides[currentSlide].querySelector(".gallery-image");
        const imageUrl = activeImage.currentSrc || activeImage.src;
        const fileName = activeImage.dataset.downloadName || "Presente-para-Alex.jpg";
        const originalLabel = downloadArt.textContent;

        downloadArt.textContent = "Preparando imagem…";
        downloadArt.setAttribute("aria-busy", "true");

        try {
            const response = await fetch(imageUrl, { cache: "no-store" });
            if (!response.ok) throw new Error(`Falha ao buscar imagem (${response.status})`);

            const imageBlob = await response.blob();
            if (!imageBlob.size) throw new Error("O arquivo da imagem está vazio.");

            const objectUrl = URL.createObjectURL(imageBlob);
            const temporaryLink = document.createElement("a");
            temporaryLink.href = objectUrl;
            temporaryLink.download = fileName;
            temporaryLink.style.display = "none";
            document.body.appendChild(temporaryLink);
            temporaryLink.click();
            temporaryLink.remove();

            // Dá tempo ao navegador de iniciar o download antes de liberar o Blob.
            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
        } catch (error) {
            console.error("Não foi possível baixar a imagem:", error);
            alert("Não consegui baixar a imagem. Confira se o site está hospedado e tente novamente.");
        } finally {
            downloadArt.textContent = originalLabel;
            downloadArt.removeAttribute("aria-busy");
        }
    });


    // Ampliar imagem e voltar à página da ilustração sem sair da galeria.
    function openImageViewer(image) {
        previousFocus = document.activeElement;
        imageViewerImage.src = image.getAttribute("src");
        imageViewerImage.alt = image.alt || "Imagem ampliada";
        const caption = image.closest(".gallery-slide")?.querySelector("figcaption");
        imageViewerCaption.textContent = caption ? caption.textContent : "";
        imageViewer.hidden = false;
        document.body.classList.add("image-viewer-open");
        requestAnimationFrame(() => {
            const panel = imageViewer.querySelector(".image-viewer-panel");
            if (panel && panel.animate) panel.animate(
                [{ opacity: 0, transform: "translateY(24px) scale(.97)" }, { opacity: 1, transform: "translateY(0) scale(1)" }],
                { duration: 420, easing: "cubic-bezier(.16, 1, .3, 1)" }
            );
            imageViewerBack.focus();
        });
    }

    function closeImageViewer() {
        imageViewer.hidden = true;
        imageViewerImage.removeAttribute("src");
        document.body.classList.remove("image-viewer-open");
        if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
    }

    slides.forEach((slide) => {
        const image = slide.querySelector(".gallery-image");
        image.addEventListener("click", () => openImageViewer(image));
        image.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openImageViewer(image);
            }
        });
    });
    imageViewerBack.addEventListener("click", closeImageViewer);
    imageViewerBackdrop.addEventListener("click", closeImageViewer);

    // Cartas: a música não é pausada ao abrir ou fechar.
    function renderLetter(index) {
        currentLetter = (index + letters.length) % letters.length;
        const letter = letters[currentLetter];

        letterModalTitle.innerHTML = `${letter.title}<span class="gold"> ♡</span>`;
        letterText.textContent = letter.text;
        letterPaper.scrollTop = 0;

        letterTabs.forEach((tab, tabIndex) => {
            const active = tabIndex === currentLetter;
            tab.classList.toggle("is-active", active);
            tab.setAttribute("aria-pressed", String(active));
        });

        nextLetterButton.textContent = currentLetter === 0 ? "Ler a próxima carta →" : "Voltar à primeira carta ←";
    }

    function openLetters() {
        previousFocus = document.activeElement;
        renderLetter(0);
        letterOverlay.hidden = false;
        document.body.classList.add("modal-open");
        closeLettersButton.focus();
    }

    function closeLetters() {
        letterOverlay.hidden = true;
        document.body.classList.remove("modal-open");
        if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
    }

    openLettersButton.addEventListener("click", openLetters);
    closeLettersButton.addEventListener("click", closeLetters);
    letterBackdrop.addEventListener("click", closeLetters);

    letterTabs.forEach((tab) => {
        tab.addEventListener("click", () => renderLetter(Number(tab.dataset.letter)));
    });

    nextLetterButton.addEventListener("click", () => renderLetter(currentLetter === 0 ? 1 : 0));

    document.addEventListener("keydown", (event) => {
        if (!imageViewer.hidden) {
            if (event.key === "Escape" || event.key === "Backspace") {
                event.preventDefault();
                closeImageViewer();
            }
            return;
        }
        if (!letterOverlay.hidden) {
            if (event.key === "Escape") closeLetters();
            if (event.key === "ArrowRight") renderLetter(currentLetter + 1);
            if (event.key === "ArrowLeft") renderLetter(currentLetter - 1);
            return;
        }

        if (artScene.hidden) return;
        if (event.key === "ArrowRight") showSlide(currentSlide + 1, 1);
        if (event.key === "ArrowLeft") showSlide(currentSlide - 1, -1);
    });

    // Reiniciar a experiência.
    restartButton.addEventListener("click", () => {
        if (!letterOverlay.hidden) closeLetters();

        audioSession++;
        stopAudio(audio);
        stopAudio(messageMusic);
        stopAudio(artMusic);
        updateMusicPlayer();
        resetVoiceScene();
        showScene(welcome);
        typeMessage(originalMessage);
    });

    // Estado inicial.
    renderLetter(0);
    showSlide(0);
    resetVoiceScene();
    showScene(welcome);
    updateMusicPlayer();
    typeMessage(originalMessage);
});
