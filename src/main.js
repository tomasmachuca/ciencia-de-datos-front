import './styles/main.css';
import { downloadEvents } from './services/api';
import { updateUI } from './utils/ui';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('repoForm');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const error = document.getElementById('error');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset UI
        loading.classList.remove('hidden');
        results.classList.add('hidden');
        error.classList.add('hidden');
        
        const repoUrl = document.getElementById('repoUrl').value;
        
        try {
            const analysisResult = await downloadEvents(repoUrl);
            console.log('Respuesta del backend:', analysisResult);
            updateUI(analysisResult);
            
            // Show results
            loading.classList.add('hidden');
            results.classList.remove('hidden');
            
        } catch (err) {
            loading.classList.add('hidden');
            error.textContent = err.message || 'Ocurrió un error al analizar el repositorio.';
            error.classList.remove('hidden');
        }
    });
}); 