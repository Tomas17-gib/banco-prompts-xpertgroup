DROP TABLE IF EXISTS prompts;

CREATE TABLE prompts (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    titulo          VARCHAR(120) NOT NULL,
    categoria       ENUM('Código', 'Testing', 'SQL', 'Documentación') NOT NULL,
    herramienta_ia  VARCHAR(60)  NOT NULL,
    descripcion     VARCHAR(500) NOT NULL,
    texto_prompt    TEXT         NOT NULL,
    creado_en       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO prompts (titulo, categoria, herramienta_ia, descripcion, texto_prompt) VALUES
('Explicar error de consola', 'Código', 'ChatGPT',
    'Cuando aparece un error que no entiendes.',
    'Explícame en palabras simples este error y cómo solucionarlo: [PEGAR ERROR]'),
('Casos de prueba unitarios', 'Testing', 'GitHub Copilot',
    'Genera pruebas con casos normales, límite y de error.',
    'Escribe pruebas unitarias con Jest para esta función: [PEGAR FUNCIÓN]'),
('Optimizar consulta SQL', 'SQL', 'Claude',
    'Revisa una consulta lenta.',
    'Analiza esta consulta, dime por qué es lenta y propón una versión optimizada: [PEGAR CONSULTA]'),
('README de proyecto', 'Documentación', 'Gemini',
    'Crea un README profesional.',
    'Redacta un README.md para el proyecto [NOMBRE] con instalación, uso y tecnologías.');