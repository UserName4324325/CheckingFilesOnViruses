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

    const handleAnalyze = async () => {
        if (!file) return;

        setStatus('loading');
        setErrorMessage('');

        // Создаем FormData для передачи бинарных данных (файла)
        const formData = new FormData();
        formData.append('file', file); // Ключ должен быть строго 'file'

        try {
            const response = await fetch('http://localhost:5000/api/check-file/', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Ошибка сервера (статус ${response.status})`);
            }

            // Записываем полученный от бэкенда JSON
            console.log(data);
            setAnalysisResult(data);
            setStatus('success');

        } catch (error) {
            console.error('Ошибка при анализе файла:', error);
            setErrorMessage(error.message || 'Не удалось связаться с сервером проверки.');
            setStatus('error');
        }
    };

    const handleReset = () => {
        setFile(null);
        setStatus('idle');
        setErrorMessage('');
        setAnalysisResult(null);
    };

    const getRiskLabel = (level) => {
        switch (level) {
            case 'high': return 'Высокий уровень угрозы';
            case 'medium': return 'Средний уровень угрозы';
            case 'low': return 'Низкий уровень риска';
            default: return 'Неопределенный риск';
        }
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

                    {status !== 'success' && status !== 'loading' && status !== 'error' && (
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
                        <div className={`result-zone ${analysisResult.is_safe ? 'safe' : `danger risk-${analysisResult.risk_level}`}`}>
                            <div className="result-header">
                                <div className="result-title">
                                  <span className="status-badge">
                                    {analysisResult.is_safe ? '✓ Безопасно' : '✕ Опасность'}
                                  </span>
                                    <h3>
                                        {analysisResult.is_safe
                                            ? 'Документ безопасен для открытия'
                                            : getRiskLabel(analysisResult.risk_level)
                                        }
                                    </h3>
                                </div>
                                <div className="result-score">
                                    <div className="score-value">{analysisResult.risk_level.toUpperCase()}</div>
                                    <div className="score-label">Уровень риска</div>
                                </div>
                            </div>

                            <div className="result-body">
                                <p className="file-analyzed"><strong>Файл:</strong> {analysisResult.filename}</p>

                                {analysisResult.details && analysisResult.details.length > 0 ? (
                                    <div className="details-block">
                                        <strong>Обнаруженные триггеры/аномалии:</strong>
                                        <ul className="details-list">
                                            {analysisResult.details.map((detail, index) => (
                                                <li key={index}>{detail}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <p className="result-details">При парсинге структуры файла опасных объектов не обнаружено.</p>
                                )}
                            </div>

                            <div className="result-footer">
                                <button className="btn-primary" onClick={handleReset}>Проверить другой файл</button>
                            </div>
                        </div>
                    )}
                </div>

                <section className="features-grid">
                    <div className="feature-item">
                        <h3>Why is it important to use a virus scanner?</h3>
                        <p>Scan first, ask questions later. Detect threats before they breach your devices.</p>
                    </div>
                    <div className="feature-item">
                        <h3>Malware breaches privacy</h3>
                        <p>A sophisticated threat can access sensitive information such as credentials or passwords, encrypt files, and move laterally across networks.</p>
                    </div>
                    <div className="feature-item">
                        <h3>Stop threat vectors early</h3>
                        <p>Once active, an exploit can propagate across applications. Static and structural analytics mitigate this risk proactively.</p>
                    </div>
                </section>
            </main>

            <footer className="footer">
                <p>&copy; 2026 Программное средство анализа угроз.</p>
            </footer>
        </div>
    );
}