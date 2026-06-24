import React, { useState, useRef } from 'react';
import './App.css';


const ALLOWED_EXTENSIONS = [
    'doc', 'docx', 'rtf', 'odt', 'pdf', 'ppsx', 'pptx', 'ppt', 'pps', 'odp', 'xlsx', 'xls', 'ods'
];
const MAX_FILE_SIZE_MB = 256;

export default function App() {
    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
    const [errorMessage, setErrorMessage] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);

    const fileInputRef = useRef(null);

    const validateAndSetFile = (selectedFile) => {
        if (!selectedFile) return;

        const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
        const fileSizeMB = selectedFile.size / (1024 * 1024);

        if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
            setErrorMessage(`Неподдерживаемый формат файла. Разрешены только: ${ALLOWED_EXTENSIONS.join(', ')}`);
            setStatus('error');
            setFile(null);
            return;
        }

        if (fileSizeMB > MAX_FILE_SIZE_MB) {
            setErrorMessage(`Файл слишком большой. Максимальный размер: ${MAX_FILE_SIZE_MB} МБ.`);
            setStatus('error');
            setFile(null);
            return;
        }

        setFile(selectedFile);
        setStatus('idle');
        setErrorMessage('');
        setAnalysisResult(null);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const triggerSelect = () => {
        fileInputRef.current.click();
    };

    const handleAnalyze = () => {
        if (!file) return;

        setStatus('loading');

        // Имитация анализа файла
        setTimeout(() => {
            // Для демонстрации: если в названии есть "virus" или "malware", триггерим предупреждение
            const isSuspicious = file.name.toLowerCase().includes('virus') || file.name.toLowerCase().includes('malware');

            if (isSuspicious) {
                setAnalysisResult({
                    safe: false,
                    score: 18, // рейтинг безопасности из 100
                    verdict: 'Обнаружены аномалии структуры данных',
                    details: 'Файл содержит скрытые макросы, нетипичные для стандартных документов, или подозрительные внешние ссылки, характерные для методов социальной инженерии.'
                });
            } else {
                setAnalysisResult({
                    safe: true,
                    score: 98,
                    verdict: 'Документ безопасен для открытия',
                    details: 'Структурный и поведенческий анализ не выявил эксплойтов, скрытых скриптов или деструктивных макросов. Целостность контейнера не нарушена.'
                });
            }
            setStatus('success');
        }, 2500);
    };

    const handleReset = () => {
        setFile(null);
        setStatus('idle');
        setErrorMessage('');
        setAnalysisResult(null);
    };

    return (
        <div className="app-container">
            <header className="header">
                <div className="logo">
                    Checking File
                </div>
            </header>

            <main className="main-content">
                <section className="intro-section">
                    <h1>Безопасная среда работы с документами</h1>
                    <p>
                        Проверьте подозрительные файлы на наличие вредоносных программ и вирусов. Сканируйте документы разных форматов.
                        Убедитесь, что ваши файлы безопасны и не содержат вирусов с помощью сканера вирусов Checking File.
                    </p>
                </section>

                <div className="analyzer-card">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept={ALLOWED_EXTENSIONS.map(ext => `.${ext}`).join(',')}
                        className="hidden-input"
                    />

                    {status !== 'success' && status !== 'loading' && (
                        <div
                            className={`drop-zone ${dragActive ? 'active' : ''}`}
                            onDragEnter={handleDrag}
                            onDragOver={handleDrag}
                            onDragLeave={handleDrag}
                            onDrop={handleDrop}
                            onClick={triggerSelect}
                        >
                            <div className="upload-icon">📂</div>
                            {file ? (
                                <div className="file-info-preview">
                                    <p className="file-name">{file.name}</p>
                                    <p className="file-size">{(file.size / (1024 * 1024)).toFixed(2)} МБ</p>
                                </div>
                            ) : (
                                <div className="drop-zone-text">
                                    <p className="primary-text">Перетащите файл сюда или <span>выберите на устройстве</span></p>
                                    <p className="secondary-text">Документы до 256 МБ: PDF, DOCX, XLSX, PPTX, RTF и др.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {status === 'loading' && (
                        <div className="loading-zone">
                            <div className="spinner"></div>
                            <p className="loading-text">Интеллектуальный анализ структуры контейнера...</p>
                            <p className="loading-subtext">Проверяются макросы, метаданные и скрытые OLE-объекты</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="error-message">
                            <span className="error-icon">⚠️</span>
                            <p>{errorMessage}</p>
                            <button className="btn-secondary" onClick={handleReset}>Попробовать снова</button>
                        </div>
                    )}

                    {file && status === 'idle' && (
                        <div className="action-bar">
                            <button className="btn-primary" onClick={handleAnalyze}>Запустить проверку</button>
                            <button className="btn-secondary" onClick={handleReset}>Сбросить</button>
                        </div>
                    )}

                    {status === 'success' && analysisResult && (
                        <div className={`result-zone ${analysisResult.safe ? 'safe' : 'danger'}`}>
                            <div className="result-header">
                                <div className="result-title">
                                  <span className="status-badge">
                                    {analysisResult.safe ? '✓ Безопасно' : '✕ Опасность'}
                                  </span>
                                    <h3>{analysisResult.verdict}</h3>
                                </div>
                                <div className="result-score">
                                    <div className="score-value">{analysisResult.score}%</div>
                                    <div className="score-label">Индекс безопасности</div>
                                </div>
                            </div>

                            <div className="result-body">
                                <p className="file-analyzed"><strong>Файл:</strong> {file.name}</p>
                                <p className="result-details">{analysisResult.details}</p>
                            </div>

                            <div className="result-footer">
                                <button className="btn-primary" onClick={handleReset}>Проверить другой файл</button>
                            </div>
                        </div>
                    )}
                </div>

                <section className="features-grid">
                    <div className="feature-item">
                        <h3>Почему важно использовать сканер вирусов?</h3>
                        <p>Сначала сканируйте, потом задавайте вопросы. Выявляйте вирусы до того, как они проникнут на ваши устройства.</p>
                    </div>
                    <div className="feature-item">
                        <h3>Вирусы нарушают конфиденциальность</h3>
                        <p>
                            Сильный вирус может получить доступ к конфиденциальной информации, такой какучетные данные или пароли,
                            зашифровать и заблокировать доступ к данным и даже атаковать другие устройства в подключенных сетях.
                        </p>
                    </div>
                    <div className="feature-item">
                        <h3>Остановите вредоносное ПО до того, как оно нанесет вред вам</h3>
                        <p>
                            Как только вирус распространился, он может беспрепятственно заразить все программы и приложения.
                            Вот почему крайне важно использовать сканер на наличие вирусов.
                        </p>
                    </div>
                </section>
            </main>

            <footer className="footer">
                <p>&copy; 2026 Программное средство анализа угроз.</p>
            </footer>
        </div>
    );
}