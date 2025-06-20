/**
 * Actualiza la interfaz de usuario con los resultados del análisis
 * @param {Object} response - Datos del análisis
 */
export async function updateUI(response) {
    const results = document.getElementById('results');
    results.innerHTML = '';

    // 1. Mostrar pasos del modelo animados
    const stepsList = document.createElement('ul');
    stepsList.id = 'modelSteps';
    stepsList.className = 'mb-6 bg-white rounded-lg shadow p-4 list-decimal list-inside border border-gray-200';
    results.appendChild(stepsList);

    const modelOutput = response.model_output || '';
    const steps = modelOutput.split(/\r?\n/).filter(s => s.trim() !== '');

    let modelLoadedIndex = -1;
    let probability = null;
    let finalPrediction = extractFinalPrediction(modelOutput);

    // Mostrar pasos animados
    for (let i = 0; i < steps.length; i++) {
        await new Promise(res => setTimeout(res, 700)); // animación
        const li = document.createElement('li');
        li.textContent = steps[i];
        li.className = 'text-gray-700 text-base mb-2 transition-opacity duration-500 opacity-0';
        stepsList.appendChild(li);
        // Forzar reflow para animación
        void li.offsetWidth;
        li.classList.remove('opacity-0');
        li.classList.add('opacity-100');
        if (steps[i].toLowerCase().includes('modelo cargado exitosamente')) {
            modelLoadedIndex = i;
            probability = getProbabilityFromResponse(response);
            if (probability !== null) {
                showHealthPrediction(results, probability, finalPrediction);
            }
        }
    }

    // 2. Mostrar datos finales SOLO si existen
    const data = response.data || {};
    const repo = data.repository || {};
    const events = data.events || {};
    const hasRepo = repo.owner && repo.name;
    const hasEvents = typeof events.count !== 'undefined';

    if (hasRepo || hasEvents || data.downloaded_at || data.format || data.description) {
        const summary = document.createElement('div');
        summary.className = 'bg-blue-50 rounded-lg shadow p-6 border border-blue-200';
        summary.innerHTML = `
            <h3 class="text-xl font-bold mb-4 text-blue-800 flex items-center gap-2"><svg xmlns='http://www.w3.org/2000/svg' class='h-6 w-6 text-blue-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z' /></svg>Datos del análisis</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                ${hasRepo ? `<p><span class="font-semibold text-blue-700">Repositorio:</span> ${repo.owner}/${repo.name}</p>` : ''}
                ${repo.url ? `<p><span class="font-semibold text-blue-700">URL:</span> <a href="${repo.url}" target="_blank" class="text-blue-500 underline">${repo.url}</a></p>` : ''}
                ${hasEvents ? `<p><span class="font-semibold text-blue-700">Eventos:</span> ${events.count}</p>` : ''}
                ${events.since ? `<p><span class="font-semibold text-blue-700">Desde:</span> ${new Date(events.since).toLocaleString()}</p>` : ''}
                ${data.downloaded_at ? `<p><span class="font-semibold text-blue-700">Hasta:</span> ${new Date(data.downloaded_at).toLocaleString()}</p>` : ''}
                ${(events.file || response.filename) ? `<p><span class="font-semibold text-blue-700">Archivo generado:</span> ${events.file || response.filename}</p>` : ''}
                ${data.format ? `<p><span class="font-semibold text-blue-700">Formato:</span> ${data.format}</p>` : ''}
                ${data.description ? `<p class="md:col-span-2"><span class="font-semibold text-blue-700">Descripción:</span> ${data.description}</p>` : ''}
            </div>
        `;
        results.appendChild(summary);
    }
}

/**
 * Actualiza una barra de progreso con un nuevo valor
 * @param {string} id - ID del elemento de la barra de progreso
 * @param {number} value - Valor a mostrar (0-100)
 */
function updateProgressBar(id, value) {
    const progressBar = document.getElementById(id);
    progressBar.style.width = `${value}%`;
    progressBar.setAttribute('aria-valuenow', value);
    progressBar.textContent = `${value}%`;
}

// Extrae la probabilidad de salud desde response o model_output
function getProbabilityFromResponse(response) {
    if (response.probability !== undefined && response.probability !== null) {
        return response.probability;
    }
    // Busca la línea con "Probabilidades de [No Saludable, Saludable] de model.predict_proba()"
    const modelOutput = response.model_output || '';
    const regex = /Probabilidades de \[No Saludable, Saludable\] de model\.predict_proba\(\): \[\[([\d\.eE\-]+) ([\d\.eE\-]+)\]\]/;
    const match = modelOutput.match(regex);
    if (match && match[2]) {
        return parseFloat(match[2]); // Probabilidad de Saludable
    }
    return null;
}

// Extrae la predicción final del bloque de model_output
function extractFinalPrediction(modelOutput) {
    // Busca el bloque entre ========================= PREDICCIÓN FINAL ========================= y la siguiente =====
    const blockRegex = /PREDICCIÓN FINAL[\s\S]*?={5,}\s*([\s\S]*?)={5,}/;
    const match = modelOutput.match(blockRegex);
    if (!match || !match[1]) return null;
    const block = match[1];
    // Extrae líneas clave
    const repo = (block.match(/Repositorio:\s*(.*)/) || [])[1] || '';
    const pred = (block.match(/Predicción:\s*(.*)/) || [])[1] || '';
    const conf = (block.match(/Confianza:\s*(.*)/) || [])[1] || '';
    const interp = (block.match(/Interpretación:\s*(.*)/) || [])[1] || '';
    return { repo, pred, conf, interp };
}

// Muestra el cuadro y el gráfico de torta animado SOLO si hay probabilidad real
function showHealthPrediction(container, probability, finalPrediction = null) {
    if (probability === null || isNaN(probability)) return;
    const percent = Math.round(probability * 100);
    const unhealthy = 100 - percent;
    const isHealthy = percent > 50;

    // Contenedor responsivo
    const box = document.createElement('div');
    box.className = `my-6 p-6 ${isHealthy ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'} border-l-4 rounded-lg shadow flex flex-col md:flex-row items-center gap-6`;
    box.innerHTML = `
        <div class="flex-1 flex flex-col items-center md:items-start">
            <canvas id="healthPieChart" width="120" height="120" class="mb-2"></canvas>
        </div>
        <div class="flex-1 flex flex-col gap-2 items-center md:items-start">
            ${finalPrediction && finalPrediction.repo ? `<div class="text-xs text-gray-500 mb-1">Repositorio:</div><div class="font-semibold text-gray-800 mb-2">${finalPrediction.repo}</div>` : ''}
            ${finalPrediction && finalPrediction.pred ? `<div class="mb-1"><span class="inline-block px-2 py-1 rounded text-sm font-bold ${isHealthy ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}">${finalPrediction.pred.toUpperCase()}</span></div>` : ''}
            ${finalPrediction && finalPrediction.conf ? `<div class="mb-1 text-gray-700">Confianza: <span class="font-semibold">${finalPrediction.conf}</span></div>` : ''}
            ${finalPrediction && finalPrediction.interp ? `<div class="text-gray-700 text-sm mt-2">${finalPrediction.interp}</div>` : ''}
        </div>
    `;
    container.appendChild(box);

    // Gráfico de torta animado (canvas)
    setTimeout(() => {
        drawAnimatedPieChart('healthPieChart', percent, unhealthy, isHealthy);
    }, 300);
}

// Dibuja un gráfico de torta animado en canvas
function drawAnimatedPieChart(canvasId, healthyPercent, unhealthyPercent, isHealthy = true) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const total = healthyPercent + unhealthyPercent;
    let current = 0;
    const step = healthyPercent / 40; // animación en 40 frames
    const color = isHealthy ? '#34d399' : '#ef4444'; // verde o rojo
    const textColor = isHealthy ? '#065f46' : '#991b1b';
    const label = isHealthy ? 'Saludable' : 'Poco saludable';

    function draw(p) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Fondo
        ctx.beginPath();
        ctx.arc(60, 60, 55, 0, 2 * Math.PI);
        ctx.fillStyle = '#e5e7eb';
        ctx.fill();
        // Saludable o no saludable
        ctx.beginPath();
        ctx.moveTo(60, 60);
        ctx.arc(60, 60, 55, -0.5 * Math.PI, (-0.5 + 2 * p / 100) * Math.PI);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        // Porcentaje
        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(Math.round(p) + '%', 60, 54);
        // Predicción textual
        ctx.font = 'bold 13px sans-serif';
        ctx.fillStyle = textColor;
        ctx.fillText(label, 60, 75);
    }

    function animate() {
        if (current < healthyPercent) {
            current += step;
            draw(current);
            requestAnimationFrame(animate);
        } else {
            draw(healthyPercent);
        }
    }
    animate();
} 