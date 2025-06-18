# Analizador de Salud de Repositorios GitHub

Una aplicación web moderna que analiza la salud de repositorios de GitHub, proporcionando métricas detalladas sobre la calidad del código, mantenimiento, comunidad y documentación.

## Características

- Interfaz moderna y responsiva con Tailwind CSS
- Análisis en tiempo real de repositorios
- Visualización detallada de métricas
- Soporte para cualquier repositorio público de GitHub
- Diseño modular y mantenible

## Tecnologías Utilizadas

- Vite (Bundler y servidor de desarrollo)
- Tailwind CSS (Estilos)
- JavaScript Moderno (ES6+)
- Chart.js (Visualización de datos)

## Requisitos Previos

- Node.js 16.x o superior
- npm 7.x o superior

## Instalación

1. Clona este repositorio:
```bash
git clone <repository-url>
cd github-repo-analyzer
```

2. Instala las dependencias:
```bash
npm install
```

## Desarrollo

Para iniciar el servidor de desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Construcción

Para construir la aplicación para producción:
```bash
npm run build
```

Los archivos generados estarán en el directorio `dist/`

## Estructura del Proyecto

```
.
├── src/
│   ├── services/        # Servicios y lógica de negocio
│   ├── utils/          # Utilidades y helpers
│   ├── styles/         # Estilos CSS
│   ├── index.html      # Página principal
│   └── main.js         # Punto de entrada
├── public/             # Archivos estáticos
├── dist/              # Archivos de construcción
├── package.json       # Dependencias y scripts
├── vite.config.js     # Configuración de Vite
├── tailwind.config.js # Configuración de Tailwind
└── postcss.config.js  # Configuración de PostCSS
```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Vista previa de la versión de producción
- `npm run lint` - Ejecuta el linter
- `npm run format` - Formatea el código

## Mejoras Futuras

- Integración con modelos de machine learning
- Métricas adicionales y análisis
- Seguimiento histórico de datos
- Parámetros de análisis personalizables
- Funcionalidad de exportación de informes

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles. 