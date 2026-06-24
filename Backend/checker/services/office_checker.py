from oletools.olevba import VBA_Parser

def check_office_file(file):
    issues = []
    
    try:
        file_bytes = file.read()
        vba_parser = VBA_Parser(file.name, data=file_bytes)
        
        if vba_parser.detect_vba_macros():
            issues.append("обнаружен макрос VBA")
            
            for (filename, stream_path, vba_filename, vba_code) in vba_parser.extract_macros():
                dangerous_keywords = ['Shell', 'CreateObject', 'WScript', 'AutoOpen', 'Document_Open']
                for keyword in dangerous_keywords:
                    if keyword.lower() in vba_code.lower():
                        issues.append(f"опасная команда в макросе: {keyword}")
                        break
        
        vba_parser.close()
        
    except Exception as e:
        issues.append(f"ошибка при анализе: {str(e)}")
    
    is_safe = len(issues) == 0
    risk_level = "low" if is_safe else "high"
    
    return {
        "is_safe": is_safe,
        "risk_level": risk_level,
        "details": issues
    }