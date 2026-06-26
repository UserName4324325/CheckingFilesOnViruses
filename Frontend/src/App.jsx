import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const ALLOWED_EXTENSIONS = [
    'doc', 'docx', 'rtf', 'odt', 'pdf', 'ppsx', 'pptx', 'ppt', 'pps', 'odp', 'xlsx', 'xls', 'ods'
];
const MAX_FILE_SIZE_MB = 256;

export default function App() {
    // view может быть 'analyzer' или 'history'
    const [currentView, setCurrentView] = useState('analyzer');

    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
    const [errorMessage, setErrorMessage] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);

    const [statistics, setStatistics] = useState({ low: 0, medium: 0, high: 0 });
    // Состояние для хранения списка истории
    const [historyData, setHistoryData] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const fileInputRef = useRef(null);

    // Функция для получения статистики с бэкенда
    const fetchStatistics = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/statisticsFiles/');
            if (response.ok) {
                const data = await response.json();
                setStatistics(data);
            }
        } catch (error) {
            console.error('Ошибка при получении статистики:', error);
        }
    };

    // Функция для получения истории проверок
    const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/history/');
            if (response.ok) {
                const data = await response.json();
                setHistoryData(data);
            }
        } catch (error) {
            console.error('Ошибка при получении истории:', error);
        } finally {
            setHistoryLoading(false);
        }
    };

    // Загружаем статистику при первой загрузке страницы
    useEffect(() => {
        fetchStatistics();
    }, []);

    // Загружаем историю при переключении на вкладку истории
    useEffect(() => {
        if (currentView === 'history') {
            fetchHistory();
        }
    }, [currentView]);

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

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:5000/api/check-file/', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Ошибка сервера (статус ${response.status})`);
            }

            setAnalysisResult(data);
            setStatus('success');
            fetchStatistics();
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

    const formatDate = (dateString) => {
        try {
            const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            return new Date(dateString).toLocaleDateString('ru-RU', options);
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div className="app-container">
            <header className="header">
                <div className="logo" onClick={() => setCurrentView('analyzer')} style={{currentView: 'pointer'}}>
                    Checking File
                </div>
                <nav className="nav-tabs">
                    <button
                        className={`nav-btn ${currentView === 'analyzer' ? 'active' : ''}`}
                        onClick={() => setCurrentView('analyzer')}
                    >
                        Сканер
                    </button>
                    <button
                        className={`nav-btn ${currentView === 'history' ? 'active' : ''}`}
                        onClick={() => setCurrentView('history')}
                    >
                        История
                    </button>
                </nav>
            </header>

            <main className="main-content">
                {currentView === 'analyzer' ? (
                    <>
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

                            <div className="stats-container">
                                <h4 className="stats-title">Статистика проверенных файлов</h4>
                                <table className="stats-table">
                                    <thead>
                                    <tr>
                                        <th>Уровень безопасности</th>
                                        <th>Проверено файлов</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr className="stat-row-low">
                                        <td><span className="stat-indicator low-indicator"></span>Низкий риск (Low)</td>
                                        <td>{statistics.low}</td>
                                    </tr>
                                    <tr className="stat-row-medium">
                                        <td><span className="stat-indicator medium-indicator"></span>Средний риск (Medium)</td>
                                        <td>{statistics.medium}</td>
                                    </tr>
                                    <tr className="stat-row-high">
                                        <td><span className="stat-indicator high-indicator"></span>Высокий риск (High)</td>
                                        <td>{statistics.high}</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="history-section">
                        <div className="history-header">
                            <h2>История проверок</h2>
                            <button className="btn-secondary btn-small" onClick={fetchHistory}>Обновить</button>
                        </div>

                        {historyLoading ? (
                            <div className="loading-zone">
                                <div className="spinner"></div>
                                <p className="loading-text">Загрузка логов сканирования...</p>
                            </div>
                        ) : historyData.length === 0 ? (
                            <div className="empty-history">
                                <p>История проверок пуста или не удалось загрузить данные.</p>
                            </div>
                        ) : (
                            <div className="history-list">
                                {historyData.map((item, index) => (
                                    <div key={index} className={`history-card risk-${item.risk_level} ${item.is_safe ? 'safe-card' : 'danger-card'}`}>
                                        <div className="history-card-header">
                                            <div className="file-meta">
                                                <span className="file-ext-badge">{item.extension || '??'}</span>
                                                <h4 className="history-filename" title={item.filename}>{item.filename}</h4>
                                            </div>
                                            <span className={`history-status-tag ${item.risk_level}`}>
                                                {item.risk_level.toUpperCase()}
                                            </span>
                                        </div>

                                        <div className="history-card-body">
                                            <div className="history-date">{formatDate(item.date)}</div>
                                            {item.details && item.details.length > 0 ? (
                                                <div className="history-details-preview">
                                                    <strong>Аномалии:</strong> {item.details.join(', ')}
                                                </div>
                                            ) : (
                                                <div className="history-details-preview clean">
                                                    Структурных аномалий не обнаружено.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <section className="features-grid">
                    <div className="feature-item">
                        <h3>Почему важно использовать антивирусный сканер?</h3>
                        <p>Сначала сканируйте, а вопросы задавайте потом. Выявляйте угрозы до того, как они проникнут на ваши устройства.</p>
                    </div>
                    <div className="feature-item">
                        <h3>Вредоносное ПО нарушает конфиденциальность.</h3>
                        <p>Сложная угроза способна получить доступ к конфиденциальной информации (например, к учетным данным или паролям), зашифровать файлы и перемещаться внутри сети.</p>
                    </div>
                    <div className="feature-item">
                        <h3>Блокируйте векторы угроз на раннем этапе</h3>
                        <p>Активировавшись, эксплойт способен распространяться между приложениями. Методы статического и структурного анализа позволяют упреждающим образом снизить этот риск.</p>
                    </div>
                </section>
            </main>

            <footer className="footer">
                <p>&copy; 2026 Программное средство анализа угроз.</p>
            </footer>
        </div>
    );
}