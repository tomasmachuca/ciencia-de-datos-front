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
            // Extraer probabilidad real (si existe)
            probability = getProbabilityFromResponse(response);
            if (probability !== null) {
                showHealthPrediction(results, probability);
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

// Muestra el cuadro y el gráfico de torta animado SOLO si hay probabilidad real
function showHealthPrediction(container, probability) {
    if (probability === null || isNaN(probability)) return;
    const percent = Math.round(probability * 100);
    const unhealthy = 100 - percent;

    const box = document.createElement('div');
    box.className = 'my-6 p-6 bg-green-50 border-l-4 border-green-400 rounded-lg shadow flex flex-col md:flex-row items-center gap-6';
    box.innerHTML = `
        <div class="flex-1">
            <h4 class="text-lg font-bold text-green-800 mb-2 flex items-center gap-2">
                <svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5 text-green-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 12l2 2l4-4' /></svg>
                Predicción de salud del repositorio
            </h4>
            <p class="text-green-700 text-base">Probabilidad de ser saludable: <span class="font-bold">${percent}%</span></p>
            <p class="text-gray-600 text-sm">${percent > 50 ? 'El repositorio es probablemente saludable.' : 'El repositorio podría no ser saludable.'}</p>
        </div>
        <div class="flex-1 flex justify-center items-center">
            <canvas id="healthPieChart" width="120" height="120"></canvas>
        </div>
    `;
    container.appendChild(box);

    // Gráfico de torta animado (canvas)
    setTimeout(() => {
        drawAnimatedPieChart('healthPieChart', percent, unhealthy);
    }, 300);
}

// Dibuja un gráfico de torta animado en canvas
function drawAnimatedPieChart(canvasId, healthyPercent, unhealthyPercent) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const total = healthyPercent + unhealthyPercent;
    let current = 0;
    const step = healthyPercent / 40; // animación en 40 frames

    function draw(p) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Fondo
        ctx.beginPath();
        ctx.arc(60, 60, 55, 0, 2 * Math.PI);
        ctx.fillStyle = '#e5e7eb';
        ctx.fill();
        // Saludable
        ctx.beginPath();
        ctx.moveTo(60, 60);
        ctx.arc(60, 60, 55, -0.5 * Math.PI, (-0.5 + 2 * p / 100) * Math.PI);
        ctx.closePath();
        ctx.fillStyle = '#34d399';
        ctx.fill();
        // Texto
        ctx.font = 'bold 22px sans-serif';
        ctx.fillStyle = '#065f46';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(Math.round(p) + '%', 60, 60);
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