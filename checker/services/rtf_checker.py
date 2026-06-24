from striprtf.striprtf import rtf_to_text

def check_rtf_file(file):
    issues = []
    
    try:
        file_bytes = file.read()
        content = file_bytes.decode('utf-8', errors='ignore')
        
        if '\\objdata' in content or '\\object' in content:
            issues.append("обнаружен встроенный объект")
        
        if '\\bin' in content:
            issues.append("обнаружен бинарный блок данных")
            
        dangerous_keywords = ['javascript:', 'vbscript:', 'shell:', 'cmd.exe', 'powershell']
        for keyword in dangerous_keywords:
            if keyword.lower() in content.lower():
                issues.append(f"обнаружено подозрительное содержимое: {keyword}")
        
    except Exception as e:
        issues.append(f"ошибка при анализе: {str(e)}")
    
    is_safe = len(issues) == 0
    risk_level = "low" if is_safe else "high"
    
    return {
        "is_safe": is_safe,
        "risk_level": risk_level,
        "details": issues
    }