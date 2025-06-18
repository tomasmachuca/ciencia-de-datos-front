/**
 * Actualiza la interfaz de usuario con los resultados del análisis
 * @param {Object} data - Datos del análisis
 */
export function updateUI(data) {
    // Actualizar puntuación general
    document.getElementById('healthScore').textContent = data.health_score;
    
    // Actualizar información del repositorio
    document.getElementById('repoOwner').textContent = data.owner;
    document.getElementById('repoName').textContent = data.repo_name;
    
    // Actualizar barras de progreso
    updateProgressBar('codeQuality', data.metrics.code_quality);
    updateProgressBar('maintenance', data.metrics.maintenance);
    updateProgressBar('community', data.metrics.community);
    updateProgressBar('documentation', data.metrics.documentation);
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