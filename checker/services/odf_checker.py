from odf.opendocument import load
from odf.text import P
import zipfile
import io

def check_odf_file(file):
    issues = []
    
    try:
        file_bytes = file.read()
        
        with zipfile.ZipFile(io.BytesIO(file_bytes)) as zf:
            names = zf.namelist()
            
            if any('macro' in name.lower() for name in names):
                issues.append("обнаружен макрос")
            
            if any('script' in name.lower() for name in names):
                issues.append("обнаружен скрипт")
            
            if 'content.xml' in names:
                content = zf.read('content.xml').decode('utf-8', errors='ignore')
                
                dangerous = ['macro', 'javascript', 'Shell', 'cmd.exe', 'powershell']
                for keyword in dangerous:
                    if keyword.lower() in content.lower():
                        issues.append(f"подозрительное содержимое: {keyword}")
        
    except Exception as e:
        issues.append(f"ошибка при анализе: {str(e)}")
    
    is_safe = len(issues) == 0
    risk_level = "low" if is_safe else "high"
    
    return {
        "is_safe": is_safe,
        "risk_level": risk_level,
        "details": issues
    }